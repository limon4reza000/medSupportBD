"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ShoppingCart,
  RotateCw,
  Tag,
  ArrowRight,
  ShieldCheck,
  Zap,
  Boxes,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { PackagingUnit } from "@/types/domain";

export default function AiOrderPage() {
  const router = useRouter();
  const { medicines, addToCart } = useApp();

  const [rawText, setRawText] = useState(
    "1. Tab Napa Extra 500mg - 10 Box\n2. Cap Seclo 20mg - 25 Strip\n3. Tab Monas 10mg - 5 Box\n4. Tab Zimax 500mg - 2 Box"
  );
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResults, setParsedResults] = useState<any[] | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const samplePresets = [
    {
      title: "Daily Restock Slip (Monsoon Surge)",
      text: "1. Tab Napa Extra 500mg - 10 Box\n2. Cap Seclo 20mg - 25 Strip\n3. Tab Monas 10mg - 5 Box\n4. Tab Zimax 500mg - 2 Box",
    },
    {
      title: "Clinic Emergency Memo",
      text: "Tab Ace Plus - 15 Box\nCap Sergel 20 - 10 Strip\nTab Fexo 120mg - 5 Box\nTab Ciprocin 500mg - 8 Box",
    },
  ];

  const handleParseSlip = async () => {
    if (!rawText.trim()) return;
    setIsParsing(true);
    setParsedResults(null);

    try {
      const res = await fetch("/api/ai/slip-parser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: rawText }),
      });

      const data = await res.json();
      if (data.success) {
        setParsedResults(data.data.parsed_items);
      }
    } catch (e) {
      console.error("AI parse failed:", e);
    } finally {
      setIsParsing(false);
    }
  };

  const handleExportAllToCart = () => {
    if (!parsedResults) return;

    parsedResults.forEach((item) => {
      if (item.matched_medicine_id) {
        addToCart({
          medicineId: item.matched_medicine_id,
          orderedUnit: item.packaging_type as PackagingUnit,
          orderedQty: item.qty,
        });
      }
    });

    setExportSuccess(true);
    setTimeout(() => {
      setExportSuccess(false);
      router.push("/cart");
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-teal-300 animate-pulse" />
            <span>AI Prescription & Order Slip Parser</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Convert handwritten pharmacy slips, printed prescriptions, and clinic memos into structured verified catalog orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-teal-400/20 text-teal-200 border border-teal-300/30 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-300" />
            <span>Zod Schema Validated</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Col: Upload & Text Input (Pure White Card) */}
        <div className="premium-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>Input Prescription / Memo Text</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">OCR Engine v2.4</span>
          </div>

          {/* Sample Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-600">Sample Doctor/Clinic Presets:</span>
            <div className="flex flex-wrap gap-2">
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setRawText(preset.text)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste or type handwritten prescription lines..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          {/* Parse Button */}
          <button
            onClick={handleParseSlip}
            disabled={isParsing || !rawText.trim()}
            className="w-full py-3.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
          >
            {isParsing ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Running Multi-pass OCR & Catalog Matching...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Parse Slip with AI Vision & LLM</span>
              </>
            )}
          </button>
        </div>

        {/* Right Col: Structured Extracted Orders (Pure White Card) */}
        <div className="premium-card p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-700" />
                <span>Structured Catalog Matches</span>
              </h2>
              {parsedResults && (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {parsedResults.length} Items Extracted
                </span>
              )}
            </div>

            {exportSuccess && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>All parsed items successfully imported into your shopping cart!</span>
              </div>
            )}

            <div className="mt-3 space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
              {!parsedResults && !isParsing && (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Sparkles className="w-10 h-10 mx-auto text-slate-300" />
                  <div className="text-xs font-semibold text-slate-600">No slip parsed yet</div>
                  <p className="text-[11px]">Click "Parse Slip with AI Vision & LLM" to extract items.</p>
                </div>
              )}

              {isParsing && (
                <div className="text-center py-12 space-y-3">
                  <RotateCw className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
                  <div className="text-xs font-bold text-slate-700">Analyzing brand names, strengths & quantities...</div>
                  <div className="text-[11px] text-slate-400">Verifying fuzzy match against authoritative DGDA catalog</div>
                </div>
              )}

              {parsedResults &&
                parsedResults.map((item, idx) => {
                  const isHighConfidence = item.confidence_score >= 0.85;

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">
                            {item.matched_brand_name || item.brand_name}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            isHighConfidence ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {(item.confidence_score * 100).toFixed(0)}% Confidence
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Extracted: {item.qty} {item.packaging_type} • Generic: {item.generic || "Identified"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-800">
                          {item.qty} {item.packaging_type}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {parsedResults && parsedResults.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleExportAllToCart}
                className="w-full py-3.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Export All {parsedResults.length} Items Directly to Cart</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
