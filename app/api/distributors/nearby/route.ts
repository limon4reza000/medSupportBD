import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/mockDb";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().min(0).max(100).default(20),
  medicineId: z.string().optional(),
  search: z.string().optional(),
  inStockOnly: z.enum(["true", "false"]).optional(),
  sortBy: z.enum(["distance", "price", "stock", "delivery"]).default("distance"),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      lat: searchParams.get("lat") || undefined,
      lng: searchParams.get("lng") || undefined,
      radiusKm: searchParams.get("radiusKm") || undefined,
      medicineId: searchParams.get("medicineId") || undefined,
      search: searchParams.get("search") || searchParams.get("q") || undefined,
      inStockOnly: searchParams.get("inStockOnly") || undefined,
      sortBy: searchParams.get("sortBy") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      lat = 23.7465, // Default to registered Dhanmondi pharmacy coordinates
      lng = 90.376,
      radiusKm,
      medicineId,
      search,
      inStockOnly,
      sortBy,
    } = parsed.data;

    const results = db.searchNearbyDistributors(lat, lng, radiusKm, {
      medicineId,
      search,
      inStockOnly: inStockOnly === "true",
      sortBy,
    });

    return NextResponse.json({
      success: true,
      userLocation: { latitude: lat, longitude: lng },
      radiusKm,
      sortBy,
      totalFound: results.length,
      distributors: results,
    });
  } catch (error: any) {
    console.error("[API nearby distributors error]:", error);
    return NextResponse.json(
      { error: "Internal server error fetching nearby distributors", message: error.message },
      { status: 500 }
    );
  }
}
