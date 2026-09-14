import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mockDb";
import { PackagingUnit, SlipParserResponseSchema } from "@/types/domain";

// Helper function to calculate Levenshtein distance for fuzzy matching drug names
function getLevenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: bn + 1 }, (_, i) => [i]);
  for (let j = 0; j <= an; j++) matrix[0][j] = j;
  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1).toLowerCase() === a.charAt(j - 1).toLowerCase()) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          )
        );
      }
    }
  }
  return matrix[bn][an];
}

// Helper to find best catalog match for extracted medicine name
function matchCatalogMedicine(extractedName: string, catalog: typeof db.medicines) {
  let bestMatch: (typeof catalog)[0] | null = null;
  let highestSimilarity = 0;

  const normalizedExtracted = extractedName.toLowerCase().replace(/[^a-z0-9]/g, "");

  for (const med of catalog) {
    const brandNorm = med.brandName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const genericNorm = med.genericName.toLowerCase().replace(/[^a-z0-9]/g, "");

    // Exact or substring match
    if (brandNorm === normalizedExtracted || normalizedExtracted.includes(brandNorm) || brandNorm.includes(normalizedExtracted)) {
      return { medicine: med, confidence: 0.98 };
    }

    // Levenshtein fuzzy similarity
    const maxLen = Math.max(brandNorm.length, normalizedExtracted.length);
    const dist = getLevenshteinDistance(brandNorm, normalizedExtracted);
    const similarity = 1 - dist / maxLen;

    if (similarity > highestSimilarity && similarity >= 0.55) {
      highestSimilarity = similarity;
      bestMatch = med;
    }

    // Also check generic similarity
    const genDist = getLevenshteinDistance(genericNorm, normalizedExtracted);
    const genSimilarity = 1 - genDist / Math.max(genericNorm.length, normalizedExtracted.length);
    if (genSimilarity > highestSimilarity && genSimilarity >= 0.65) {
      highestSimilarity = genSimilarity;
      bestMatch = med;
    }
  }

  return { medicine: bestMatch, confidence: Number(highestSimilarity.toFixed(2)) };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { imageBase64, memoText } = body;

    let rawText = memoText || "";

    // If an image was passed (or simulated prescription upload)
    if (imageBase64 && !memoText) {
      // In production with OPENAI_API_KEY / ANTHROPIC_API_KEY:
      // Calls GPT-4o / Claude Vision with structured JSON schema.
      // Here we provide the intelligent clinical parser fallback simulation.
      rawText = `
        Rx Memo:
        1. Napa Extra (500mg) - 5 Box (1+0+1)
        2. Seclo 20 Cap - 20 Strips for gastric
        3. Monas 10 tab - 3 Box
        4. Ace Plus - 10 Box (for fever stock)
        5. Zimax 500 - 2 Box
      `;
    }

    if (!rawText.trim()) {
      return NextResponse.json(
        { error: "No prescription image or memo text provided for parsing." },
        { status: 400 }
      );
    }

    // Parse lines from raw prescription text
    const lines = rawText
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0 && !l.toLowerCase().startsWith("rx"));

    const parsedItems = [];
    let totalConfidence = 0;
    let unmatchedCount = 0;

    for (const line of lines) {
      // 1. Strip leading item numbering like "1.", "1)", "1 -", etc.
      const lineWithoutLeadingNum = line.replace(/^\s*\d+[\.\)\-:\s]\s*/, "").trim();

      // 2. Extract quantity and packaging unit
      // Examples: "Napa Extra - 10 Box", "Seclo 20 - 20 Strips", "10 Boxes Napa Extra", "Monas 10 tab - 3 Box"
      const qtyUnitMatch =
        lineWithoutLeadingNum.match(/(\d+)\s*(box|boxes|strip|strips|pcs|piece|pieces|tab|tablets|cap|capsules)?/i) ||
        line.match(/(\d+)\s*(box|boxes|strip|strips|pcs|piece|pieces|tab|tablets|cap|capsules)?/i);

      let qty = 1;
      let packagingType: PackagingUnit = PackagingUnit.BOX;

      if (qtyUnitMatch) {
        qty = parseInt(qtyUnitMatch[1], 10) || 1;
        const unitWord = (qtyUnitMatch[2] || "").toLowerCase();
        if (unitWord.includes("strip")) {
          packagingType = PackagingUnit.STRIP;
        } else if (unitWord.includes("pc") || unitWord.includes("piece") || unitWord.includes("tab") || unitWord.includes("cap")) {
          packagingType = PackagingUnit.PIECE;
        } else {
          packagingType = PackagingUnit.BOX;
        }
      }

      // Clean the line to isolate the medicine brand name
      const cleanedName = lineWithoutLeadingNum
        .replace(/\b\d+\s*(box|boxes|strip|strips|pcs|piece|pieces|tab|tablets|cap|capsules)\b/gi, "")
        .replace(/\b(box|boxes|strip|strips|pcs|piece|pieces|tab|tablets|cap|capsules|for|stock|gastric|fever|rx|memo|tab\.|cap\.)\b/gi, "")
        .replace(/[\(\)\-\:\+x]/g, " ")
        .replace(/\d+mg/gi, "")
        .trim();

      const candidateName = cleanedName || line;
      const { medicine, confidence } = matchCatalogMedicine(candidateName, db.medicines);

      if (medicine) {
        const itemConfidence = Math.max(0.75, confidence);
        totalConfidence += itemConfidence;
        parsedItems.push({
          brand_name: medicine.brandName,
          generic: medicine.genericName,
          qty,
          packaging_type: packagingType,
          confidence_score: Number(itemConfidence.toFixed(2)),
          matched_medicine_id: medicine.id,
          matched_brand_name: medicine.brandName,
          unit_price: Number(medicine.tradePricePerPiece),
          notes: `Matched from slip text: "${line}" (Catalog: ${medicine.strength})`,
        });
      } else {
        unmatchedCount++;
        const itemConfidence = 0.45;
        totalConfidence += itemConfidence;
        parsedItems.push({
          brand_name: candidateName || "Unknown Compound",
          generic: undefined,
          qty,
          packaging_type: packagingType,
          confidence_score: itemConfidence,
          matched_medicine_id: null,
          matched_brand_name: null,
          unit_price: 0,
          notes: `Unmatched catalog entity: "${line}"`,
        });
      }
    }

    const overallConfidence = parsedItems.length > 0 
      ? Number((totalConfidence / parsedItems.length).toFixed(2))
      : 0;

    const responsePayload = {
      success: true,
      raw_extracted_text: rawText,
      parsed_items: parsedItems,
      overall_confidence: overallConfidence,
      unmatched_items_count: unmatchedCount,
      processing_time_ms: Date.now() - startTime,
    };

    // Strict Zod Output Schema Validation
    const validatedData = SlipParserResponseSchema.parse(responsePayload);

    return NextResponse.json(validatedData);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to parse slip with AI engine",
      },
      { status: 500 }
    );
  }
}
