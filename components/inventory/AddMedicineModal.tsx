"use client";

import React, { useState } from "react";
import { X, Plus, Boxes, CheckCircle2 } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { DosageForm, IMedicine } from "@/types/domain";

interface AddMedicineModalProps {
  onClose: () => void;
}

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({ onClose }) => {
  const { addMedicine } = useApp();

  const [brandName, setBrandName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [manufacturer, setManufacturer] = useState("Square Pharmaceuticals PLC");
  const [strength, setStrength] = useState("500mg");
  const [dosageForm, setDosageForm] = useState<DosageForm>(DosageForm.TABLET);
  const [piecesPerStrip, setPiecesPerStrip] = useState(10);
  const [stripsPerBox, setStripsPerBox] = useState(10);
  const [tradePricePerPiece, setTradePricePerPiece] = useState(2.45);
  const [mrpPerPiece, setMrpPerPiece] = useState(3.0);
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName || !genericName) return;

    const newMed: IMedicine = {
      id: `med-${Date.now()}`,
      code: `MED-${brandName.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
      brandName,
      genericName,
      dosageForm,
      strength,
      manufacturer,
      description,
      piecesPerStrip,
      stripsPerBox,
      mrpPerPiece,
      tradePricePerPiece,
      vatPercentage: 2.4,
      isActive: true,
      dgdaApproved: true,
    };

    addMedicine(newMed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#044a40] to-[#065F52] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-300" />
            <h3 className="font-black text-base">Add New Medicine to Database</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh] text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Brand Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Napa Extra"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Generic Chemical *</label>
              <input
                type="text"
                required
                placeholder="e.g. Paracetamol + Caffeine"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Dosage Form</label>
              <select
                value={dosageForm}
                onChange={(e) => setDosageForm(e.target.value as DosageForm)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={DosageForm.TABLET}>TABLET</option>
                <option value={DosageForm.CAPSULE}>CAPSULE</option>
                <option value={DosageForm.SYRUP}>SYRUP</option>
                <option value={DosageForm.INJECTION}>INJECTION</option>
                <option value={DosageForm.CREAM_OINTMENT}>CREAM / OINTMENT</option>
                <option value={DosageForm.EYE_DROPS}>EYE DROPS</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Strength</label>
              <input
                type="text"
                placeholder="e.g. 500mg + 65mg"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Company / Manufacturer</label>
              <input
                type="text"
                placeholder="e.g. Square / Beximco"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Packaging Hierarchy */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-700 block">Packaging Hierarchy:</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 block mb-1">Pieces per Strip</label>
                <input
                  type="number"
                  min="1"
                  value={piecesPerStrip}
                  onChange={(e) => setPiecesPerStrip(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-mono text-slate-900 font-bold"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Strips per Box</label>
                <input
                  type="number"
                  min="1"
                  value={stripsPerBox}
                  onChange={(e) => setStripsPerBox(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-mono text-slate-900 font-bold"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              1 Box = {piecesPerStrip * stripsPerBox} total loose pieces
            </p>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Purchase Price per Piece (TP) ৳
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={tradePricePerPiece}
                onChange={(e) => setTradePricePerPiece(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">MRP per Piece (Retail) ৳</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={mrpPerPiece}
                onChange={(e) => setMrpPerPiece(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Indication / Description</label>
            <textarea
              rows={2}
              placeholder="e.g. Analgesic and antipyretic for fever and headache."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Save Medicine</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
