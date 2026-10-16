"use client";

import React, { useState, useMemo } from "react";
import {
  DollarSign,
  Plus,
  Calendar,
  Receipt,
  Trash2,
  PieChart,
  Home,
  Zap,
  Users,
  Truck,
  Wrench,
  Coffee,
  MoreHorizontal,
  CheckCircle2,
  X,
  Filter,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { ExpenseCategory, IExpense } from "@/types/domain";

export default function ExpensesPage() {
  const { expenses, addExpense, deleteExpense, currentPharmacy } = useApp();

  const [selectedMonth, setSelectedMonth] = useState<string>("2026-10");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Add Expense Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>("RENT");
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState<number>(1500);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BKASH" | "NAGAD" | "BANK">("CASH");
  const [payee, setPayee] = useState("");
  const [expenseNotes, setExpenseNotes] = useState("");
  const [voucherNo, setVoucherNo] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Category visual metadata
  const categoryConfig: Record<
    ExpenseCategory,
    { label: string; icon: React.ReactNode; color: string; bg: string }
  > = {
    RENT: {
      label: "Shop Rent",
      icon: <Home className="w-4 h-4 text-purple-600" />,
      color: "#8B5CF6",
      bg: "bg-purple-100 text-purple-900",
    },
    ELECTRICITY: {
      label: "Electricity & Utilities",
      icon: <Zap className="w-4 h-4 text-amber-600" />,
      color: "#F59E0B",
      bg: "bg-amber-100 text-amber-900",
    },
    SALARY: {
      label: "Staff Salaries",
      icon: <Users className="w-4 h-4 text-blue-600" />,
      color: "#3B82F6",
      bg: "bg-blue-100 text-blue-900",
    },
    TRANSPORT: {
      label: "Transport & Logistics",
      icon: <Truck className="w-4 h-4 text-indigo-600" />,
      color: "#4F46E5",
      bg: "bg-indigo-100 text-indigo-900",
    },
    MAINTENANCE: {
      label: "Store Maintenance",
      icon: <Wrench className="w-4 h-4 text-rose-600" />,
      color: "#EF4444",
      bg: "bg-rose-100 text-rose-900",
    },
    TEA_SNACKS: {
      label: "Staff Refreshments",
      icon: <Coffee className="w-4 h-4 text-orange-600" />,
      color: "#F97316",
      bg: "bg-orange-100 text-orange-900",
    },
    OTHER: {
      label: "Other Expenses",
      icon: <MoreHorizontal className="w-4 h-4 text-slate-600" />,
      color: "#64748B",
      bg: "bg-slate-100 text-slate-800",
    },
  };

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchMonth = !selectedMonth || e.date.startsWith(selectedMonth);
      const matchCat = categoryFilter === "ALL" || e.category === categoryFilter;
      return matchMonth && matchCat;
    });
  }, [expenses, selectedMonth, categoryFilter]);

  // Total and category breakdowns
  const totalMonthExpense = useMemo(() => {
    const monthItems = expenses.filter((e) => !selectedMonth || e.date.startsWith(selectedMonth));
    return monthItems.reduce((acc, e) => acc + e.amount, 0);
  }, [expenses, selectedMonth]);

  const categoryBreakdown = useMemo(() => {
    const monthItems = expenses.filter((e) => !selectedMonth || e.date.startsWith(selectedMonth));
    const categoriesList = Object.keys(categoryConfig) as ExpenseCategory[];

    return categoriesList.map((cat) => {
      const items = monthItems.filter((e) => e.category === cat);
      const amount = items.reduce((acc, e) => acc + e.amount, 0);
      const percent = totalMonthExpense > 0 ? Math.round((amount / totalMonthExpense) * 100) : 0;
      return {
        category: cat,
        amount,
        percent,
        config: categoryConfig[cat],
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [expenses, selectedMonth, totalMonthExpense]);

  // Helper for Payment Method badge background and text colors (Bank, bKash, Nagad, Cash)
  const getPaymentBadge = (method: string) => {
    const m = (method || "").toUpperCase();
    if (m.includes("BKASH")) {
      return "bg-pink-100 text-pink-700 border-pink-200";
    }
    if (m.includes("NAGAD")) {
      return "bg-orange-100 text-orange-700 border-orange-200";
    }
    if (m.includes("BANK")) {
      return "bg-blue-100 text-blue-700 border-blue-200";
    }
    if (m.includes("CASH")) {
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle || expenseAmount <= 0) return;

    addExpense({
      date: expenseDate,
      category: expenseCategory,
      title: expenseTitle,
      amount: expenseAmount,
      paymentMethod,
      payee: payee || "Cash Counter",
      notes: expenseNotes,
      voucherNo: voucherNo || `VCH-${Date.now().toString().slice(-6)}`,
    });

    setIsAddModalOpen(false);
    setExpenseTitle("");
    setPayee("");
    setExpenseNotes("");
    setSuccessToast(`Expense "${expenseTitle}" of ৳${expenseAmount} successfully recorded.`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#241B52] via-[#2E236C] to-[#4338CA] p-5 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-400/20 text-indigo-200 border border-indigo-400/30">
              Operating Expenditure
            </span>
            <span className="text-xs text-indigo-100 font-mono">Store OPEX Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Expense Tracking & Utility Logs
          </h1>
          <p className="text-xs text-indigo-100/80">
            Track commercial rent, electricity, courier logistics, maintenance, and staff costs with monthly summaries.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-black text-xs shadow-md transition-all flex items-center gap-2 hover:scale-102"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add New Expense</span>
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-indigo-100 border border-indigo-300 text-indigo-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-indigo-700 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Monthly Expense Summary Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Total Month Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Monthly Operating Expenses
              </span>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                {selectedMonth}
              </span>
            </div>

            <div className="text-3xl font-black font-mono text-rose-700 mt-2">
              ৳{totalMonthExpense.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Directly deducted from Gross Profit to compute Net Store Profit in Reports.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Expenses Logged:</span>
            <strong className="text-slate-900">{filteredExpenses.length} Vouchers</strong>
          </div>
        </div>

        {/* Category Breakdown Progress Bars (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-600" />
              <span>Category Expense Breakdown ({selectedMonth})</span>
            </h3>
            <span className="text-xs text-slate-400">Share of Total OPEX</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {categoryBreakdown.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {item.config.icon}
                    <span className="font-bold text-slate-800">{item.config.label}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    ৳{item.amount.toLocaleString()}{" "}
                    <span className="text-[10px] text-slate-400 font-normal">({item.percent}%)</span>
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: item.config.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Filters Bar: Month & Category */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          {/* Month Filter */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial min-w-[135px]">
            <span className="text-xs font-bold text-slate-500 shrink-0">Month:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-auto px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0080ff]/20 min-w-0"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial min-w-[155px]">
            <span className="text-xs font-bold text-slate-500 shrink-0">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0080ff]/20 min-w-0"
            >
              <option value="ALL">All Categories</option>
              <option value="RENT">Shop Rent</option>
              <option value="ELECTRICITY">Electricity & Utilities</option>
              <option value="SALARY">Staff Salaries</option>
              <option value="TRANSPORT">Transport</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="TEA_SNACKS">Tea & Snacks</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-500 shrink-0">
          Showing {filteredExpenses.length} records
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[750px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="pb-3 pr-3 whitespace-nowrap">Date</th>
                <th className="pb-3 px-3 whitespace-nowrap">Category</th>
                <th className="pb-3 px-3 min-w-[180px]">Title / Expense Description</th>
                <th className="pb-3 px-3 min-w-[130px]">Payee / Vendor</th>
                <th className="pb-3 px-3 whitespace-nowrap">Payment Method</th>
                <th className="pb-3 px-3 whitespace-nowrap">Voucher #</th>
                <th className="pb-3 px-3 text-right whitespace-nowrap">Amount (৳)</th>
                <th className="pb-3 pl-3 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredExpenses.map((exp) => {
                const conf = categoryConfig[exp.category];

                return (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 pr-3 font-mono text-slate-600 whitespace-nowrap">{exp.date}</td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${conf.bg}`}>
                        {conf.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900 min-w-[180px]">
                      {exp.title}
                      {exp.notes && (
                        <span className="text-[10px] text-slate-400 font-normal block mt-0.5">{exp.notes}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 min-w-[130px]">{exp.payee}</td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded-md border ${getPaymentBadge(exp.paymentMethod)}`}>
                        {exp.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                      {exp.voucherNo || "—"}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-sm text-slate-900 whitespace-nowrap">
                      ৳{exp.amount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 pl-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete voucher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 bg-gradient-to-r from-[#241B52] via-[#2E236C] to-[#4338CA] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-200" />
                <h3 className="font-black text-base">Record Operating Expense</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5 text-white/80" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expense Date *</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:outline-none"
                  >
                    <option value="RENT">Shop Rent</option>
                    <option value="ELECTRICITY">Electricity & Utilities</option>
                    <option value="SALARY">Staff Salaries</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="TEA_SNACKS">Tea & Snacks</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Expense Title / Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. October Commercial Rent / Water bill"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Amount (৳) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-black text-sm text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:outline-none"
                  >
                    <option value="CASH">Cash Drawer</option>
                    <option value="BKASH">bKash</option>
                    <option value="NAGAD">Nagad</option>
                    <option value="BANK">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payee / Recipient</label>
                  <input
                    type="text"
                    placeholder="e.g. Landlord / DESCO"
                    value={payee}
                    onChange={(e) => setPayee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Voucher / Bill No</label>
                  <input
                    type="text"
                    placeholder="VCH-001"
                    value={voucherNo}
                    onChange={(e) => setVoucherNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes / Additional Info</label>
                <textarea
                  rows={2}
                  placeholder="Optional details..."
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
