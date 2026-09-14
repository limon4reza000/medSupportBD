"use client";

import React, { useState } from "react";
import { IMedicine, ISlipParserResponse, PackagingUnit } from "@/types/domain";
import {
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
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
      <div className="premium-panel p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#025540] to-[#036b51] flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                AI Prescription & Handwritten Memo Slip Parser
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium max-w-2xl">
              Ingests raw doctor prescriptions or handwritten memo notes, parses chemical compounds & quantities, and fuzzy matches against the MedSupply database catalog with strict Zod validation.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Presets:</span>
            {SAMPLE_MEMO_PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setMemoText(p.text);
                  setParseResult(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-700 hover:text-slate-900 text-[11px] font-bold transition-all shadow-sm"
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
          <div className="premium-card p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#025540]" />
                Prescription / Memo Raw Text
              </label>
              <span className="text-[10px] text-slate-400 font-mono font-bold">
                {memoText.length} chars
              </span>
            </div>

            <textarea
              rows={12}
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              placeholder="Paste doctor prescription text, memo notes, or WhatsApp order request here..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-[#025540] focus:ring-2 focus:ring-[#025540]/10 transition-all resize-none leading-relaxed"
            />

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleParse}
                disabled={isParsing || !memoText.trim()}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#025540] to-[#036b51] hover:from-[#036b51] hover:to-[#047857] text-white font-extrabold text-xs shadow-lg shadow-[#025540]/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.99]"
              >
                {isParsing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Extracting Entities & Matching Catalog...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Parse with AI Engine (Zod Validated)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Structured JSON & Catalog Entity Match Output */}
        <div className="lg:col-span-7 space-y-4">
          <div className="premium-card p-5 space-y-4 min-h-[420px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#025540]" />
                  Structured Catalog Output ({parseResult?.parsed_items?.length || 0} Entities Found)
                </h3>

                {parseResult && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-bold">
                      Confidence:{" "}
                      <strong className="text-[#025540] font-mono">
                        {Math.round(parseResult.overall_confidence * 100)}%
                      </strong>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({parseResult.processing_time_ms}ms)
                    </span>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {!parseResult && !isParsing && (
                <div className="py-20 text-center text-slate-400">
                  <div className="w-14 h-14 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-300">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">No parsed items yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">
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
                        className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                          isMatched
                            ? "bg-slate-50/80 border-slate-200/90"
                            : "bg-amber-50/70 border-amber-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 text-sm">
                                {item.brand_name}
                              </span>
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#025540] text-white font-bold">
                                {item.qty} {item.packaging_type}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                              Generic: {item.generic || "Unspecified"}
                            </p>
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                                confidencePercent > 80
                                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                  : "bg-amber-100 text-amber-900 border border-amber-300"
                              }`}
                            >
                              {confidencePercent}% OCR Match
                            </span>
                            {item.unit_price ? (
                              <p className="text-[10px] text-[#025540] font-mono font-black mt-0.5">
                                ৳{item.unit_price}/pc
                              </p>
                            ) : null}
                          </div>
                        </div>

                        {item.notes && (
                          <p className="text-[10px] text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-200">
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
              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">
                  Ready to cut order for{" "}
                  <strong className="text-slate-900 font-bold">
                    {parseResult.parsed_items.filter((i) => i.matched_medicine_id).length} catalog items
                  </strong>
                </span>

                <button
                  onClick={handleTransferToCart}
                  className="px-4 py-2.5 rounded-2xl bg-[#025540] hover:bg-[#036b51] text-white font-extrabold text-xs shadow-md shadow-[#025540]/20 flex items-center gap-1.5 transition-all active:scale-[0.98]"
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
