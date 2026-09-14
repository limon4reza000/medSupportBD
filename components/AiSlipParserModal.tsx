"use client";

import React, { useState } from "react";
import { IMedicine, ISlipParserResponse, PackagingUnit } from "@/types/domain";
import {
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { CartItem } from "./OrderCuttingTerminal";

interface AiSlipParserModalProps {
  medicines: IMedicine[];
  onImportToCart: (items: CartItem[]) => void;
}

const SAMPLE_MEMO_PRESETS = [
  {
    title: "Prescription Slip: Monsoon Fever & Pain Memo",
    text: `Dr. K. Zaman, MBBS, FCPS (Medicine)
Patient: Tareq Hossain (Age: 34)
Date: 14/09/2026

Rx
1. Tab. Napa Extra (500mg) - 5 Box (1+0+1 after meal)
2. Tab. Monas 10mg - 3 Box (0+0+1 at bedtime)
3. Cap. Seclo 20mg - 20 Strips (1+0+1 before meal)
4. Tab. Ace Plus - 4 Box
5. Tab. Zimax 500mg - 2 Box (1+0+0 for 5 days)`,
  },
  {
    title: "Pharmacy WhatsApp Memo Note (Rough Text)",
    text: `bhai send urgently to dhanmondi branch:
- 10 box napa extra
- 15 strips sergel 20
- 4 box fexo 120
- 2 box ciprocin 500
- 3 box ace plus`,
  },
  {
    title: "Clinic Respiratory & Allergy Slip",
    text: `Rx:
- Monas 10 tab - 5 boxes
- Fexo 120 tab - 6 boxes
- Napa Extra - 8 boxes
- Seclo 20 cap - 10 boxes`,
  },
];

export const AiSlipParserModal: React.FC<AiSlipParserModalProps> = ({
  medicines,
  onImportToCart,
}) => {
  const [memoText, setMemoText] = useState(SAMPLE_MEMO_PRESETS[0].text);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ISlipParserResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    if (!memoText.trim()) return;
    setIsParsing(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/slip-parser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memoText }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Failed to parse slip with AI model");
      } else {
        setParseResult(json);
      }
    } catch (err: any) {
      setError(err.message || "Failed to communicate with AI Slip Parser.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleTransferToCart = () => {
    if (!parseResult || !parseResult.parsed_items) return;

    const cartItems: CartItem[] = [];

    for (const item of parseResult.parsed_items) {
      if (item.matched_medicine_id) {
        const med = medicines.find((m) => m.id === item.matched_medicine_id);
        if (med) {
          cartItems.push({
            medicine: med,
            orderedUnit: item.packaging_type || PackagingUnit.BOX,
            orderedQty: item.qty || 1,
          });
        }
      }
    }

    if (cartItems.length > 0) {
      onImportToCart(cartItems);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-[#10b981]/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#025540] border border-[#10b981] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#34d399]" />
              </div>
              <h2 className="text-lg font-bold text-white">
                AI Prescription & Handwritten Memo Slip Parser
              </h2>
            </div>
            <p className="text-xs text-emerald-200/80 mt-1">
              Ingests raw doctor prescriptions or handwritten memo notes, parses chemical compounds & quantities, and fuzzy matches against the MedSupply database catalog with strict Zod validation.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <span className="text-emerald-300/70 text-[11px] font-semibold">Presets:</span>
            {SAMPLE_MEMO_PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setMemoText(p.text);
                  setParseResult(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#023528] border border-[#047857]/60 text-emerald-200 hover:text-white hover:bg-[#025540] text-[11px] font-medium transition-all"
              >
                Preset {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Parser View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Input Text / Prescription Image */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card rounded-2xl p-5 border border-[#047857]/40 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#34d399]" />
                Doctor Prescription / Handwritten Memo Note
              </label>
              <span className="text-[10px] text-emerald-400/60 font-mono">
                {memoText.length} characters
              </span>
            </div>

            <textarea
              rows={12}
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              placeholder="Paste doctor prescription text, memo notes, or WhatsApp order request here..."
              className="w-full bg-[#01140f] border border-[#047857]/50 rounded-xl p-3.5 text-xs text-white placeholder-emerald-300/40 font-mono focus:outline-none focus:border-[#10b981] transition-all resize-none leading-relaxed"
            />

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleParse}
                disabled={isParsing || !memoText.trim()}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#10b981] to-[#025540] hover:from-[#34d399] hover:to-[#047857] text-white font-bold text-xs shadow-lg shadow-[#10b981]/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                {isParsing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting Entities & Matching Catalog...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Parse with AI Engine (Zod Validated)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Structured JSON & Catalog Entity Match Output */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card rounded-2xl p-5 border border-[#047857]/40 space-y-4 min-h-[420px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#047857]/40">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#34d399]" />
                  Structured Catalog Output ({parseResult?.parsed_items?.length || 0} Entities Found)
                </h3>

                {parseResult && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-emerald-200">
                      Confidence:{" "}
                      <strong className="text-[#34d399] font-mono">
                        {Math.round(parseResult.overall_confidence * 100)}%
                      </strong>
                    </span>
                    <span className="text-[10px] text-emerald-300/60 font-mono">
                      ({parseResult.processing_time_ms}ms)
                    </span>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-xl bg-red-950/80 border border-red-500 text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {!parseResult && !isParsing && (
                <div className="py-20 text-center text-emerald-300/60">
                  <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#10b981]" />
                  <p className="text-xs font-semibold text-white">No parsed items yet</p>
                  <p className="text-[11px] text-emerald-300/60 mt-1">
                    Click &quot;Parse with AI Engine&quot; to extract structured medicines from the memo
                  </p>
                </div>
              )}

              {/* Parsed Items List */}
              {parseResult && (
                <div className="mt-4 space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {parseResult.parsed_items.map((item, idx) => {
                    const isMatched = !!item.matched_medicine_id;
                    const confidencePercent = Math.round(item.confidence_score * 100);

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                          isMatched
                            ? "bg-[#011e17] border-[#047857]/50"
                            : "bg-amber-950/30 border-amber-500/40"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">
                                {item.brand_name}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#025540] text-[#6ee7b7] border border-[#10b981]/40 font-bold">
                                {item.qty} {item.packaging_type}
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-300/80 font-medium">
                              Generic: {item.generic || "Unspecified"}
                            </p>
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                                confidencePercent > 80
                                  ? "bg-emerald-950 text-[#34d399] border border-[#10b981]/50"
                                  : "bg-amber-950 text-amber-300 border border-amber-500/50"
                              }`}
                            >
                              {confidencePercent}% OCR Match
                            </span>
                            {item.unit_price ? (
                              <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
                                ৳{item.unit_price}/pc
                              </p>
                            ) : null}
                          </div>
                        </div>

                        {item.notes && (
                          <p className="text-[10px] text-emerald-300/60 italic bg-[#01140f] p-1.5 rounded border border-[#047857]/30">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Transfer to Order Cart Button */}
            {parseResult && parseResult.parsed_items.length > 0 && (
              <div className="pt-3 border-t border-[#047857]/40 flex items-center justify-between">
                <span className="text-xs text-emerald-200">
                  Ready to cut order for{" "}
                  <strong className="text-white">
                    {parseResult.parsed_items.filter((i) => i.matched_medicine_id).length} catalog items
                  </strong>
                </span>

                <button
                  onClick={handleTransferToCart}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#10b981] to-[#025540] hover:from-[#34d399] hover:to-[#047857] text-white font-bold text-xs shadow-md shadow-[#10b981]/20 flex items-center gap-1.5 transition-all"
                >
                  <span>Import to Order Cutting POS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
