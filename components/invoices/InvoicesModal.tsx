"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  DollarSign,
  Receipt,
  Search,
} from "lucide-react";
import { IInvoice, PaymentStatus } from "@/types/domain";

interface InvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayInvoice?: (invoiceId: string, amount: number) => void;
}

export const InvoicesModal: React.FC<InvoicesModalProps> = ({
  isOpen,
  onClose,
  onPayInvoice,
}) => {
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [summary, setSummary] = useState({ totalInvoiced: 0, totalUnpaid: 0, totalPaid: 0 });
  const [statusFilter, setStatusFilter] = useState<"ALL" | PaymentStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<IInvoice | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<IInvoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"BKASH" | "NAGAD" | "BANK" | "CASH">("BKASH");
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState("");

  const fetchInvoices = () => {
    setIsLoading(true);
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.invoices)) {
          setInvoices(data.invoices);
          if (data.summary) setSummary(data.summary);
        }
      })
      .catch((err) => console.error("Error fetching invoices:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchInvoices();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter !== "ALL" && inv.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = inv.invoiceNumber.toLowerCase().includes(q);
      const matchComp = inv.companyName.toLowerCase().includes(q);
      const matchChallan = inv.challanNumber?.toLowerCase().includes(q);
      if (!matchNo && !matchComp && !matchChallan) return false;
    }
    return true;
  });

  const handleOpenPay = (inv: IInvoice) => {
    setPayingInvoice(inv);
    setPaymentAmount(inv.dueAmount);
    setPaySuccessMsg("");
  };

  const handleExecutePayment = async () => {
    if (!payingInvoice) return;
    setIsProcessingPay(true);
    try {
      const res = await fetch(`/api/invoices/${payingInvoice.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: paymentAmount,
          paymentMethod,
          notes: `Settled via ${paymentMethod} by Pharmacy Owner`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPaySuccessMsg(`Payment of ৳${paymentAmount.toLocaleString()} completed successfully!`);
        fetchInvoices();
        setTimeout(() => {
          setPayingInvoice(null);
          setPaySuccessMsg("");
        }, 1500);
      } else {
        alert(data.error || "Payment failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error processing invoice payment.");
    } finally {
      setIsProcessingPay(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-50 via-sky-50 to-emerald-50 border-b border-teal-100/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#139485] flex items-center justify-center text-white shadow-md">
              <Receipt className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">Commercial Invoices & Tax Challans</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-200 uppercase">
                  Mushak-6.3 Compliant
                </span>
              </div>
              <p className="text-xs text-slate-500">Official pharmaceutical distributor vouchers, statements & payment receipts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 grid grid-cols-3 gap-2.5">
          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              Total Invoiced
            </span>
            <div className="text-sm sm:text-base font-black text-slate-900">
              ৳{summary.totalInvoiced.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 font-semibold">{invoices.length} Vouchers</span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-rose-100 shadow-2xs">
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider block">
              Outstanding Dues
            </span>
            <div className="text-sm sm:text-base font-black text-rose-600">
              ৳{summary.totalUnpaid.toLocaleString()}
            </div>
            <span className="text-[10px] text-rose-700 font-semibold">Payable to Depots</span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-emerald-100 shadow-2xs">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">
              Total Settled
            </span>
            <div className="text-sm sm:text-base font-black text-emerald-700">
              ৳{summary.totalPaid.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">Cleared Balance</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-white">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search invoice #, company, or challan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#139485]"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            {[
              { id: "ALL", label: "All" },
              { id: PaymentStatus.UNPAID, label: "Unpaid" },
              { id: PaymentStatus.PARTIALLY_PAID, label: "Partial" },
              { id: PaymentStatus.PAID, label: "Paid" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === f.id
                    ? "bg-[#139485] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Invoice List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <div className="w-7 h-7 border-3 border-[#139485] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">Loading official invoices...</span>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No invoices found matching criteria</p>
              <p className="text-xs text-slate-400">Invoices are automatically created upon confirmed order checkout.</p>
            </div>
          ) : (
            filteredInvoices.map((inv) => {
              const isPaid = inv.status === PaymentStatus.PAID;
              const isPartial = inv.status === PaymentStatus.PARTIALLY_PAID;
              const isUnpaid = inv.status === PaymentStatus.UNPAID;

              return (
                <div
                  key={inv.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-200 shadow-2xs hover:shadow-xs transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{inv.invoiceNumber}</span>
                        {inv.challanNumber && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            Challan: {inv.challanNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-teal-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{inv.companyName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium flex items-center gap-2 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Issued: {new Date(inv.issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Due: {new Date(inv.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="text-right">
                      {isPaid ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                          Paid
                        </span>
                      ) : isPartial ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                          Partial (Due ৳{inv.dueAmount.toLocaleString()})
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200 uppercase">
                          Unpaid
                        </span>
                      )}
                      <div className="text-sm font-black text-slate-900 mt-1">
                        ৳{inv.netPayable.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceForPrint(inv)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>View & Print Mushak-6.3</span>
                    </button>

                    {!isPaid && (
                      <button
                        type="button"
                        onClick={() => handleOpenPay(inv)}
                        className="px-3 py-1.5 rounded-xl bg-[#139485] hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay ৳{inv.dueAmount.toLocaleString()}</span>
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
      {/* PRINTABLE MUSHAK-6.3 TAX INVOICE MODAL                        */}
      {/* ------------------------------------------------------------- */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-5 sm:p-6 overflow-y-auto max-h-[92vh] space-y-4 border border-slate-200">
            {/* Modal Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
              <span className="text-xs font-black text-teal-800 uppercase tracking-wider">
                Official Bangladesh Tax Invoice (Challan)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-[#139485] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForPrint(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Official Tax Invoice Voucher Layout */}
            <div className="p-4 sm:p-6 border border-slate-300 rounded-2xl bg-white space-y-4 text-slate-900 font-sans">
              <div className="text-center space-y-0.5 border-b pb-3 border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">
                  Government of the People's Republic of Bangladesh • National Board of Revenue
                </div>
                <div className="text-xs font-black text-slate-800">
                  TAX INVOICE / COMMERCIAL CHALLAN [MUSHAK - 6.3]
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  [See Rule 40, Sub-rule (1), Clause (Ga) and (Cha)]
                </div>
              </div>

              {/* Supplier & Customer Header */}
              <div className="grid grid-cols-2 gap-4 text-xs border-b pb-3 border-slate-200">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Registered Supplier</span>
                  <div className="font-black text-slate-900">{selectedInvoiceForPrint.companyName}</div>
                  <div className="text-[11px] text-slate-600">Tejgaon Industrial Area Regional Logistics Hub, Dhaka</div>
                  <div className="text-[10px] text-slate-500">BIN: 002910481-0101 • DGDA Verified GxP Depot</div>
                </div>
                <div className="space-y-0.5 text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Purchasing Pharmacy</span>
                  <div className="font-black text-slate-900">{selectedInvoiceForPrint.pharmacyName}</div>
                  <div className="text-[11px] text-slate-600">Central Road, Dhanmondi, Dhaka</div>
                  <div className="text-[10px] text-slate-500">Drug Lic: DL-DHK-2022-88219 • TIN: 9948271049</div>
                </div>
              </div>

              {/* Invoice Meta Grid */}
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Invoice Number</span>
                  <span className="font-black text-slate-900">{selectedInvoiceForPrint.invoiceNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Challan Reference</span>
                  <span className="font-black text-slate-900">{selectedInvoiceForPrint.challanNumber || selectedInvoiceForPrint.orderNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Issue Date</span>
                  <span className="font-bold text-slate-900">
                    {new Date(selectedInvoiceForPrint.issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-black text-[10px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-2">Item Description</th>
                      <th className="p-2">Batch & Expiry</th>
                      <th className="p-2 text-center">Billed Qty</th>
                      <th className="p-2 text-center">Bonus</th>
                      <th className="p-2 text-right">Unit TP</th>
                      <th className="p-2 text-right">Net Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoiceForPrint.items && selectedInvoiceForPrint.items.length > 0 ? (
                      selectedInvoiceForPrint.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-slate-900">{it.brandName}</td>
                          <td className="p-2 text-slate-600 font-mono text-[11px]">{it.batchNumber} ({it.expiryDate})</td>
                          <td className="p-2 text-center font-bold text-slate-800">{it.orderedQty}</td>
                          <td className="p-2 text-center font-bold text-emerald-600">{it.bonusQty > 0 ? `+${it.bonusQty} Free` : "—"}</td>
                          <td className="p-2 text-right font-bold text-slate-700">৳{it.unitTradePrice}</td>
                          <td className="p-2 text-right font-black text-slate-900">৳{it.netItemTotal}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-3 text-center text-slate-400 font-medium">Standard wholesale dispatch consignment</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals Calculation */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Gross Trade Price:</span>
                    <span className="font-bold">৳{selectedInvoiceForPrint.totalGross.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>Trade Schemes / Bonus:</span>
                    <span className="font-bold">-৳{selectedInvoiceForPrint.discountTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Pharma VAT (2.4%):</span>
                    <span className="font-bold">৳{selectedInvoiceForPrint.vatTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-slate-300 text-sm font-black text-slate-900">
                    <span>Net Payable Amount:</span>
                    <span className="text-teal-800">৳{selectedInvoiceForPrint.netPayable.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-400 border-t border-slate-200">
                <div>
                  <div className="h-10 border-b border-dashed border-slate-300 mx-auto w-36" />
                  <span className="mt-1 block font-bold text-slate-600">Authorized Logistics Officer</span>
                  <span>{selectedInvoiceForPrint.companyName}</span>
                </div>
                <div>
                  <div className="h-10 border-b border-dashed border-slate-300 mx-auto w-36" />
                  <span className="mt-1 block font-bold text-slate-600">Received in Good Order</span>
                  <span>Dr. Rafiqul Islam (Pharmacy Owner)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* INVOICE SETTLEMENT DRAWER                                      */}
      {/* ------------------------------------------------------------- */}
      {payingInvoice && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">Settle Wholesale Invoice</h3>
              <button
                type="button"
                onClick={() => setPayingInvoice(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-100 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Invoice:</span>
                <span className="font-black text-slate-900">{payingInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Distributor:</span>
                <span className="font-black text-teal-900">{payingInvoice.companyName}</span>
              </div>
              <div className="flex justify-between text-rose-600 font-bold pt-1 border-t border-teal-200/50">
                <span>Outstanding Due:</span>
                <span>৳{payingInvoice.dueAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">Payment Channel:</span>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {[
                  { id: "BKASH", label: "bKash", color: "bg-[#D12053] text-white" },
                  { id: "NAGAD", label: "Nagad", color: "bg-[#F7941D] text-white" },
                  { id: "BANK", label: "Bank", color: "bg-[#139485] text-white" },
                  { id: "CASH", label: "Cash", color: "bg-emerald-600 text-white" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      paymentMethod === m.id
                        ? `${m.color} shadow-xs ring-2 ring-slate-900`
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">Payment Amount (৳):</span>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                max={payingInvoice.dueAmount}
                min={1}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:outline-hidden focus:ring-2 focus:ring-[#139485]"
              />
            </div>

            {paySuccessMsg && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{paySuccessMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleExecutePayment}
              disabled={isProcessingPay || paymentAmount <= 0}
              className="w-full py-3 rounded-2xl bg-[#139485] hover:bg-teal-700 text-white text-xs font-black shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessingPay ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Confirm Settlement of ৳{paymentAmount.toLocaleString()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
