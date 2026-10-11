import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GeoRoutingEngine } from "@/services/geoRoutingEngine";

const routeRequestSchema = z.object({
  startLat: z.number().min(-90).max(90),
  startLng: z.number().min(-180).max(180),
  destLat: z.number().min(-90).max(90),
  destLng: z.number().min(-180).max(180),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = routeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid coordinates provided", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { startLat, startLng, destLat, destLng } = parsed.data;

    const route = await GeoRoutingEngine.getRoadRoute(
      startLat,
      startLng,
      destLat,
      destLng
    );

    return NextResponse.json({
      success: true,
      route,
    });
  } catch (error: any) {
    console.error("[API routing error]:", error);
    return NextResponse.json(
      { error: "Failed to calculate road route", message: error.message },
      { status: 500 }
    );
  }
}
