"use client";

import React, { useState } from "react";
import { X, Plus, Calendar, CheckCircle2 } from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { IBatch, PackagingUnit } from "@/types/domain";

interface AddBatchModalProps {
  onClose: () => void;
  defaultMedicineId?: string;
}

export const AddBatchModal: React.FC<AddBatchModalProps> = ({ onClose, defaultMedicineId }) => {
  const { medicines, addBatch } = useApp();

  const [medicineId, setMedicineId] = useState(defaultMedicineId || medicines[0]?.id || "");
  const [batchNumber, setBatchNumber] = useState(
    `BN-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`
  );
  const [manufacturingDate, setManufacturingDate] = useState("2025-01-01");
  const [expiryDate, setExpiryDate] = useState("2027-06-30");
  const [unitType, setUnitType] = useState<PackagingUnit>(PackagingUnit.BOX);
  const [quantity, setQuantity] = useState(10);
  const [costPricePerPiece, setCostPricePerPiece] = useState(2.0);
  const [mrpPerPiece, setMrpPerPiece] = useState(3.0);

  const selectedMed = medicines.find((m) => m.id === medicineId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineId || !batchNumber) return;

    const boxPieces = selectedMed ? selectedMed.piecesPerStrip * selectedMed.stripsPerBox : 100;
    const looseUnits =
      unitType === PackagingUnit.BOX
        ? quantity * boxPieces
        : unitType === PackagingUnit.STRIP
        ? quantity * (selectedMed?.piecesPerStrip || 10)
        : quantity;

    const newBatch: IBatch = {
      id: `batch-${Date.now()}`,
      batchNumber,
      medicineId,
      depotId: "depot-dhk-01",
      manufacturingDate,
      expiryDate,
      initialLooseUnits: looseUnits,
      availableLooseUnits: looseUnits,
      reservedLooseUnits: 0,
      costPricePerPiece: selectedMed?.tradePricePerPiece || costPricePerPiece,
      mrpPerPiece: selectedMed?.mrpPerPiece || mrpPerPiece,
    };

    addBatch(newBatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#044a40] to-[#065F52] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-300" />
            <h3 className="font-black text-base">Inward New Batch Lot</h3>
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
          <div>
            <label className="font-bold text-slate-700 block mb-1">Select Medicine *</label>
            <select
              value={medicineId}
              onChange={(e) => setMedicineId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.brandName} ({m.strength}) - {m.genericName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Batch / Lot Number *</label>
            <input
              type="text"
              required
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="e.g. BN-2025-NAPA-09"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Manufacturing Date</label>
              <input
                type="date"
                value={manufacturingDate}
                onChange={(e) => setManufacturingDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Expiry Date *</label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold"
              />
            </div>
          </div>

          {/* Inward Quantity */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-700 block">Inward Quantity:</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 block mb-1">Packaging Unit</label>
                <select
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value as PackagingUnit)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800"
                >
                  <option value={PackagingUnit.BOX}>Boxes</option>
                  <option value={PackagingUnit.STRIP}>Strips</option>
                  <option value={PackagingUnit.PIECE}>Loose Pieces</option>
                </select>
              </div>

              <div>
                <label className="text-slate-500 block mb-1">Quantity Received</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-mono font-bold text-slate-900"
                />
              </div>
            </div>
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
              <span>Inward Batch</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
