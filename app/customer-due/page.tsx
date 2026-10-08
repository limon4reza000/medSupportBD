"use client";

import React, { useState, useMemo } from "react";
import {
  CreditCard,
  Search,
  DollarSign,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  Calendar,
  User,
  X,
  History,
  ArrowRight,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { ICustomer, ICustomerPayment } from "@/types/domain";

export default function CustomerDuePage() {
  const {
    customers,
    customerPayments,
    recordCustomerPayment,
    currentPharmacy,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "WITH_DUE" | "CLEARED">("ALL");

  // Payment Collection Modal State
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<number>(1000);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BKASH" | "NAGAD" | "BANK">("CASH");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Selected customer for history view
  const [historyCustomer, setHistoryCustomer] = useState<ICustomer | null>(null);

  // Summary Metrics
  const totalOutstandingDue = customers.reduce((acc, c) => acc + c.currentDue, 0);
  const totalCustomersWithDue = customers.filter((c) => c.currentDue > 0).length;
  const totalCollections = customerPayments.reduce((acc, p) => acc + p.amount, 0);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.address && c.address.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (filterType === "WITH_DUE") return c.currentDue > 0;
      if (filterType === "CLEARED") return c.currentDue === 0;
      return true;
    });
  }, [customers, searchQuery, filterType]);

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Send WhatsApp Reminder
  const handleSendWhatsAppReminder = (cust: ICustomer) => {
    const text = encodeURIComponent(
      `Assalamu Alaikum ${cust.name},\nThis is a polite reminder from *${currentPharmacy.tradeName}* regarding your pharmacy purchase account.\n\n` +
      `Your current outstanding balance is: *৳${cust.currentDue.toLocaleString()}*.\n\n` +
      `You may clear your due in store or send via bKash/Nagad to ${currentPharmacy.phone}.\nThank you!`
    );
    const phone = cust.phone ? cust.phone.replace(/[^0-9]/g, "") : "";
    const cleanPhone = phone.startsWith("88") ? phone : phone.startsWith("01") ? `88${phone}` : phone;
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  // Send SMS Reminder
  const handleSendSmsReminder = (cust: ICustomer) => {
    const body = encodeURIComponent(
      `Reminder from ${currentPharmacy.tradeName}: Your due balance is BDT ${cust.currentDue}. Please visit our pharmacy to settle. Helpline: ${currentPharmacy.phone}`
    );
    const phone = cust.phone ? cust.phone.replace(/[^0-9]/g, "") : "";
    window.open(`sms:${phone}?body=${body}`, "_blank");
  };

  // Handle Payment Collection Submit
  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || paymentAmount <= 0) return;

    const cust = customers.find((c) => c.id === selectedCustomerId);
    if (!cust) return;

    recordCustomerPayment({
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      amount: paymentAmount,
      paymentMethod,
      referenceNo: `COLL-${Date.now()}`,
      notes: paymentNotes || "In-store due collection",
    });

    setIsCollectModalOpen(false);
    setPaymentNotes("");
    setSuccessToast(`Successfully recorded ৳${paymentAmount} collection from ${cust.name}.`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#044a40] via-[#065F52] to-[#0a7a6a] p-5 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              Customer Accounts Receivable
            </span>
            <span className="text-xs text-emerald-100 font-mono">Baki Khata Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Customer Due Ledger & Credit Reminders
          </h1>
          <p className="text-xs text-emerald-100/80">
            Track individual customer debts, record repayments, and send courteous due reminders via WhatsApp & SMS.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setSelectedCustomerId(customers[0]?.id || "");
              setIsCollectModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-2 hover:scale-102"
          >
            <DollarSign className="w-4 h-4" />
            <span>Collect Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Outstanding Due</div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-rose-700 mt-1">
            ৳{totalOutstandingDue.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {totalCustomersWithDue} indebted customers
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Recovered Collections</div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 mt-1">
            ৳{totalCollections.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {customerPayments.length} Payments recorded
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Credit Customers</div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-1">
            {customers.length} Accounts
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Auto-enrolled on credit POS sales</div>
        </div>
      </div>

      {/* Toast Alert */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === "ALL" ? "bg-[#065F52] text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            All Accounts ({customers.length})
          </button>
          <button
            onClick={() => setFilterType("WITH_DUE")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === "WITH_DUE" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-800"
            }`}
          >
            Has Due Balance ({totalCustomersWithDue})
          </button>
          <button
            onClick={() => setFilterType("CLEARED")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === "CLEARED" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-800"
            }`}
          >
            Cleared (0 Due)
          </button>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Customers Due Table */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                <th className="pb-3">Customer Profile</th>
                <th className="pb-3">Mobile Contact</th>
                <th className="pb-3">Address</th>
                <th className="pb-3 text-right">Total Purchases</th>
                <th className="pb-3 text-right">Total Paid</th>
                <th className="pb-3 text-right">Outstanding Due</th>
                <th className="pb-3">Last Activity</th>
                <th className="pb-3 text-center">Due Reminders</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5">
                    <span className="font-bold text-slate-900 block">{cust.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {cust.id}</span>
                  </td>

                  <td className="py-3.5 font-mono text-slate-800 font-bold">{cust.phone}</td>

                  <td className="py-3.5 text-slate-500 max-w-[180px] truncate">
                    {cust.address || "Local Customer"}
                  </td>

                  <td className="py-3.5 text-right font-mono text-slate-700">
                    ৳{cust.totalCreditPurchases.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3.5 text-right font-mono text-emerald-700 font-bold">
                    ৳{cust.totalPaid.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3.5 text-right">
                    {cust.currentDue > 0 ? (
                      <span className="font-mono font-black text-rose-700 text-sm">
                        ৳{cust.currentDue.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Cleared
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 text-slate-500 text-[11px]">
                    {new Date(cust.lastPurchaseDate).toLocaleDateString()}
                  </td>

                  {/* WhatsApp and SMS Reminders */}
                  <td className="py-3.5 text-center">
                    {cust.currentDue > 0 ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleSendWhatsAppReminder(cust)}
                          className="p-1.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] transition-colors"
                          title="Send WhatsApp Reminder"
                        >
                          <MessageCircle className="w-4 h-4 fill-current" />
                        </button>

                        <button
                          onClick={() => handleSendSmsReminder(cust)}
                          className="px-2 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold transition-colors"
                          title="Send SMS Reminder"
                        >
                          SMS
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400">No balance</span>
                    )}
                  </td>

                  {/* Collect button */}
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {cust.currentDue > 0 && (
                        <button
                          onClick={() => {
                            setSelectedCustomerId(cust.id);
                            setPaymentAmount(Math.min(cust.currentDue, 1000));
                            setIsCollectModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-all"
                        >
                          Collect
                        </button>
                      )}

                      <button
                        onClick={() => setHistoryCustomer(cust)}
                        className="px-2 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-[11px]"
                        title="Ledger statement"
                      >
                        Ledger
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Payment Modal */}
      {isCollectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 bg-gradient-to-r from-[#044a40] to-[#065F52] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-300" />
                <h3 className="font-black text-base">Collect Customer Due Payment</h3>
              </div>
              <button onClick={() => setIsCollectModalOpen(false)}>
                <X className="w-5 h-5 text-white/80" />
              </button>
            </div>

            <form onSubmit={handleCollectSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer Account *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    const c = customers.find((x) => x.id === e.target.value);
                    if (c) setPaymentAmount(c.currentDue);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - Due: ৳{c.currentDue.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {activeCustomer && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Current Outstanding Due:</span>
                  <strong className="font-mono text-base font-black text-rose-700">
                    ৳{activeCustomer.currentDue.toLocaleString()}
                  </strong>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Payment Amount (৳) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-black text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:outline-none"
                >
                  <option value="CASH">Cash in Store</option>
                  <option value="BKASH">bKash Merchant</option>
                  <option value="NAGAD">Nagad Payment</option>
                  <option value="BANK">Bank Deposit</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Receipt Notes / Voucher</label>
                <input
                  type="text"
                  placeholder="e.g. Received by Pharmacist Tariqul at evening counter"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  Confirm & Update Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Ledger Statement Drawer / Modal */}
      {historyCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-base">{historyCustomer.name}</h3>
                <span className="text-xs text-slate-400 font-mono">Mobile: {historyCustomer.phone}</span>
              </div>
              <button onClick={() => setHistoryCustomer(null)}>
                <X className="w-5 h-5 text-white/80" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-medium block">Total Credit Purchases</span>
                  <strong className="font-mono text-slate-900 text-sm">
                    ৳{historyCustomer.totalCreditPurchases.toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Remaining Due</span>
                  <strong className="font-mono text-rose-700 text-sm">
                    ৳{historyCustomer.currentDue.toLocaleString()}
                  </strong>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 mb-2">Payment Collection Records:</h4>
                <div className="space-y-2">
                  {customerPayments
                    .filter((p) => p.customerId === historyCustomer.id)
                    .map((pay) => (
                      <div
                        key={pay.id}
                        className="p-3 rounded-xl border border-slate-200 bg-white flex justify-between items-center"
                      >
                        <div>
                          <strong className="text-emerald-700 font-mono">
                            +৳{pay.amount.toFixed(2)}
                          </strong>
                          <span className="text-slate-500 block text-[10px] mt-0.5">
                            {pay.paymentMethod} • {pay.notes || "Repayment"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(pay.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  {customerPayments.filter((p) => p.customerId === historyCustomer.id).length === 0 && (
                    <p className="text-slate-400 italic">No collections recorded yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setHistoryCustomer(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
