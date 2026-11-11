import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pharmacyId = "pharm-01", items, paymentMethod = "CREDIT" } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { isValid: false, error: "Validation requires at least one checkout item." },
        { status: 400 }
      );
    }

    const pharmacy = db.getPharmacy(pharmacyId);
    if (!pharmacy) {
      return NextResponse.json(
        { isValid: false, error: `Pharmacy '${pharmacyId}' not found.` },
        { status: 404 }
      );
    }

    // 1. DGDA Drug License Check
    if (pharmacy.isCreditBlocked) {
      return NextResponse.json(
        {
          isValid: false,
          error: "Checkout blocked. Your DGDA Drug License is suspended or expired. Please update compliance records.",
          code: "DGDA_COMPLIANCE_BLOCKED",
        },
        { status: 422 }
      );
    }

    // 2. Aggregate Items by Manufacturer
    const companyTotals = new Map<string, { companyName: string; subtotal: number; itemsCount: number }>();
    let grossTotal = 0;

    for (const item of items) {
      const med = db.getMedicine(item.medicineId);
      if (!med) {
        return NextResponse.json(
          { isValid: false, error: `Medicine '${item.medicineId}' not found in catalog.` },
          { status: 400 }
        );
      }

      const mfg = med.manufacturer || "General Pharmaceuticals";
      const unitType = item.unitType || "BOX";
      const stripsPerBox = med.stripsPerBox || 10;
      const piecesPerStrip = med.piecesPerStrip || 10;
      const totalUnits = stripsPerBox * piecesPerStrip;

      const unitPrice = unitType === "BOX"
        ? (med.tradePricePerBox || med.tradePricePerPiece * totalUnits)
        : unitType === "STRIP"
        ? med.tradePricePerPiece * piecesPerStrip
        : med.tradePricePerPiece;

      const lineTotal = Number((unitPrice * item.quantity).toFixed(2));
      grossTotal += lineTotal;

      const current = companyTotals.get(mfg) || { companyName: mfg, subtotal: 0, itemsCount: 0 };
      current.subtotal = Number((current.subtotal + lineTotal).toFixed(2));
      current.itemsCount += item.quantity;
      companyTotals.set(mfg, current);
    }

    const chemistDiscount = Number((grossTotal * 0.03).toFixed(2));
    const netPayable = Number((grossTotal - chemistDiscount).toFixed(2));

    const availableCredit = Number((pharmacy.creditLimit - pharmacy.currentBalance).toFixed(2));
    const warnings: string[] = [];
    const companiesReport: any[] = [];

    // 3. Validate each company cluster
    for (const [mfg, data] of companyTotals.entries()) {
      const minOrder = mfg.includes("Beximco") ? 2000 : mfg.includes("Square") ? 2000 : 1500;
      const isMovMet = data.subtotal >= minOrder;

      if (!isMovMet) {
        warnings.push(`${mfg} subtotal (৳${data.subtotal}) is below minimum order requirement of ৳${minOrder}.`);
      }

      // Check credit sufficiency per company
      const isCreditSufficient = paymentMethod !== "CREDIT" || availableCredit >= data.subtotal;
      if (paymentMethod === "CREDIT" && !isCreditSufficient) {
        warnings.push(`Order total for ${mfg} (৳${data.subtotal}) exceeds available credit of ৳${availableCredit}.`);
      }

      const assignedDepot = mfg.includes("Beximco")
        ? "Beximco Central Depot - Tejgaon"
        : mfg.includes("Square")
        ? "Square Tongi Central Distribution Hub"
        : "Dhaka Central Pharmaceutical Depot";

      companiesReport.push({
        companyId: `comp-${mfg.toLowerCase().replace(/\s+/g, "")}`,
        companyName: mfg,
        subtotal: data.subtotal,
        isMovMet,
        minimumOrderAmount: minOrder,
        creditAvailable: availableCredit,
        isCreditSufficient,
        assignedDepot,
        estimatedDelivery: "Today by 6:00 PM (Direct Cold-Chain Route)",
      });
    }

    const isValid = warnings.length === 0;

    return NextResponse.json({
      isValid,
      success: true,
      warnings,
      companies: companiesReport,
      pharmacy: {
        id: pharmacy.id,
        tradeName: pharmacy.tradeName,
        drugLicenseNo: pharmacy.drugLicenseNo,
        creditLimit: pharmacy.creditLimit,
        availableCredit,
      },
      grossTotal: Number(grossTotal.toFixed(2)),
      chemistDiscount,
      discountPercent: 3.0,
      netPayable,
    });
  } catch (err: any) {
    return NextResponse.json(
      { isValid: false, success: false, error: err.message || "Checkout validation failed." },
      { status: 500 }
    );
  }
}
