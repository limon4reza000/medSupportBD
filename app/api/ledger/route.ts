import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pharmacyId = searchParams.get("pharmacyId");

  if (pharmacyId) {
    const entries = db.ledgerEntries.filter((e) => e.pharmacyId === pharmacyId);
    return NextResponse.json(entries);
  }

  return NextResponse.json(db.ledgerEntries);
}
