import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const depotId = searchParams.get("depotId") || undefined;
    const vehicleId = searchParams.get("vehicleId");

    if (vehicleId) {
      const vehicle = db.getDeliveryVehicle(vehicleId);
      if (!vehicle) {
        return NextResponse.json(
          { error: "Vehicle not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        vehicle,
      });
    }

    const liveVehicles = db.getLiveDeliveryVehicles(depotId);

    return NextResponse.json({
      success: true,
      totalActive: liveVehicles.length,
      vehicles: liveVehicles,
    });
  } catch (error: any) {
    console.error("[API live tracking error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch live delivery vehicles", message: error.message },
      { status: 500 }
    );
  }
}
