"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  DollarSign,
  User,
  Phone,
  Printer,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Scan,
  Tag,
  ArrowRight,
  ShieldCheck,
  Percent,
} from "lucide-react";
import { useApp } from "@/lib/context/AppContext";
import { IMedicine, PackagingUnit, PaymentMethod, IPosSaleItem, IPosSale } from "@/types/domain";
import { ThermalReceiptModal } from "@/components/pos/ThermalReceiptModal";
import { DailyClosingModal } from "@/components/pos/DailyClosingModal";

export default function PosPage() {
  const {
    medicines,
    batches,
    customers,
    posSales,
    recordPosSale,
    currentPharmacy,
    currentUser,
    language,
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormFilter, setSelectedFormFilter] = useState<string>("ALL");

  // Active POS Cart state
  const [cartItems, setCartItems] = useState<IPosSaleItem[]>([]);
  const [overallDiscountPercent, setOverallDiscountPercent] = useState<number>(0);

  // Customer state
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [cashTendered, setCashTendered] = useState<string>("");
  const [digitalTxnId, setDigitalTxnId] = useState<string>("");
  const [splitCashAmount, setSplitCashAmount] = useState<number>(0);

  // Modals state
  const [receiptSale, setReceiptSale] = useState<IPosSale | null>(null);
  const [isDailyClosingOpen, setIsDailyClosingOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dosage Form Filter options
  const formFilters = [
    { id: "ALL", label: "All Formulations" },
    { id: "TABLET", label: "Tablets" },
    { id: "CAPSULE", label: "Capsules" },
    { id: "SYRUP", label: "Syrups" },
    { id: "INJECTION", label: "Injections" },
  ];

  // Lookup existing customer when phone entered
  const handlePhoneChange = (phone: string) => {
    setCustomerPhone(phone);
    const existing = customers.find((c) => c.phone.trim() === phone.trim());
    if (existing) {
      setCustomerName(existing.name);
      if (existing.address) setCustomerAddress(existing.address);
    }
  };

  // Filter medicines by search & form
  const searchResults = useMemo(() => {
    return medicines.filter((m) => {
      const matchesSearch =
        searchQuery === "" ||
        m.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesForm =
        selectedFormFilter === "ALL" || m.dosageForm === selectedFormFilter;

      return matchesSearch && matchesForm;
    });
  }, [medicines, searchQuery, selectedFormFilter]);

  // Add medicine to POS Cart
  const handleAddToCart = (medicine: IMedicine, unit: PackagingUnit = PackagingUnit.STRIP) => {
    setErrorMsg(null);

    // Calculate available loose pieces
    const medBatches = batches.filter((b) => b.medicineId === medicine.id);
    const totalLooseStock = medBatches.reduce((acc, b) => acc + b.availableLooseUnits, 0);

    const boxPieces = medicine.piecesPerStrip * medicine.stripsPerBox;
    const piecesPerSelectedUnit =
      unit === PackagingUnit.BOX
        ? boxPieces
        : unit === PackagingUnit.STRIP
        ? medicine.piecesPerStrip
        : 1;

    // Unit MRP pricing
    const unitPrice =
      unit === PackagingUnit.BOX
        ? medicine.mrpPerPiece * boxPieces
        : unit === PackagingUnit.STRIP
        ? medicine.mrpPerPiece * medicine.piecesPerStrip
        : medicine.mrpPerPiece;

    // Nearest batch for reference
    const nearestBatch = medBatches
      .filter((b) => b.availableLooseUnits > 0)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0];

    const existingIndex = cartItems.findIndex(
      (it) => it.medicineId === medicine.id && it.unit === unit
    );

    if (existingIndex > -1) {
      const updated = [...cartItems];
      const newQty = updated[existingIndex].qty + 1;
      const totalPiecesNeeded = newQty * piecesPerSelectedUnit;

      if (totalPiecesNeeded > totalLooseStock) {
        setErrorMsg(`Insufficient stock for ${medicine.brandName}. Available: ${totalLooseStock} pieces.`);
        return;
      }

      updated[existingIndex].qty = newQty;
      updated[existingIndex].looseUnits = totalPiecesNeeded;
      updated[existingIndex].total =
        newQty * unitPrice * (1 - updated[existingIndex].discountPercent / 100);
      setCartItems(updated);
    } else {
      if (piecesPerSelectedUnit > totalLooseStock) {
        setErrorMsg(`Insufficient stock for ${medicine.brandName}. Available: ${totalLooseStock} pieces.`);
        return;
      }

      const newItem: IPosSaleItem = {
        medicineId: medicine.id,
        brandName: medicine.brandName,
        genericName: medicine.genericName,
        dosageForm: medicine.dosageForm,
        strength: medicine.strength,
        unit,
        qty: 1,
        looseUnits: piecesPerSelectedUnit,
        unitPrice,
        costPricePerPiece: medicine.tradePricePerPiece,
        discountPercent: 0,
        total: unitPrice,
        batchNumber: nearestBatch?.batchNumber || "STANDARD",
      };
      setCartItems([newItem, ...cartItems]);
    }
  };

  // Update item quantity
  const handleUpdateQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    const updated = [...cartItems];
    const it = updated[index];
    const med = medicines.find((m) => m.id === it.medicineId);
    const boxPieces = med ? med.piecesPerStrip * med.stripsPerBox : 100;
    const piecesPerUnit =
      it.unit === PackagingUnit.BOX
        ? boxPieces
        : it.unit === PackagingUnit.STRIP
        ? med?.piecesPerStrip || 10
        : 1;

    it.qty = newQty;
    it.looseUnits = newQty * piecesPerUnit;
    it.total = newQty * it.unitPrice * (1 - it.discountPercent / 100);
    setCartItems(updated);
  };

  // Update item unit (Box, Strip, Piece)
  const handleUpdateUnit = (index: number, newUnit: PackagingUnit) => {
    const updated = [...cartItems];
    const it = updated[index];
    const med = medicines.find((m) => m.id === it.medicineId);
    if (!med) return;

    const boxPieces = med.piecesPerStrip * med.stripsPerBox;
    const piecesPerUnit =
      newUnit === PackagingUnit.BOX
        ? boxPieces
        : newUnit === PackagingUnit.STRIP
        ? med.piecesPerStrip
        : 1;

    const newUnitPrice =
      newUnit === PackagingUnit.BOX
        ? med.mrpPerPiece * boxPieces
        : newUnit === PackagingUnit.STRIP
        ? med.mrpPerPiece * med.piecesPerStrip
        : med.mrpPerPiece;

    it.unit = newUnit;
    it.unitPrice = newUnitPrice;
    it.looseUnits = it.qty * piecesPerUnit;
    it.total = it.qty * newUnitPrice * (1 - it.discountPercent / 100);
    setCartItems(updated);
  };

  // Update item discount %
  const handleUpdateItemDiscount = (index: number, discPercent: number) => {
    const updated = [...cartItems];
    const it = updated[index];
    it.discountPercent = Math.max(0, Math.min(100, discPercent));
    it.total = it.qty * it.unitPrice * (1 - it.discountPercent / 100);
    setCartItems(updated);
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  // Financial calculations
  const rawSubtotal = cartItems.reduce((acc, it) => acc + it.qty * it.unitPrice, 0);
  const itemsDiscountSum = cartItems.reduce(
    (acc, it) => acc + (it.qty * it.unitPrice * it.discountPercent) / 100,
    0
  );
  const billDiscountAmount =
    overallDiscountPercent > 0 ? (rawSubtotal - itemsDiscountSum) * (overallDiscountPercent / 100) : 0;
  const totalDiscount = itemsDiscountSum + billDiscountAmount;
  const taxableAmount = Math.max(0, rawSubtotal - totalDiscount);
  const vatAmount = taxableAmount * 0.024; // 2.4% pharma VAT
  const netTotal = Math.round((taxableAmount + vatAmount) * 100) / 100;

  // Tendered cash calculation
  const numericTendered = parseFloat(cashTendered) || 0;
  const changeToReturn =
    paymentMethod === "CASH" && numericTendered > netTotal ? numericTendered - netTotal : 0;

  // Process and finalize Sale
  const handleCompleteSale = () => {
    setErrorMsg(null);
    if (cartItems.length === 0) {
      setErrorMsg("Cannot complete sale: Cart is empty.");
      return;
    }

    if (paymentMethod === "DUE" && (!customerName.trim() || !customerPhone.trim())) {
      setErrorMsg("Customer Name and Phone number are required for Credit (Due) sales.");
      return;
    }

    let cashPaid = 0;
    let digitalPaid = 0;
    let dueAmount = 0;

    if (paymentMethod === "CASH") {
      cashPaid = Math.min(numericTendered || netTotal, netTotal);
      if (numericTendered < netTotal && numericTendered > 0) {
        dueAmount = netTotal - numericTendered;
      }
    } else if (paymentMethod === "BKASH" || paymentMethod === "NAGAD") {
      digitalPaid = netTotal;
    } else if (paymentMethod === "DUE") {
      dueAmount = netTotal;
    } else if (paymentMethod === "SPLIT") {
      cashPaid = splitCashAmount;
      dueAmount = Math.max(0, netTotal - splitCashAmount);
    }

    const newSale = recordPosSale({
      customerName: customerName || "Walking Customer",
      customerPhone: customerPhone || "",
      customerAddress,
      items: cartItems,
      subtotal: rawSubtotal,
      discountAmount: totalDiscount,
      vatAmount,
      netTotal,
      paymentMethod,
      cashPaid,
      digitalPaid,
      digitalTxnId,
      dueAmount,
      changeGiven: changeToReturn,
      servedBy: `${currentUser.name} (Terminal #01)`,
    });

    // Reset POS form
    setCartItems([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setCashTendered("");
    setDigitalTxnId("");
    setOverallDiscountPercent(0);

    // Open Thermal Receipt modal
    setReceiptSale(newSale);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#044a40] via-[#065F52] to-[#0a7a6a] p-4 sm:p-5 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              Retail Point of Sale
            </span>
            <span className="text-xs text-emerald-100 font-mono">Terminal #01 • Cashier Ready</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Daily Sales (POS) Counter
          </h1>
          <p className="text-xs text-emerald-100/80">
            Instant medicine search, strip/box billing, multi-tender payment, auto FEFO stock reduction & customer credit ledger.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsDailyClosingOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 hover:scale-102"
          >
            <FileText className="w-4 h-4 text-emerald-300" />
            <span>Daily Closing (Z-Report)</span>
          </button>

          <Link
            href="/customer-due"
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-2 hover:scale-102"
          >
            <CreditCard className="w-4 h-4" />
            <span>Customer Due Ledger</span>
          </Link>
        </div>
      </div>

      {/* Main Two-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* =================================================================== */}
        {/* LEFT COLUMN: Medicine Catalog Search & Quick Selector (7 Cols)      */}
        {/* =================================================================== */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Search Box & Quick Form Filters */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicine by Brand, Generic, or DGDA Code (e.g. Napa, Seclo, Ciprocin)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {formFilters.map((flt) => (
                <button
                  key={flt.id}
                  onClick={() => setSelectedFormFilter(flt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedFormFilter === flt.id
                      ? "bg-[#065F52] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {flt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Medicine List Cards */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-2 max-h-[620px] overflow-y-auto">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
              <span>Catalog Medicines ({searchResults.length})</span>
              <span>Click to add Strip or Box</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {searchResults.map((med) => {
                const medBatches = batches.filter((b) => b.medicineId === med.id);
                const totalLooseStock = medBatches.reduce((acc, b) => acc + b.availableLooseUnits, 0);
                const isOutOfStock = totalLooseStock <= 0;
                const isLowStock = totalLooseStock < 150 && !isOutOfStock;

                return (
                  <div
                    key={med.id}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/20 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-bold">
                          {med.dosageForm}
                        </span>

                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                            Stock Out
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            {totalLooseStock} pcs left
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {totalLooseStock} pcs
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-sm text-slate-900 group-hover:text-emerald-700 transition-colors mt-2">
                        {med.brandName}
                      </h3>
                      <div className="text-xs font-semibold text-slate-500">{med.strength}</div>
                      <div className="text-[11px] text-slate-400 truncate">{med.genericName}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{med.manufacturer}</div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between gap-1.5">
                      <div>
                        <span className="text-[10px] text-slate-400 block leading-tight">MRP / Pcs</span>
                        <strong className="text-sm font-mono font-black text-slate-900">
                          ৳{med.mrpPerPiece.toFixed(2)}
                        </strong>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAddToCart(med, PackagingUnit.STRIP)}
                          disabled={isOutOfStock}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold transition-all disabled:opacity-40"
                          title="Add 1 Strip"
                        >
                          +Strip
                        </button>
                        <button
                          onClick={() => handleAddToCart(med, PackagingUnit.BOX)}
                          disabled={isOutOfStock}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm transition-all disabled:opacity-40 flex items-center gap-1"
                          title="Add 1 Box"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                          <span>Box</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: POS Billing Cart, Customer & Checkout (5 Cols)        */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-md space-y-4">
            
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-base text-slate-900">Active Sale Cart</h2>
                  <span className="text-xs text-slate-400">{cartItems.length} line items added</span>
                </div>
              </div>

              {cartItems.length > 0 && (
                <button
                  onClick={() => setCartItems([])}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Customer Details Accordion/Section */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Customer Profile (For Receipt & Due)</span>
                </div>
                {customerPhone && customers.some((c) => c.phone.trim() === customerPhone.trim()) && (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Registered
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Customer Phone (e.g. 01711...)"
                  value={customerPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Customer Full Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Outstanding Due alert if known customer */}
              {customerPhone && (() => {
                const existing = customers.find((c) => c.phone.trim() === customerPhone.trim());
                if (existing && existing.currentDue > 0) {
                  return (
                    <div className="text-[11px] font-semibold text-rose-700 bg-rose-50 p-2 rounded-xl border border-rose-200 flex justify-between">
                      <span>Previous Unpaid Due:</span>
                      <strong className="font-mono">৳{existing.currentDue.toLocaleString()}</strong>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Cart Items List */}
            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {cartItems.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-1">
                  <ShoppingCart className="w-8 h-8 mx-auto opacity-30" />
                  <p className="text-xs">No medicines in cart yet.</p>
                  <p className="text-[11px] text-slate-400">Click items on the left to add to sale.</p>
                </div>
              ) : (
                cartItems.map((item, idx) => (
                  <div
                    key={`${item.medicineId}-${item.unit}-${idx}`}
                    className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-black text-xs text-slate-900">{item.brandName}</h4>
                        <span className="text-[10px] text-slate-400">{item.strength}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs">
                      {/* Unit Selector */}
                      <select
                        value={item.unit}
                        onChange={(e) => handleUpdateUnit(idx, e.target.value as PackagingUnit)}
                        className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 focus:outline-none"
                      >
                        <option value={PackagingUnit.PIECE}>Piece</option>
                        <option value={PackagingUnit.STRIP}>Strip</option>
                        <option value={PackagingUnit.BOX}>Box</option>
                      </select>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateQty(idx, item.qty - 1)}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-slate-900 w-6 text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(idx, item.qty + 1)}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <div className="font-mono font-black text-slate-900">৳{item.total.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400">@ ৳{item.unitPrice.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Subtotal & Discount Slabs */}
            {cartItems.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Subtotal:</span>
                  <span className="font-mono font-bold text-slate-900">৳{rawSubtotal.toFixed(2)}</span>
                </div>

                {/* Overall Discount Input */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bill Discount (%):</span>
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={overallDiscountPercent || ""}
                    onChange={(e) => setOverallDiscountPercent(Number(e.target.value))}
                    placeholder="0%"
                    className="w-16 px-2 py-1 rounded-lg border border-slate-300 bg-white font-mono font-bold text-right text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Total Discount Saved:</span>
                    <span className="font-mono">-৳{totalDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Pharma VAT (2.4%):</span>
                  <span className="font-mono">৳{vatAmount.toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="font-bold text-sm text-slate-900">NET TOTAL PAYABLE:</span>
                  <span className="font-mono font-black text-xl text-emerald-700">
                    ৳{netTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Payment Method Selector */}
            {cartItems.length > 0 && (
              <div className="space-y-3 pt-1">
                <label className="text-xs font-bold text-slate-700 block">Select Payment Channel:</label>
                
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setPaymentMethod("CASH")}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                      paymentMethod === "CASH"
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    💵 Cash
                  </button>

                  <button
                    onClick={() => setPaymentMethod("BKASH")}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                      paymentMethod === "BKASH"
                        ? "bg-[#D12053] text-white shadow-sm"
                        : "bg-pink-50 text-pink-700 hover:bg-pink-100"
                    }`}
                  >
                    📱 bKash
                  </button>

                  <button
                    onClick={() => setPaymentMethod("NAGAD")}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                      paymentMethod === "NAGAD"
                        ? "bg-[#F7931E] text-white shadow-sm"
                        : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                    }`}
                  >
                    🟠 Nagad
                  </button>

                  <button
                    onClick={() => setPaymentMethod("DUE")}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                      paymentMethod === "DUE"
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                    }`}
                  >
                    📑 Due
                  </button>
                </div>

                {/* Cash Tendered Input & Change Return */}
                {paymentMethod === "CASH" && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-slate-700">Amount Tendered (৳):</span>
                      <input
                        type="number"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        placeholder={`৳${netTotal.toFixed(2)}`}
                        className="w-32 px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-mono font-black text-right text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {changeToReturn > 0 && (
                      <div className="flex items-center justify-between text-xs font-black text-emerald-800 bg-emerald-100 p-2 rounded-lg">
                        <span>Change to Return to Customer:</span>
                        <span className="font-mono text-sm">৳{changeToReturn.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Digital Txn ID for bKash/Nagad */}
                {(paymentMethod === "BKASH" || paymentMethod === "NAGAD") && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 block">
                      Transaction ID (TrxID):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9A8821990"
                      value={digitalTxnId}
                      onChange={(e) => setDigitalTxnId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {/* Due Sale Warning */}
                {paymentMethod === "DUE" && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-rose-600" />
                      <span>Credit Sale (Customer Due Ledger)</span>
                    </div>
                    <p className="text-[11px] text-rose-700">
                      Full amount of <strong>৳{netTotal.toFixed(2)}</strong> will be charged to{" "}
                      {customerName || "Customer"}'s ledger account.
                    </p>
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  onClick={handleCompleteSale}
                  className="w-full py-3.5 rounded-2xl bg-[#065F52] hover:bg-[#044a40] text-white font-black text-sm shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-emerald-300" />
                  <span>Complete Sale & Print Receipt</span>
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Today's Recent Sales Section */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="font-black text-sm text-slate-900">Today's Completed Sales ({posSales.length})</h3>
          </div>
          <Link
            href="/reports"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <span>View Full Sales Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                <th className="pb-2.5">Invoice #</th>
                <th className="pb-2.5">Time</th>
                <th className="pb-2.5">Customer</th>
                <th className="pb-2.5">Items</th>
                <th className="pb-2.5">Method</th>
                <th className="pb-2.5 text-right">Net Total</th>
                <th className="pb-2.5 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posSales.slice(0, 5).map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 font-mono font-bold text-slate-900">{sale.invoiceNo}</td>
                  <td className="py-2.5 text-slate-500">
                    {new Date(sale.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="py-2.5">
                    <span className="font-semibold text-slate-800">{sale.customerName}</span>
                    {sale.customerPhone && (
                      <span className="block text-[10px] text-slate-400 font-mono">{sale.customerPhone}</span>
                    )}
                  </td>
                  <td className="py-2.5 text-slate-600">{sale.items.length} items</td>
                  <td className="py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        sale.paymentMethod === "CASH"
                          ? "bg-slate-100 text-slate-800"
                          : sale.paymentMethod === "BKASH"
                          ? "bg-pink-100 text-pink-800"
                          : sale.paymentMethod === "NAGAD"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono font-black text-slate-900">
                    ৳{sale.netTotal.toFixed(2)}
                  </td>
                  <td className="py-2.5 text-center">
                    <button
                      onClick={() => setReceiptSale(sale)}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                    >
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ThermalReceiptModal sale={receiptSale} onClose={() => setReceiptSale(null)} />
      {isDailyClosingOpen && <DailyClosingModal onClose={() => setIsDailyClosingOpen(false)} />}

    </div>
  );
}
