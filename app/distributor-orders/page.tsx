"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  ShoppingCart,
  Send,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  Plus,
  Share2,
  ArrowRight,
  DollarSign,
  Boxes,
  FileText,
  Truck,
  Trash2,
  MessageCircle,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import {
  ICompany,
  IDistributorOrder,
  IDistributorOrderItem,
  IMedicine,
  PackagingUnit,
} from "@/types/domain";
import { InvoicePdfModal } from "@/components/distributor/InvoicePdfModal";
import { RecordCompanyPaymentModal } from "@/components/distributor/RecordCompanyPaymentModal";

export default function DistributorOrdersPage() {
  const {
    companies,
    medicines,
    distributorOrders,
    createDistributorOrder,
    updateDistributorOrderStatus,
    currentPharmacy,
  } = useApp();

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companies[0]?.id || "");
  const [distCart, setDistCart] = useState<IDistributorOrderItem[]>([]);
  const [orderNotes, setOrderNotes] = useState<string>("");

  // Modals
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<IDistributorOrder | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentCompanyId, setPaymentCompanyId] = useState<string | undefined>();
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Active Company
  const selectedCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0];

  // Medicines for selected company
  const companyMedicines = useMemo(() => {
    if (!selectedCompany) return [];
    return medicines.filter((m) =>
      m.manufacturer.toLowerCase().includes(selectedCompany.shortCode.toLowerCase()) ||
      m.manufacturer.toLowerCase().includes(selectedCompany.name.toLowerCase().split(" ")[0])
    );
  }, [medicines, selectedCompany]);

  // Company-wise total due
  const totalCompanyDue = companies.reduce((acc, c) => acc + c.dueBalance, 0);

  // Cart operations
  const handleAddToCart = (med: IMedicine) => {
    const boxPieces = med.piecesPerStrip * med.stripsPerBox;
    const existingIndex = distCart.findIndex((i) => i.medicineId === med.id);
    const boxTradePrice = med.tradePricePerPiece * boxPieces;

    if (existingIndex > -1) {
      const updated = [...distCart];
      updated[existingIndex].orderedQty += 5;
      updated[existingIndex].total = updated[existingIndex].orderedQty * boxTradePrice;
      setDistCart(updated);
    } else {
      const newItem: IDistributorOrderItem = {
        medicineId: med.id,
        brandName: med.brandName,
        strength: med.strength,
        unit: PackagingUnit.BOX,
        orderedQty: 10,
        tradePricePerUnit: boxTradePrice,
        total: 10 * boxTradePrice,
      };
      setDistCart([newItem, ...distCart]);
    }
  };

  const handleUpdateCartQty = (idx: number, newQty: number) => {
    if (newQty <= 0) {
      setDistCart(distCart.filter((_, i) => i !== idx));
      return;
    }
    const updated = [...distCart];
    updated[idx].orderedQty = newQty;
    updated[idx].total = newQty * updated[idx].tradePricePerUnit;
    setDistCart(updated);
  };

  const cartTotalAmount = distCart.reduce((acc, i) => acc + i.total, 0);

  // Submit Purchase Order
  const handleConfirmOrder = () => {
    if (distCart.length === 0 || !selectedCompany) return;

    const newOrder = createDistributorOrder({
      companyId: selectedCompany.id,
      companyName: selectedCompany.name,
      mrName: selectedCompany.mrName,
      mrPhone: selectedCompany.mrPhone,
      items: distCart,
      totalAmount: cartTotalAmount,
      notes: orderNotes,
    });

    setDistCart([]);
    setOrderNotes("");
    setSuccessBanner(
      `Purchase Order #${newOrder.poNumber} confirmed for ${selectedCompany.name} (৳${newOrder.totalAmount.toLocaleString()})!`
    );
    setSelectedInvoiceOrder(newOrder);
  };

  // WhatsApp send handler
  const handleSendWhatsApp = (order: IDistributorOrder) => {
    const text = encodeURIComponent(
      `*PHARMACY PURCHASE ORDER*\n` +
      `PO No: ${order.poNumber}\n` +
      `From: ${currentPharmacy.tradeName} (${currentPharmacy.phone})\n` +
      `To: ${order.companyName} (MR: ${order.mrName})\n` +
      `Date: ${new Date(order.orderDate).toLocaleDateString()}\n` +
      `--------------------------\n` +
      `ITEMS:\n` +
      order.items.map((it, idx) => `${idx + 1}. ${it.brandName} (${it.strength}) - ${it.orderedQty} ${it.unit} (৳${it.total.toLocaleString()})`).join("\n") +
      `\n--------------------------\n` +
      `TOTAL AMOUNT: ৳${order.totalAmount.toLocaleString()}\n` +
      `Status: Please confirm dispatch timing.`
    );
    const phone = order.mrPhone ? order.mrPhone.replace(/[^0-9]/g, "") : "";
    const clean = phone.startsWith("88") ? phone : `88${phone}`;
    window.open(`https://wa.me/${clean}?text=${text}`, "_blank");
  };

  // SMS send handler
  const handleSendSms = (order: IDistributorOrder) => {
    const body = encodeURIComponent(
      `Order ${order.poNumber} from ${currentPharmacy.tradeName}: ${order.items.map(i => `${i.brandName} x${i.orderedQty}box`).join(", ")}. Total: ৳${order.totalAmount}`
    );
    const phone = order.mrPhone ? order.mrPhone.replace(/[^0-9]/g, "") : "";
    window.open(`sms:${phone}?body=${body}`, "_blank");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#044a40] via-[#065F52] to-[#0a7a6a] p-5 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              Procurement & Supply Chain
            </span>
            <span className="text-xs text-emerald-100 font-mono">B2B Order Cutting & MR Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Company & Distributor Orders
          </h1>
          <p className="text-xs text-emerald-100/80">
            Browse company catalogs, cut purchase orders, share via WhatsApp/SMS to MRs, and track company due balances.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setPaymentCompanyId(undefined);
              setIsPaymentModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 hover:scale-102"
          >
            <DollarSign className="w-4 h-4 text-emerald-300" />
            <span>Record Payment to Company</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-xs text-emerald-800 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Company Cards & Due Balances Summary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span>Authorized Pharmaceutical Manufacturers ({companies.length})</span>
          </h2>
          <span className="text-xs text-slate-500">
            Total Outstanding Company Due: <strong className="font-mono text-rose-700">৳{totalCompanyDue.toLocaleString()}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {companies.map((comp) => {
            const isSelected = comp.id === selectedCompanyId;
            return (
              <div
                key={comp.id}
                onClick={() => setSelectedCompanyId(comp.id)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? "bg-white border-emerald-600 shadow-md ring-2 ring-emerald-600/20"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                      {comp.shortCode}
                    </span>
                    {comp.dueBalance > 0 ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        Due: ৳{comp.dueBalance.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Cleared
                      </span>
                    )}
                  </div>

                  <h3 className="font-black text-sm text-slate-900 mt-2 line-clamp-1">
                    {comp.name}
                  </h3>

                  <div className="mt-2 text-xs space-y-1 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">MR:</span>
                      <strong className="text-slate-800">{comp.mrName}</strong>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{comp.mrPhone}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-emerald-700">
                    {isSelected ? "● Selected for Order" : "Select to Cut Order"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPaymentCompanyId(comp.id);
                      setIsPaymentModalOpen(true);
                    }}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-900 underline"
                  >
                    Pay Due
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* ORDER CUTTING WORKSPACE (Browse Company -> Medicines -> Cart)       */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left: Company Medicines Catalog (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-emerald-600" />
                  <span>{selectedCompany.name} Products</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Select products to add to purchase order requisition
                </span>
              </div>
              <span className="text-xs font-bold text-slate-700">
                {companyMedicines.length} Medicines Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {companyMedicines.map((med) => {
                const boxPieces = med.piecesPerStrip * med.stripsPerBox;
                const boxTradePrice = med.tradePricePerPiece * boxPieces;

                return (
                  <div
                    key={med.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/20 hover:border-emerald-500 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                          {med.dosageForm}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {med.stripsPerBox}×{med.piecesPerStrip} pcs/box
                        </span>
                      </div>

                      <h4 className="font-black text-sm text-slate-900 mt-2">{med.brandName}</h4>
                      <p className="text-xs text-slate-500 font-semibold">{med.strength}</p>
                      <p className="text-[11px] text-slate-400 truncate">{med.genericName}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Trade Price</span>
                        <strong className="text-sm font-mono font-black text-slate-900">
                          ৳{boxTradePrice.toFixed(2)}
                          <span className="text-[10px] text-slate-500 font-normal"> /box</span>
                        </strong>
                      </div>

                      <button
                        onClick={() => handleAddToCart(med)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1 active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Box</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Purchase Order Cart & Requisition (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700 font-bold">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">PO Requisition Cart</h3>
                  <span className="text-xs text-slate-400">Order to: {selectedCompany.name}</span>
                </div>
              </div>

              {distCart.length > 0 && (
                <button
                  onClick={() => setDistCart([])}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Cart Items */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {distCart.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-1">
                  <ShoppingCart className="w-8 h-8 mx-auto opacity-30" />
                  <p className="text-xs">Requisition cart is empty.</p>
                  <p className="text-[11px] text-slate-400">Select products from {selectedCompany.shortCode} catalog.</p>
                </div>
              ) : (
                distCart.map((item, idx) => (
                  <div
                    key={`${item.medicineId}-${idx}`}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{item.brandName}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ৳{item.tradePricePerUnit.toFixed(2)}/box
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateCartQty(idx, item.orderedQty - 5)}
                          className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="font-mono text-xs font-bold w-12 text-center text-slate-900">
                          {item.orderedQty} bx
                        </span>
                        <button
                          onClick={() => handleUpdateCartQty(idx, item.orderedQty + 5)}
                          className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>

                      <strong className="font-mono text-xs text-slate-900 w-16 text-right">
                        ৳{item.total.toFixed(0)}
                      </strong>

                      <button
                        onClick={() => setDistCart(distCart.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total Requisition Value */}
            {distCart.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-700">Total Purchase Order Value:</span>
                  <span className="font-mono font-black text-lg text-emerald-800">
                    ৳{cartTotalAmount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Order Delivery Instructions:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Please deliver by tomorrow morning batch."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleConfirmOrder}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Purchase Order</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* =================================================================== */}
      {/* ORDER HISTORY & PIPELINE TABLE                                      */}
      {/* =================================================================== */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Purchase Order History & Status Pipeline</span>
            </h3>
            <span className="text-xs text-slate-400">
              Track status from Pending to Confirmed to Delivered with auto stock intake.
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                <th className="pb-3">PO Number</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Company & MR</th>
                <th className="pb-3">Items & Qty</th>
                <th className="pb-3 text-right">Amount (৳)</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-center">Share to MR</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {distributorOrders.map((ord) => {
                const totalBoxes = ord.items.reduce((acc, i) => acc + i.orderedQty, 0);

                return (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-900">{ord.poNumber}</td>
                    <td className="py-3 text-slate-500">
                      {new Date(ord.orderDate).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className="font-bold text-slate-900 block">{ord.companyName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        MR: {ord.mrName} ({ord.mrPhone})
                      </span>
                    </td>
                    <td className="py-3 text-slate-700">
                      {ord.items.length} SKUs ({totalBoxes} Boxes)
                    </td>
                    <td className="py-3 text-right font-mono font-black text-slate-900">
                      ৳{ord.totalAmount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          ord.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : ord.paymentStatus === "PARTIALLY_PAID"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3">
                      <select
                        value={ord.status}
                        onChange={(e) =>
                          updateDistributorOrderStatus(
                            ord.id,
                            e.target.value as "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED"
                          )
                        }
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border focus:outline-none ${
                          ord.status === "DELIVERED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : ord.status === "CONFIRMED"
                            ? "bg-blue-50 text-blue-800 border-blue-300"
                            : "bg-amber-50 text-amber-800 border-amber-300"
                        }`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="DELIVERED">Delivered (Inward Stock)</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>

                    {/* Share Buttons */}
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleSendWhatsApp(ord)}
                          className="p-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] transition-colors"
                          title="Send to MR via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4 fill-current" />
                        </button>
                        <button
                          onClick={() => handleSendSms(ord)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors text-[10px] font-bold"
                          title="Send to MR via SMS"
                        >
                          SMS
                        </button>
                      </div>
                    </td>

                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedInvoiceOrder(ord)}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-colors flex items-center gap-1 ml-auto"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-600" />
                        <span>Invoice PDF</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <InvoicePdfModal
        order={selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
      />
      {isPaymentModalOpen && (
        <RecordCompanyPaymentModal
          defaultCompanyId={paymentCompanyId}
          onClose={() => setIsPaymentModalOpen(false)}
        />
      )}

    </div>
  );
}
