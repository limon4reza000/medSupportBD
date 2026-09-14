"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  ShoppingCart,
  TrendingUp,
  Tag,
  Clock,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Plus,
  Eye,
  CheckCircle2,
  Package,
  Layers,
  Calendar,
  Building2,
  DollarSign,
  FileText,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { PackagingUnit, OrderStatus } from "@/types/domain";

export default function DashboardPage() {
  const router = useRouter();
  const {
    currentPharmacy,
    medicines,
    batches,
    offers,
    orders,
    addToCart,
    setIsQuickOrderOpen,
  } = useApp();

  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const availableCredit = Math.max(0, currentPharmacy.creditLimit - currentPharmacy.currentBalance);
  const pendingOrders = orders.filter(
    (o) => o.status === OrderStatus.PROCESSING || o.status === OrderStatus.PENDING_CREDIT_APPROVAL
  );
  const monthlyPurchase = orders
    .filter((o) => o.pharmacyId === currentPharmacy.id)
    .reduce((acc, o) => acc + o.netPayableAmount, 0);

  const handleQuickAdd = (medicineId: string) => {
    addToCart({ medicineId, orderedUnit: PackagingUnit.BOX, orderedQty: 1 });
    setAddedMap((prev) => ({ ...prev, [medicineId]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [medicineId]: false }));
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header & Fast Jump */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              Pharmacy Hub
            </span>
            <span className="text-xs text-emerald-200 font-mono">
              {currentPharmacy.code}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            {currentPharmacy.tradeName}
          </h1>
          <p className="text-xs text-emerald-100/80">
            {currentPharmacy.address}, {currentPharmacy.thana}, {currentPharmacy.district}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQuickOrderOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#01382a] text-xs font-bold shadow-md transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Cut New Order</span>
          </button>
          <Link
            href="/cart"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Go to Cart</span>
          </Link>
        </div>
      </div>

      {/* 6 KEY METRICS STAT CARDS (Pure White Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        
        {/* Card 1: Credit Limit */}
        <div className="premium-card p-4 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Credit Limit</div>
            <div className="text-xl font-black font-mono text-slate-900 mt-1">
              ৳{currentPharmacy.creditLimit.toLocaleString()}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2">
            30-day revolving line
          </div>
        </div>

        {/* Card 2: Available Credit */}
        <div className="premium-card p-4 flex flex-col justify-between border-emerald-300">
          <div>
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Available Credit</div>
            <div className="text-xl font-black font-mono text-emerald-700 mt-1">
              ৳{availableCredit.toLocaleString()}
            </div>
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-2">
            Headroom for new orders
          </div>
        </div>

        {/* Card 3: Outstanding Balance */}
        <div className="premium-card p-4 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Outstanding</div>
            <div className="text-xl font-black font-mono text-slate-900 mt-1">
              ৳{currentPharmacy.currentBalance.toLocaleString()}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2">
            Due in 18 days
          </div>
        </div>

        {/* Card 4: Overdue Balance */}
        <div className="premium-card p-4 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overdue Balance</div>
            <div className="text-xl font-black font-mono text-emerald-700 mt-1">
              ৳0.00
            </div>
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-2">
            Clean credit standing
          </div>
        </div>

        {/* Card 5: Current Month Purchase */}
        <div className="premium-card p-4 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Month Purchase</div>
            <div className="text-xl font-black font-mono text-slate-900 mt-1">
              ৳{monthlyPurchase.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2">
            {orders.length} total invoices
          </div>
        </div>

        {/* Card 6: Pending Orders */}
        <div className="premium-card p-4 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Orders</div>
            <div className="text-xl font-black font-mono text-amber-600 mt-1">
              {pendingOrders.length}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2">
            In dispatch queue
          </div>
        </div>

      </div>

      {/* MIDDLE SECTION: Pending Orders & AI Demand Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Pending Orders Tracking (Pure White Card) */}
        <div className="lg:col-span-2 premium-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-sm text-slate-900">Live Orders in Pipeline</h2>
            </div>
            <Link
              href="/my-orders"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
            >
              All Orders ({orders.length}) <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="mt-3 space-y-2.5">
            {orders.slice(0, 3).map((ord) => (
              <div
                key={ord.id}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-emerald-300 bg-slate-50/50 hover:bg-emerald-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{ord.orderNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ord.status === "DELIVERED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {ord.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {ord.totalItems} Items ({ord.totalLoosePieces} pcs + {ord.totalBonusPieces} bonus pcs)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Assigned SR: {ord.assignedSalesRep} • Expected: {ord.expectedDelivery}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Amount</div>
                    <div className="text-sm font-black font-mono text-emerald-800">
                      ৳{ord.netPayableAmount.toLocaleString()}
                    </div>
                  </div>
                  <Link
                    href={`/orders/${ord.id}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Restock Assistant (Pure White Card) */}
        <div className="premium-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-sm text-slate-900">AI Demand Insights</h2>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-950 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-900">Zimax 500 (Azithromycin)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                  Critical Stockout
                </span>
              </div>
              <p className="text-[11px] text-teal-800 leading-relaxed">
                Seasonal monsoon respiratory surge detected (+28% velocity). Local depot stock is under 18 loose pieces.
              </p>
              <div className="text-[11px] font-semibold text-teal-900 flex justify-between pt-1">
                <span>Suggested Reorder:</span>
                <strong className="font-mono font-bold">15 Boxes (270 pcs)</strong>
              </div>
            </div>

            <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
              <div className="font-bold text-slate-800">Monas 10 Reorder Bonus</div>
              <div className="text-[11px] text-slate-500">
                Current running trade offer: 5% bonus loose pieces on 2+ Boxes.
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              href="/ai-insights"
              className="w-full py-2.5 rounded-xl bg-[#025540] hover:bg-[#036b51] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Explore AI 30-Day Forecast</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* FREQUENTLY ORDERED MEDICINES (Pure White Cards) */}
      <div className="premium-card p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-slate-900">Frequently Reordered Medicines</h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            Full Catalog ({medicines.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {medicines.slice(0, 4).map((med) => {
            const medBatches = batches.filter((b) => b.medicineId === med.id);
            const totalStockPieces = medBatches.reduce((acc, b) => acc + b.availableLooseUnits, 0);
            const boxPieces = med.piecesPerStrip * med.stripsPerBox;
            const boxTradePrice = (med.tradePricePerPiece * boxPieces).toFixed(2);
            const isAdded = !!addedMap[med.id];

            return (
              <div
                key={med.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {med.dosageForm}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700">
                      {totalStockPieces} pcs avail
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <Link
                      href={`/products/${med.id}`}
                      className="font-black text-sm text-slate-900 hover:text-emerald-700 line-clamp-1"
                    >
                      {med.brandName}
                    </Link>
                    <div className="text-xs font-semibold text-slate-600">{med.strength}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">{med.genericName}</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400">Trade Price</div>
                    <div className="text-sm font-black font-mono text-slate-900">৳{boxTradePrice}/Box</div>
                  </div>

                  <button
                    onClick={() => handleQuickAdd(med.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      isAdded
                        ? "bg-emerald-600 text-white"
                        : "bg-[#025540] hover:bg-[#036b51] text-white"
                    }`}
                  >
                    {isAdded ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{isAdded ? "Added" : "+1 Box"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
