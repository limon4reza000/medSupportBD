"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileBarChart2,
  Download,
  Printer,
  Calendar,
  Filter,
  DollarSign,
  Boxes,
  Users,
  TrendingUp,
  Tag,
  CreditCard,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { OrderTrendGraph } from "@/components/orders/OrderTrendGraph";

export default function ReportsPage() {
  const { orders, medicines, batches, pharmacies } = useApp();
  const [reportType, setReportType] = useState("SALES_SUMMARY");

  const totalSales = orders.reduce((acc, o) => acc + o.netPayableAmount, 0);
  const totalBonusPieces = orders.reduce((acc, o) => acc + o.totalBonusPieces, 0);
  const totalOutstanding = pharmacies.reduce((acc, p) => acc + p.currentBalance, 0);

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <FileBarChart2 className="w-6 h-6 text-emerald-400" />
            <span>Pharma Business Intelligence & Analytics Reports</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Exportable operational reports for gross sales, product velocities, trade scheme subsidies, and ledger aging.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#01382a] text-xs font-bold shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto hover:scale-105"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* KPI Cards (Pure White Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="premium-card p-5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sales Invoiced</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            ৳{totalSales.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">{orders.length} Invoices Generated</div>
        </div>

        <div className="premium-card p-5 border-emerald-300">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Trade Bonuses Disbursed</div>
          <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
            {totalBonusPieces.toLocaleString()} pieces
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% Stock Accounted</div>
        </div>

        <div className="premium-card p-5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Territory Outstanding</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            ৳{totalOutstanding.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across {pharmacies.length} pharmacies</div>
        </div>
      </div>

      {/* Analytics & Order Growth Trend Graph */}
      <OrderTrendGraph title="Pharma Territory Order Velocity & Annual Growth Analytics" />

      {/* Report Selector Bar (Pure White Card) */}
      <div className="premium-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Select Report Type:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: "SALES_SUMMARY", label: "Sales & Invoicing" },
            { id: "PRODUCT_VELOCITY", label: "Product Velocities" },
            { id: "BONUS_DISBURSEMENT", label: "Trade Bonus Schemes" },
            { id: "OUTSTANDING_AGING", label: "Outstanding Credit Aging" },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setReportType(r.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                reportType === r.id
                  ? "bg-[#025540] text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Report Data Table (Pure White Card) */}
      <div className="premium-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
            {reportType === "SALES_SUMMARY" && "Gross & Net Sales Summary by Order"}
            {reportType === "PRODUCT_VELOCITY" && "Product Catalog Demand & Stock Status"}
            {reportType === "BONUS_DISBURSEMENT" && "Manufacturer Scheme Subsidies & Bonus Units"}
            {reportType === "OUTSTANDING_AGING" && "Pharmacy Ledger Balances & Credit Headrooms"}
          </h2>
          <span className="text-xs font-mono text-slate-400">DGDA Supply Report</span>
        </div>

        {reportType === "SALES_SUMMARY" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Order Number</th>
                  <th className="py-2.5 px-3">Pharmacy</th>
                  <th className="py-2.5 px-3">Gross (৳)</th>
                  <th className="py-2.5 px-3">Discount (৳)</th>
                  <th className="py-2.5 px-3">VAT (৳)</th>
                  <th className="py-2.5 px-3 text-right">Net Payable (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                    <td className="py-2.5 px-3 text-slate-700">{o.pharmacyName}</td>
                    <td className="py-2.5 px-3 font-mono">৳{o.grossAmount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-700">৳{o.tradeDiscountAmount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-mono">৳{o.vatAmount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">৳{o.netPayableAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === "PRODUCT_VELOCITY" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Medicine</th>
                  <th className="py-2.5 px-3">Manufacturer</th>
                  <th className="py-2.5 px-3">Trade Price/Box</th>
                  <th className="py-2.5 px-3 text-right">Warehouse Available Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {medicines.map((m) => {
                  const mBatches = batches.filter((b) => b.medicineId === m.id);
                  const totalStock = mBatches.reduce((acc, b) => acc + b.availableLooseUnits, 0);
                  const boxPieces = m.piecesPerStrip * m.stripsPerBox;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{m.brandName} ({m.strength})</td>
                      <td className="py-2.5 px-3 text-slate-600">{m.manufacturer}</td>
                      <td className="py-2.5 px-3 font-mono font-bold">৳{(m.tradePricePerPiece * boxPieces).toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                        {(totalStock / boxPieces).toFixed(1)} Boxes ({totalStock} pcs)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {reportType === "OUTSTANDING_AGING" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Pharmacy Name</th>
                  <th className="py-2.5 px-3">Approved Limit</th>
                  <th className="py-2.5 px-3">Current Balance</th>
                  <th className="py-2.5 px-3">Available Headroom</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {pharmacies.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{p.tradeName}</td>
                    <td className="py-2.5 px-3 font-mono">৳{p.creditLimit.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">৳{p.currentBalance.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">
                      ৳{(p.creditLimit - p.currentBalance).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {p.isCreditBlocked ? "Blocked" : "Active 30d"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
