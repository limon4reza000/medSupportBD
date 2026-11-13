import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const search = (searchParams.get("search") || "").toLowerCase().trim();
    const exportFormat = searchParams.get("export");

    let medicines = db.medicines;

    if (companyId && companyId !== "ALL") {
      medicines = medicines.filter((m) =>
        m.manufacturer.toLowerCase().includes(companyId.toLowerCase())
      );
    }

    if (search) {
      medicines = medicines.filter(
        (m) =>
          m.brandName.toLowerCase().includes(search) ||
          m.genericName.toLowerCase().includes(search) ||
          m.manufacturer.toLowerCase().includes(search)
      );
    }

    const priceList = medicines.slice(0, 300).map((m) => {
      const pcsPerStrip = m.piecesPerStrip || 10;
      const stripsPerBox = m.stripsPerBox || 10;
      const totalPcs = pcsPerStrip * stripsPerBox;
      const unitMrp = Number(m.mrpPerPiece) || 0;
      const unitTp = Number(m.tradePricePerPiece) || 0;
      const boxMrp = Number((unitMrp * totalPcs).toFixed(2));
      const boxTp = Number((unitTp * totalPcs).toFixed(2));
      const margin = unitMrp > 0 ? Number((((unitMrp - unitTp) / unitMrp) * 100).toFixed(1)) : 16.7;

      return {
        id: m.id,
        brandName: m.brandName,
        genericName: m.genericName,
        dosageForm: m.dosageForm,
        strength: m.strength,
        manufacturer: m.manufacturer,
        packSize: `${stripsPerBox} Strips × ${pcsPerStrip} Pieces (${totalPcs}s)`,
        unitTradePrice: unitTp,
        unitMrp,
        boxTradePrice: boxTp,
        boxMrp,
        marginPercent: margin,
        vatPercent: 2.4,
      };
    });

    if (exportFormat === "csv") {
      const headers = [
        "Brand Name",
        "Generic Name",
        "Dosage Form",
        "Strength",
        "Manufacturer",
        "Pack Size",
        "Unit TP (BDT)",
        "Unit MRP (BDT)",
        "Box TP (BDT)",
        "Box MRP (BDT)",
        "Margin (%)",
        "VAT (%)",
      ];

      const csvRows = [headers.join(",")];

      for (const row of priceList) {
        csvRows.push(
          [
            `"${row.brandName}"`,
            `"${row.genericName}"`,
            `"${row.dosageForm}"`,
            `"${row.strength}"`,
            `"${row.manufacturer}"`,
            `"${row.packSize}"`,
            row.unitTradePrice,
            row.unitMrp,
            row.boxTradePrice,
            row.boxMrp,
            row.marginPercent,
            row.vatPercent,
          ].join(",")
        );
      }

      return new NextResponse(csvRows.join("\n"), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="MedGo_Price_List_${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      count: priceList.length,
      priceList,
    });
  } catch (error: any) {
    console.error("Failed to fetch price list:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate price list" },
      { status: 500 }
    );
  }
}
