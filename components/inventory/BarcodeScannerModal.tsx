"use client";

import React, { useState } from "react";
import {
  Scan,
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { PackagingUnit } from "@/types/domain";

interface BarcodeScannerModalProps {
  onClose: () => void;
  onSelectMedicine?: (medicineId: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  onClose,
  onSelectMedicine,
}) => {
  const { medicines, batches, adjustStock } = useApp();
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scannedMedicine, setScannedMedicine] = useState<any | null>(null);
  const [scannedBatch, setScannedBatch] = useState<any | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(10);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Preset quick barcode tester chips
  const sampleBarcodes = [
    { code: "894110023456", label: "Napa Extra 500mg", medId: "med-01" },
    { code: "894110045678", label: "Ace Plus 500mg", medId: "med-02" },
    { code: "894110078901", label: "Seclo 20mg", medId: "med-03" },
    { code: "894110091234", label: "Zimax 500mg", medId: "med-06" },
  ];

  const handleLookup = (code: string) => {
    setBarcodeInput(code);
    setSuccessMsg(null);

    // Match by code, id or sample barcode
    const sample = sampleBarcodes.find((s) => s.code === code);
    const targetId = sample ? sample.medId : code;

    const med = medicines.find(
      (m) =>
        m.id === targetId ||
        m.code.toLowerCase() === code.toLowerCase() ||
        m.brandName.toLowerCase().includes(code.toLowerCase())
    );

    if (med) {
      setScannedMedicine(med);
      const b = batches.find((x) => x.medicineId === med.id);
      setScannedBatch(b || null);
    } else {
      setScannedMedicine(null);
      setScannedBatch(null);
    }
  };

  const handleApplyStockUpdate = (type: "ADD" | "DEDUCT") => {
    if (!scannedBatch) return;
    const qty = type === "ADD" ? adjustmentAmount : -adjustmentAmount;
    adjustStock(scannedBatch.id, qty, "Barcode Scanner Quick Update");
    setSuccessMsg(
      `Successfully ${type === "ADD" ? "added" : "deducted"} ${adjustmentAmount} units for ${
        scannedMedicine.brandName
      }.`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Optical Barcode Scanner & Rapid Stock Adjuster</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Camera Viewfinder Simulation */}
        <div className="p-5 bg-slate-950 text-white relative flex flex-col items-center justify-center min-h-[190px] overflow-hidden">
          <div className="absolute inset-x-8 inset-y-6 border-2 border-dashed border-emerald-400/80 rounded-2xl flex items-center justify-center">
            <div className="w-full h-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-pulse" />
          </div>

          <Camera className="w-10 h-10 text-emerald-400/30 mb-2" />
          <span className="text-xs font-mono text-emerald-300 font-semibold relative z-10">
            [CAMERA LASER ACTIVE: Align medicine barcode inside frame]
          </span>
          <span className="text-[10px] text-slate-400 mt-1 relative z-10">
            Supports GS1 Datamatrix, EAN-13, and 2D DGDA QR codes
          </span>
        </div>

        {/* Manual Barcode Input & Quick Tester Chips */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Barcode / SKU Scanner Input:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Scan or enter barcode numbers..."
                value={barcodeInput}
                onChange={(e) => handleLookup(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
              <button
                onClick={() => handleLookup(barcodeInput)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors"
              >
                Scan
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Barcode Test Samples:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleBarcodes.map((s) => (
                <button
                  key={s.code}
                  onClick={() => handleLookup(s.code)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 text-[11px] font-semibold border border-slate-200 transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scanned Medicine Result Card */}
          {scannedMedicine && (
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3 animate-in fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                    Matched SKU
                  </span>
                  <h4 className="font-black text-sm text-slate-900 mt-1">
                    {scannedMedicine.brandName}{" "}
                    <span className="text-xs font-medium text-slate-500">
                      ({scannedMedicine.strength})
                    </span>
                  </h4>
                  <p className="text-xs text-slate-600">{scannedMedicine.genericName}</p>
                  <p className="text-[11px] text-slate-400">{scannedMedicine.manufacturer}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">MRP</span>
                  <strong className="text-base font-mono font-black text-slate-900">
                    ৳{scannedMedicine.mrpPerPiece.toFixed(2)}
                  </strong>
                </div>
              </div>

              {scannedBatch && (
                <div className="p-2.5 rounded-xl bg-white border border-emerald-200/80 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Batch:</span>
                    <strong className="font-mono text-slate-900">{scannedBatch.batchNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Available Stock:</span>
                    <strong className="text-emerald-700 font-bold">
                      {scannedBatch.availableLooseUnits} pieces
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Expiry Date:</span>
                    <span className="text-slate-700 font-mono">
                      {new Date(scannedBatch.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Stock Adjustment */}
              <div className="space-y-2 pt-1 border-t border-emerald-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Quick Stock Adjustment:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      value={adjustmentAmount}
                      onChange={(e) => setAdjustmentAmount(Math.max(1, Number(e.target.value)))}
                      className="w-16 px-2 py-1 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold text-center"
                    />
                    <span className="text-[11px] text-slate-500">units</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleApplyStockUpdate("ADD")}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Inward +{adjustmentAmount}</span>
                  </button>

                  <button
                    onClick={() => handleApplyStockUpdate("DEDUCT")}
                    className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Dispense -{adjustmentAmount}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
