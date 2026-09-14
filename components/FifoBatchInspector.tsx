"use client";

import React, { useState } from "react";
import { IBatch, IMedicine } from "@/types/domain";
import { BatchFifoEngine } from "@/services/batchFifoEngine";
import { ShieldCheck, Clock, Calendar, RefreshCw } from "lucide-react";

interface FifoBatchInspectorProps {
  medicines: IMedicine[];
  batches: IBatch[];
}

export const FifoBatchInspector: React.FC<FifoBatchInspectorProps> = ({
  medicines,
  batches,
}) => {
  const [selectedMedId, setSelectedMedId] = useState<string>(medicines[0]?.id || "med-01");
  const [simulationQty, setSimulationQty] = useState<number>(600);

  const selectedMed = medicines.find((m) => m.id === selectedMedId) || medicines[0];
  const medBatches = batches.filter((b) => b.medicineId === selectedMed?.id);

  // Run FIFO Allocation Simulation
  const fifoResult = BatchFifoEngine.allocateFifoStock(
    selectedMed.id,
    selectedMed.brandName,
    medBatches,
    simulationQty
  );

  const now = new Date();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel bg-white text-slate-900 rounded-2xl p-6 border border-slate-200 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#025540] flex items-center justify-center shadow-md">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Near-Expiry FIFO (First-In, First-Out) Batch Inspector
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Guarantees zero-waste pharmaceutical inventory management by automatically directing order fulfillment to batches closest to their expiration date before touching fresher stock.
            </p>
          </div>

          {/* Medicine Selector */}
          <div className="flex items-center space-x-2 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-600 font-bold">Inspect SKU:</span>
            <select
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer pr-2"
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id} className="bg-white text-slate-900">
                  {m.brandName} ({m.strength})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Simulator Control & Batches Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Live Batch Inventory Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-card bg-white text-slate-900 rounded-2xl p-5 border border-slate-200 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#025540]" />
                Warehouse Batch Inventory for {selectedMed.brandName} (Sorted by Expiry ASC)
              </h3>
              <span className="text-xs text-slate-500 font-mono font-bold">
                {medBatches.length} Batches Registered
              </span>
            </div>

            <div className="space-y-3">
              {medBatches
                .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
                .map((batch, idx) => {
                  const expiry = new Date(batch.expiryDate);
                  const diffTime = expiry.getTime() - now.getTime();
                  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const isNearExpiry = daysLeft <= 90;
                  const isCritical = daysLeft <= 45;

                  const allocatedInSim =
                    fifoResult.allocations.find((a) => a.batchId === batch.id)?.piecesAllocated || 0;

                  return (
                    <div
                      key={batch.id}
                      className={`p-4 rounded-xl border transition-all space-y-3 ${
                        allocatedInSim > 0
                          ? "bg-emerald-50/70 border-[#025540] shadow-md"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#025540] text-white font-mono font-bold">
                              Priority #{idx + 1}
                            </span>
                            <span className="font-bold text-slate-900 text-sm font-mono">
                              {batch.batchNumber}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 font-medium">
                            Mfg: {String(batch.manufacturingDate).slice(0, 10)} | Cost Basis: ৳{batch.costPricePerPiece}/pc
                          </p>
                        </div>

                        <div className="text-right">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold font-mono ${
                              isCritical
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : isNearExpiry
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            Exp: {String(batch.expiryDate).slice(0, 10)} ({daysLeft} days left)
                          </span>
                          <p className="text-xs text-slate-900 font-mono font-bold mt-1">
                            Available: {batch.availableLooseUnits.toLocaleString()} pcs
                          </p>
                        </div>
                      </div>

                      {/* Allocation Progress Bar */}
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 font-medium mb-1">
                          <span>FIFO Allocation Consumption:</span>
                          <strong className="text-slate-900 font-mono font-bold">
                            {allocatedInSim > 0
                              ? `${allocatedInSim} pcs allocated (${Math.round(
                                  (allocatedInSim / batch.availableLooseUnits) * 100
                                )}%)`
                              : "0 pcs (Waiting in queue)"}
                          </strong>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              allocatedInSim === batch.availableLooseUnits
                                ? "bg-amber-500"
                                : "bg-[#025540]"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((allocatedInSim / batch.availableLooseUnits) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Simulation Box */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel bg-white text-slate-900 rounded-2xl p-5 border border-slate-200 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <RefreshCw className="w-4 h-4 text-[#025540]" />
              FIFO Order Allocation Simulator
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Simulate Order Loose Units Quantity:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="50"
                  max="5000"
                  step="50"
                  value={simulationQty}
                  onChange={(e) => setSimulationQty(parseInt(e.target.value, 10))}
                  className="w-full accent-[#025540] bg-slate-200 h-2.5 rounded-lg cursor-pointer"
                />
                <span className="font-mono font-bold text-[#025540] text-sm w-16 text-right">
                  {simulationQty} pcs
                </span>
              </div>
            </div>

            {/* Simulation Results Breakdown */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2.5 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Requested Quantity:</span>
                <strong className="text-slate-900 font-bold">{fifoResult.requestedLooseUnits} pcs</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Allocated:</span>
                <strong className="text-[#025540] font-bold">{fifoResult.allocatedLooseUnits} pcs</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Batches Utilized:</span>
                <span className="text-slate-900 font-bold">{fifoResult.allocations.length} distinct batch(es)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shortfall:</span>
                <span className={fifoResult.shortageUnits > 0 ? "text-red-600 font-bold" : "text-slate-900 font-bold"}>
                  {fifoResult.shortageUnits} pcs
                </span>
              </div>
            </div>

            {/* Detailed Allocations Breakdown */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">Step-by-step Batch Deduction:</span>
              {fifoResult.allocations.map((a, i) => (
                <div
                  key={a.batchId}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]"
                >
                  <div>
                    <strong className="text-slate-900 font-mono font-bold block">
                      #{i + 1} {a.batchNumber}
                    </strong>
                    <span className="text-slate-500 font-medium">
                      {a.daysUntilExpiry} days before expiry
                    </span>
                  </div>
                  <strong className="text-[#025540] font-mono font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    +{a.piecesAllocated} pcs
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
