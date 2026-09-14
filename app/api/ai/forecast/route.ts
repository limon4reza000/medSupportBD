import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";
import { BatchFifoEngine } from "@/services/batchFifoEngine";
import { PackagingEngine } from "@/services/packagingEngine";
import { DemandForecastResponseSchema, PackagingUnit } from "@/types/domain";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pharmacyId = searchParams.get("pharmacyId") || "pharm-01";

    const pharmacy = db.getPharmacy(pharmacyId);
    if (!pharmacy) {
      return NextResponse.json({ error: "Pharmacy not found" }, { status: 404 });
    }

    // Historical 30-day simulated consumption patterns with seasonal disease spike coefficients
    const recommendations = db.medicines.map((med) => {
      const batches = db.getBatchesForMedicine(med.id);
      const currentStockUnits = BatchFifoEngine.getTotalAvailableStock(batches);

      let historical30Day = 1200;
      let seasonalMultiplier = 1.0;
      let seasonalFactors: string[] = [];
      let aiRationale = "";

      // Disease spike heuristics
      if (med.genericName.includes("Paracetamol")) {
        historical30Day = 2400; // high volume
        seasonalMultiplier = 1.45; // Monsoon fever & Dengue outbreak surge (+45%)
        seasonalFactors = ["Monsoon Rainfall Spikes", "Dengue & Viral Fever Surge", "Post-Eid Seasonal Influx"];
        aiRationale = `High fever incidence detected across ${pharmacy.thana} area. 30-day consumption velocity rose by 45%. Immediate buffer restock recommended.`;
      } else if (med.genericName.includes("Montelukast") || med.genericName.includes("Fexofenadine")) {
        historical30Day = 850;
        seasonalMultiplier = 1.30; // Seasonal allergic rhinitis & bronchial irritation
        seasonalFactors = ["Seasonal Weather Transition", "Air Particulate Index Rise"];
        aiRationale = `Asthma and allergy prescriptions elevated by 30%. Stock buffer should be increased to prevent stock-out during sudden weather shifts.`;
      } else if (med.genericName.includes("Omeprazole") || med.genericName.includes("Esomeprazole")) {
        historical30Day = 1600;
        seasonalMultiplier = 1.15;
        seasonalFactors = ["Dietary Stress Periods", "Steady Year-Round Demand"];
        aiRationale = `Consistent high baseline velocity with 15% uptick. Standard weekly replenishment recommended.`;
      } else if (med.genericName.includes("Azithromycin") || med.genericName.includes("Ciprofloxacin")) {
        historical30Day = 450;
        seasonalMultiplier = 1.25;
        seasonalFactors = ["Upper Respiratory Tract Infection Surge"];
        aiRationale = `Moderate increase in antibiotic prescription memo clippings. Ensure minimum 2-week safety reserve.`;
      }

      const predictedDemand = Math.round(historical30Day * seasonalMultiplier);
      const dailyConsumption = predictedDemand / 30;
      const leadTimeDays = 3; // 3 days depot delivery cycle
      const safetyStockDays = 7; // 7 days safety buffer
      const safetyStockUnits = Math.round(dailyConsumption * safetyStockDays);
      const reorderPoint = Math.round(dailyConsumption * leadTimeDays + safetyStockUnits);

      // Deficit calculation
      const netDeficitUnits = Math.max(0, predictedDemand + safetyStockUnits - currentStockUnits);
      
      // Convert loose deficit into standardized Box units
      const piecesPerBox = med.piecesPerStrip * med.stripsPerBox;
      const recommendedBoxes = Math.ceil(netDeficitUnits / piecesPerBox);

      let riskLevel: "CRITICAL_STOCKOUT" | "LOW_STOCK" | "OPTIMAL" | "OVERSTOCKED" = "OPTIMAL";
      if (currentStockUnits <= 0) {
        riskLevel = "CRITICAL_STOCKOUT";
      } else if (currentStockUnits < reorderPoint) {
        riskLevel = "LOW_STOCK";
      } else if (currentStockUnits > predictedDemand * 1.8) {
        riskLevel = "OVERSTOCKED";
      }

      return {
        medicine_id: med.id,
        brand_name: med.brandName,
        generic_name: med.genericName,
        dosage_form: med.dosageForm,
        historical_30_day_consumption: historical30Day,
        current_stock_units: currentStockUnits,
        predicted_30_day_demand: predictedDemand,
        safety_stock_units: safetyStockUnits,
        reorder_point: reorderPoint,
        recommended_order_boxes: recommendedBoxes,
        seasonal_multiplier: seasonalMultiplier,
        risk_level: riskLevel,
        seasonal_spike_factors: seasonalFactors,
        ai_rationale: aiRationale,
      };
    });

    const totalRecommendedInvestment = recommendations.reduce((sum, item) => {
      const med = db.getMedicine(item.medicine_id);
      if (!med) return sum;
      const loosePieces = PackagingEngine.calculateLooseUnits(med, PackagingUnit.BOX, item.recommended_order_boxes);
      return sum + loosePieces * Number(med.tradePricePerPiece);
    }, 0);

    const payload = {
      pharmacy_id: pharmacy.id,
      generated_at: new Date().toISOString(),
      forecast_horizon_days: 30,
      recommendations,
      total_recommended_investment: Number(totalRecommendedInvestment.toFixed(2)),
    };

    const validated = DemandForecastResponseSchema.parse(payload);
    return NextResponse.json(validated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate AI demand forecast" },
      { status: 500 }
    );
  }
}
