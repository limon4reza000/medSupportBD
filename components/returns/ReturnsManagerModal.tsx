"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Calendar,
  FileText,
  Plus,
  ArrowRight,
  Package,
} from "lucide-react";
import { IReturnRequest, ReturnStatus } from "@/types/domain";

interface ReturnsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedOrder?: any;
}

export const ReturnsManagerModal: React.FC<ReturnsManagerModalProps> = ({
  isOpen,
  onClose,
  preSelectedOrder,
}) => {
  const [returns, setReturns] = useState<IReturnRequest[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<"ALL" | ReturnStatus>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Create form state
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedMedicineId, setSelectedMedicineId] = useState("");
  const [returnQty, setReturnQty] = useState(1);
  const [returnReason, setReturnReason] = useState("DAMAGED_PACKAGING");
  const [returnNotes, setReturnNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReturns = () => {
    setIsLoading(true);
    fetch("/api/returns")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.returns)) {
          setReturns(data.returns);
        }
      })
      .catch((err) => console.error("Error fetching returns:", err))
      .finally(() => setIsLoading(false));
  };

  const fetchDeliveredOrders = () => {
    fetch("/api/orders?status=DELIVERED")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.orders)) {
          setDeliveredOrders(data.orders);
          if (data.orders.length > 0 && !selectedOrderId) {
            setSelectedOrderId(data.orders[0].id);
          }
        }
      })
      .catch((err) => console.error("Error fetching delivered orders:", err));
  };

  useEffect(() => {
    if (isOpen) {
      fetchReturns();
      fetchDeliveredOrders();
      if (preSelectedOrder) {
        setSelectedOrderId(preSelectedOrder.id);
        setIsCreating(true);
      }
    }
  }, [isOpen, preSelectedOrder]);

  if (!isOpen) return null;

  const currentDeliveredOrder = deliveredOrders.find((o) => o.id === selectedOrderId);

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;
    setIsSubmitting(true);

    const medItem = currentDeliveredOrder?.items?.[0];
    const medId = selectedMedicineId || medItem?.medicineId || "med-01";
    const brandName = medItem?.brandName || medItem?.medicineName || "Medicine";
    const unitPrice = medItem?.unitTradePrice || 490;

    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderId,
          companyName: currentDeliveredOrder?.companyName || "Pharmaceutical Depot",
          reason: returnReason,
          notes: returnNotes || "Submitted for inspection per DGDA return guidelines",
          items: [
            {
              medicineId: medId,
              brandName,
              batchNumber: medItem?.batchBreakdown?.[0]?.batchNumber || "RET-BATCH",
              quantity: returnQty,
              unitPrice,
            },
          ],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Return claim ${data.returnRequest.returnNumber} created! Awaiting representative review.`);
        fetchReturns();
        setTimeout(() => {
          setIsCreating(false);
          setSuccessMsg("");
        }, 1500);
      } else {
        alert(data.error || "Failed to submit return request.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error submitting return request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateApproval = async (returnId: string) => {
    try {
      const res = await fetch(`/api/returns/${returnId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: ReturnStatus.APPROVED,
          reviewerId: "Tanvir Ahmed (Authorized Company MPO)",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Return claim approved! Credit note issued and pharmacy balance credited.`);
        fetchReturns();
        setTimeout(() => setSuccessMsg(""), 3500);
      } else {
        alert(data.error || "Approval failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error simulating approval.");
    }
  };

  const filteredReturns = returns.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-50 via-sky-50 to-emerald-50 border-b border-teal-100/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#139485] flex items-center justify-center text-white shadow-md">
              <RotateCcw className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">Return Claims & Credit Notes</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                  DGDA Policy GxP
                </span>
              </div>
              <p className="text-xs text-slate-500">Submit damaged / near-expiry returns, track MPO reviews & receive credit memo refunds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Banner */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-900 border-b border-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Action Button & Filters Strip */}
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {[
              { id: "ALL", label: "All Returns" },
              { id: ReturnStatus.SUBMITTED, label: "Under Review" },
              { id: ReturnStatus.APPROVED, label: "Approved" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === f.id
                    ? "bg-[#139485] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="px-3 py-1.5 rounded-xl bg-[#139485] hover:bg-teal-700 text-white text-xs font-black flex items-center gap-1 shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Return Claim</span>
          </button>
        </div>

        {/* Returns List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <div className="w-7 h-7 border-3 border-[#139485] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">Loading verified return claims...</span>
            </div>
          ) : filteredReturns.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <RotateCcw className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No return requests found</p>
              <p className="text-xs text-slate-400">Pharmacies can submit returns for delivered orders within 30 days of invoice.</p>
            </div>
          ) : (
            filteredReturns.map((claim) => {
              const isApproved = claim.status === ReturnStatus.APPROVED;
              const isSubmitted = claim.status === ReturnStatus.SUBMITTED || claim.status === ReturnStatus.UNDER_REVIEW;

              return (
                <div
                  key={claim.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-200 shadow-2xs space-y-2.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{claim.returnNumber}</span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          Order: {claim.orderNumber}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-teal-800 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{claim.companyName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Reason: <strong className="text-slate-700 uppercase">{claim.reason.replace(/_/g, " ")}</strong>
                      </span>
                    </div>

                    <div className="text-right">
                      {isApproved ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                          Approved & Credited
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                          Under Review
                        </span>
                      )}
                      <div className="text-sm font-black text-teal-900 mt-1">
                        ৳{Number(claim.totalAmount).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  {claim.items && claim.items.length > 0 && (
                    <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 text-xs">
                      {claim.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">{it.brandName}</span>
                          <span className="font-bold text-slate-600">
                            {it.quantity} Boxes (Batch: {it.batchNumber}) • ৳{it.totalRefund.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes / Reviewer Bar */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-500">
                    <span className="text-[11px] line-clamp-1 italic">"{claim.notes}"</span>

                    {/* MPO Demonstration Action */}
                    {isSubmitted && (
                      <button
                        type="button"
                        onClick={() => handleSimulateApproval(claim.id)}
                        className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs active:scale-95"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>MPO Approve Claim</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUBMIT RETURN CLAIM DRAWER / MODAL                            */}
      {/* ------------------------------------------------------------- */}
      {isCreating && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleSubmitReturn}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-5 space-y-3.5 border border-slate-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">New Return Request</h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Select Delivered Order */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Select Delivered Order:</label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-[#139485]"
              >
                {deliveredOrders.length === 0 ? (
                  <option value="">No delivered orders available</option>
                ) : (
                  deliveredOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} — {o.companyName} (৳{o.netPayableAmount})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Return Reason Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Return Reason (DGDA Code):</label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-[#139485]"
              >
                <option value="DAMAGED_PACKAGING">Damaged Packaging / Broken Blister</option>
                <option value="NEAR_EXPIRY">Near Expiry (&lt; 60 Days per Trade Policy)</option>
                <option value="WRONG_BATCH_OR_ITEM">Wrong Batch / Discrepancy with Challan</option>
                <option value="MANUFACTURER_RECALL">Manufacturer Batch Recall</option>
              </select>
            </div>

            {/* Quantity Stepper */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Return Quantity (Boxes):</label>
              <input
                type="number"
                min={1}
                max={50}
                value={returnQty}
                onChange={(e) => setReturnQty(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black focus:outline-hidden focus:ring-2 focus:ring-[#139485]"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Inspection Notes / Details:</label>
              <textarea
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="Describe package condition, batch numbers, or defects..."
                rows={2}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#139485]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedOrderId}
              className="w-full py-3 rounded-2xl bg-[#139485] hover:bg-teal-700 text-white text-xs font-black shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Submit Claim for MPO Review</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
