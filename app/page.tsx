"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  MapPin,
  Clock,
  ShieldCheck,
  LayoutDashboard,
  Building2,
  Store,
  Factory,
  Truck,
  UserCheck,
  Camera,
  Boxes,
  Bell,
  User,
  Plus,
  Minus,
  CheckCircle2,
  Phone,
  Navigation,
  Package,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Activity,
  CreditCard,
  ThermometerSnowflake,
  ExternalLink,
} from "lucide-react";
import { UserRole } from "@/types/domain";

type MobileScreen =
  | "DASHBOARD"
  | "REGISTRATION"
  | "MEDICINES"
  | "MAP"
  | "ORDERS"
  | "INVENTORY"
  | "NOTIFICATIONS"
  | "PROFILE";

interface MedicineItem {
  id: string;
  name: string;
  generic: string;
  company: string;
  form: string;
  strength: string;
  unitPrice: number;
  boxPrice: number;
  stock: number;
  tradeOffer?: string;
  category: string;
}

interface DepotItem {
  id: string;
  name: string;
  location: string;
  distance: string;
  eta: string;
  coldChain: boolean;
  phone: string;
  rating: number;
  stockCoverage: number;
  status: "OPEN" | "DISPATCHING" | "BUSY";
}

export default function MobileAppPage() {
  const [activeScreen, setActiveScreen] = useState<MobileScreen>("DASHBOARD");
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.PHARMACY_OWNER);

  // Authenticated User State
  const [userProfile, setUserProfile] = useState({
    name: "Mahfuzul Islam",
    phone: "01712-345678",
    pharmacyName: "Lazz Pharma (Dhanmondi Branch)",
    tradeLicense: "TRAD-DHK-2024-88492",
    dgdaLicense: "DGDA-PH-99214",
    tin: "eTIN-77492019482",
    address: "House 24, Road 7, Dhanmondi, Dhaka",
    creditLimit: 50000,
    outstandingDue: 14250,
  });

  // Role-Based Registration State
  const [regRole, setRegRole] = useState<UserRole>(UserRole.PHARMACY_OWNER);
  const [regStep, setRegStep] = useState<number>(1);
  const [regFormData, setRegFormData] = useState({
    fullName: "",
    phone: "",
    nidNumber: "",
    shopName: "",
    tradeLicense: "",
    tinNumber: "",
    address: "Tejgaon Commercial Area, Dhaka",
    hasCameraPhoto: false,
    companyName: "",
    corporateEmail: "",
    dgdaLicense: "",
    factoryLocation: "",
    depotName: "",
    managerName: "",
    capacitySqFt: "12500",
    hasColdChain: true,
    serviceArea: "Dhaka North & Gazipur",
    assignedCompany: "Square Pharmaceuticals Ltd",
    employeeId: "EMP-SQ-9942",
    territory: "Dhanmondi & Green Road Hub",
  });
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [registrationTrackingId, setRegistrationTrackingId] = useState<string | null>(null);

  // Cart & POS State
  const [cart, setCart] = useState<{ [id: string]: number }>({
    "med-01": 20, // 20 strips Napa Extra
    "med-02": 10, // 10 strips Seclo 20
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [paymentMethod, setPaymentMethod] = useState<"BKASH" | "NAGAD" | "BANK" | "CASH">("BKASH");

  // Sample Medicine Dataset (Realistic BD Pharmaceuticals)
  const medicineList: MedicineItem[] = [
    {
      id: "med-01",
      name: "Napa Extra",
      generic: "Paracetamol 500mg + Caffeine 65mg",
      company: "Square Pharmaceuticals",
      form: "Tablet",
      strength: "500mg+65mg",
      unitPrice: 2.5,
      boxPrice: 500,
      stock: 2400,
      tradeOffer: "10 + 1 FREE BOX",
      category: "Pain & Fever",
    },
    {
      id: "med-02",
      name: "Seclo 20mg",
      generic: "Omeprazole",
      company: "Square Pharmaceuticals",
      form: "Capsule",
      strength: "20mg",
      unitPrice: 6.0,
      boxPrice: 600,
      stock: 1850,
      tradeOffer: "10 + 1 FREE STRIP",
      category: "Gastric Care",
    },
    {
      id: "med-03",
      name: "Maxpro 20mg",
      generic: "Esomeprazole Magnesium Trihydrate",
      company: "Beximco Pharmaceuticals",
      form: "Tablet",
      strength: "20mg",
      unitPrice: 7.0,
      boxPrice: 700,
      stock: 920,
      tradeOffer: "15 + 1 SPECIAL",
      category: "Gastric Care",
    },
    {
      id: "med-04",
      name: "Sergel 20mg",
      generic: "Esomeprazole",
      company: "Incepta Pharmaceuticals",
      form: "Capsule",
      strength: "20mg",
      unitPrice: 7.0,
      boxPrice: 700,
      stock: 1400,
      tradeOffer: "10 + 1 FREE",
      category: "Gastric Care",
    },
    {
      id: "med-05",
      name: "Monas 10mg",
      generic: "Montelukast Sodium",
      company: "Acme Laboratories",
      form: "Tablet",
      strength: "10mg",
      unitPrice: 16.0,
      boxPrice: 480,
      stock: 580,
      tradeOffer: "5 + 1 FREE",
      category: "Respiratory",
    },
    {
      id: "med-06",
      name: "Ceevit 250mg",
      generic: "Ascorbic Acid (Vitamin C)",
      company: "Square Pharmaceuticals",
      form: "Chewable Tablet",
      strength: "250mg",
      unitPrice: 2.0,
      boxPrice: 400,
      stock: 3100,
      category: "Vitamins",
    },
    {
      id: "med-07",
      name: "Zimax 500mg",
      generic: "Azithromycin Dihydrate",
      company: "Beximco Pharmaceuticals",
      form: "Tablet",
      strength: "500mg",
      unitPrice: 35.0,
      boxPrice: 350,
      stock: 450,
      tradeOffer: "10 + 1 FREE BOX",
      category: "Antibiotics",
    },
    {
      id: "med-08",
      name: "Alatrol 10mg",
      generic: "Cetirizine Dihydrochloride",
      company: "Square Pharmaceuticals",
      form: "Tablet",
      strength: "10mg",
      unitPrice: 3.0,
      boxPrice: 300,
      stock: 1250,
      category: "Antihistamine",
    },
  ];

  // Nearby Depots Dataset
  const nearbyDepots: DepotItem[] = [
    {
      id: "depot-1",
      name: "Tejgaon Central Pharma Depot",
      location: "Tejgaon Industrial Area, Dhaka",
      distance: "1.2 km",
      eta: "25 mins",
      coldChain: true,
      phone: "01711-001122",
      rating: 4.9,
      stockCoverage: 98,
      status: "DISPATCHING",
    },
    {
      id: "depot-2",
      name: "Dhanmondi Regional Logistics",
      location: "Road 27, Dhanmondi, Dhaka",
      distance: "2.8 km",
      eta: "40 mins",
      coldChain: false,
      phone: "01819-223344",
      rating: 4.8,
      stockCoverage: 94,
      status: "OPEN",
    },
    {
      id: "depot-3",
      name: "Uttara North Wholesale Hub",
      location: "Sector 7, Uttara, Dhaka",
      distance: "6.5 km",
      eta: "1 hr 10 min",
      coldChain: true,
      phone: "01912-334455",
      rating: 4.7,
      stockCoverage: 99,
      status: "OPEN",
    },
  ];

  // Active Orders Dataset
  const activeOrders = [
    {
      id: "ORD-2026-9041",
      date: "Today, 10:15 AM",
      depot: "Tejgaon Central Pharma Depot",
      itemsCount: 4,
      totalAmount: 14850,
      paidAmount: 5000,
      dueAmount: 9850,
      status: "IN_TRANSIT",
      statusLabel: "Delivery Van in Transit",
      driver: "Md. Kamal Hossain",
      vehicle: "Dhaka Metro-Ha-11-2024",
      driverPhone: "01799-445566",
      etaMinutes: 14,
      items: [
        { name: "Napa Extra 500mg", qty: 20, bonus: 2, price: 5000 },
        { name: "Seclo 20mg Capsule", qty: 10, bonus: 1, price: 6000 },
        { name: "Monas 10mg", qty: 5, bonus: 1, price: 2400 },
        { name: "Ceevit 250mg", qty: 5, bonus: 0, price: 1450 },
      ],
    },
  ];

  // Inventory Batches (FEFO priority)
  const inventoryBatches = [
    {
      id: "inv-1",
      name: "Napa Extra 500mg",
      batch: "BN-2024-NAPA-01",
      quantity: 1450,
      expiry: "2026-11 (1 month left)",
      status: "NEAR_EXPIRY",
      statusColor: "text-amber-700 bg-amber-50 border-amber-200",
      fefoRank: 1,
    },
    {
      id: "inv-2",
      name: "Seclo 20mg Capsule",
      batch: "BN-2025-SEC-09",
      quantity: 920,
      expiry: "2027-04 (Optimal)",
      status: "OPTIMAL",
      statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      fefoRank: 2,
    },
    {
      id: "inv-3",
      name: "Zimax 500mg Tablet",
      batch: "BN-2024-ZIM-03",
      quantity: 45,
      expiry: "2027-01",
      status: "LOW_STOCK",
      statusColor: "text-rose-700 bg-rose-50 border-rose-200",
      fefoRank: 3,
    },
  ];

  // Notifications
  const notificationsList = [
    {
      id: "notif-1",
      title: "Delivery Van Out for Delivery",
      time: "10 mins ago",
      desc: "Van #Dhaka-Metro-Ha-11-2024 is 1.2 km away. Estimated arrival: 14 mins.",
      unread: true,
    },
    {
      id: "notif-2",
      title: "Trade Offer: Square 10+1 Scheme",
      time: "2 hours ago",
      desc: "Order 10 boxes of Napa Extra or Seclo to get +1 Free Box automatically.",
      unread: true,
    },
    {
      id: "notif-3",
      title: "DGDA Compliance Verification Approved",
      time: "Yesterday",
      desc: "Your Pharmacy Trade License TRAD-DHK-2024 has been verified by DGDA.",
      unread: false,
    },
  ];

  // Helpers
  const addToCart = (medId: string) => {
    setCart((prev) => ({ ...prev, [medId]: (prev[medId] || 0) + 1 }));
  };

  const removeFromCart = (medId: string) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[medId] > 1) {
        next[medId] -= 1;
      } else {
        delete next[medId];
      }
      return next;
    });
  };

  const totalCartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const calculateSubtotal = () => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const item = medicineList.find((m) => m.id === id);
      return sum + (item ? item.unitPrice * 10 * qty : 0);
    }, 0);
  };

  const filteredMedicines = medicineList.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.generic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "ALL" || med.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCompleteRegistration = () => {
    const generatedId = `REG-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    setRegistrationTrackingId(generatedId);
    setRegStep(4);
    setActiveRole(regRole);
  };

  return (
    <div className="min-h-screen w-full bg-white py-0 sm:py-6 flex flex-col items-center justify-center font-sans antialiased text-slate-800 selection:bg-[#1A56DB] selection:text-white">
      
      {/* Desktop Prototype Header Bar (Hidden on Mobile) */}
      <div className="hidden sm:flex items-center justify-between w-[412px] mb-2.5 px-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700">MedGo Mobile App Prototype</span>
        </div>
        <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
          Android / iOS Frame
        </span>
      </div>

      {/* =================================================================== */}
      {/* REALISTIC MOBILE PHONE FRAME CONTAINER                              */}
      {/* =================================================================== */}
      <div className="relative w-full sm:w-[412px] h-[100dvh] sm:h-[860px] bg-slate-900 sm:rounded-[52px] sm:p-3 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3),0_10px_25px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.08)] sm:border-[4px] sm:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Physical Side Buttons (Visible on Desktop) */}
        <div className="hidden sm:block absolute -left-[7px] top-[120px] w-[3px] h-8 bg-slate-600 rounded-l" />
        <div className="hidden sm:block absolute -left-[7px] top-[165px] w-[3px] h-12 bg-slate-600 rounded-l" />
        <div className="hidden sm:block absolute -left-[7px] top-[225px] w-[3px] h-12 bg-slate-600 rounded-l" />
        <div className="hidden sm:block absolute -right-[7px] top-[180px] w-[3px] h-16 bg-slate-600 rounded-r" />

        {/* Mobile Device Screen Viewport */}
        <div className="w-full h-full sm:rounded-[42px] overflow-hidden flex flex-col relative bg-slate-50">
          
          {/* Top Status Bar with Dynamic Island & Signal */}
          <div className="h-8 px-5 bg-[#2E236C] text-white text-[11px] font-semibold flex items-center justify-between shrink-0 select-none z-50">
            <span>9:41</span>
            
            {/* Dynamic Island / Camera Notch */}
            <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center gap-1.5 px-2 shadow-inner">
              <div className="w-1.5 h-1.5 rounded-full bg-[#111] ring-1 ring-white/20" />
              <div className="w-6 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Network / Battery Icons */}
            <div className="flex items-center gap-1.5 text-white/90">
              <span className="text-[10px] font-bold">5G</span>
              {/* Battery */}
              <div className="w-5 h-2.5 rounded-sm border border-white/80 p-0.5 flex items-center">
                <div className="w-full h-full bg-emerald-400 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* 1. NATIVE MOBILE APP TOP BAR                                        */}
          {/* =================================================================== */}
          <header className="sticky top-0 z-40 bg-[#2E236C] border-b border-indigo-900/50 px-4 py-2.5 flex items-center justify-between shadow-md shrink-0">
        
        {/* Left: Brand Logo from Asset */}
        <button
          onClick={() => setActiveScreen("DASHBOARD")}
          className="flex items-center gap-2 active:scale-95 transition-transform"
          title="MedGo Home"
        >
          <img
            src="/images/png-final.png"
            alt="MedGo"
            className="h-8 w-auto object-contain drop-shadow-md"
          />
        </button>

        {/* Right: Notification Bell & Register Button */}
        <div className="flex items-center gap-2">
          {/* Notifications Bell */}
          <button
            onClick={() => setActiveScreen("NOTIFICATIONS")}
            className="relative p-1.5 rounded-xl hover:bg-white/10 text-white/90 hover:text-white transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-white" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#2E236C]" />
          </button>

          {/* Register Action */}
          <button
            onClick={() => setActiveScreen("REGISTRATION")}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black border border-white/20 transition-all active:scale-95"
            title="Role Registration"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Register</span>
          </button>
        </div>

      </header>

      {/* =================================================================== */}
      {/* 2. SCROLLABLE SCREEN CONTENT AREA                                   */}
      {/* =================================================================== */}
      <main className="flex-1 overflow-y-auto pb-24">
        
        {/* ----------------------------------------------------------------- */}
        {/* TAB 1: DASHBOARD (HOME)                                           */}
        {/* ----------------------------------------------------------------- */}
        {activeScreen === "DASHBOARD" && (
          <div className="p-4 space-y-4 animate-in fade-in duration-150">
            
            {/* Operational KPI Hero Card */}
            <div className="bg-gradient-to-br from-[#1A56DB] to-[#059669] text-white p-4 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between text-xs text-blue-100 font-semibold">
                  <span>
                    {activeRole === UserRole.PHARMACY_OWNER && "Available Credit Ceiling"}
                    {activeRole === UserRole.RETAIL_PHARMACY && "Counter Sales Today"}
                    {activeRole === UserRole.PHARMA_COMPANY && "National Sales Target"}
                    {activeRole === UserRole.DISTRIBUTOR && "Cold-Chain Temperature"}
                    {activeRole === UserRole.SALES_REP && "Today's Order Booking"}
                  </span>
                  <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                    <Activity className="w-3 h-3 text-emerald-200" /> Live
                  </span>
                </div>

                <div className="text-2xl font-black tracking-tight">
                  {activeRole === UserRole.PHARMACY_OWNER && "৳35,750"}
                  {activeRole === UserRole.RETAIL_PHARMACY && "৳24,900"}
                  {activeRole === UserRole.PHARMA_COMPANY && "৳1,48,90,000"}
                  {activeRole === UserRole.DISTRIBUTOR && "3.8°C (Optimal)"}
                  {activeRole === UserRole.SALES_REP && "৳68,400"}
                </div>

                <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs text-blue-100">
                  <span>
                    {activeRole === UserRole.PHARMACY_OWNER && "Outstanding Due: ৳14,250"}
                    {activeRole === UserRole.RETAIL_PHARMACY && "18 Cash & 12 bKash Memos"}
                    {activeRole === UserRole.PHARMA_COMPANY && "Achievement: 92.4%"}
                    {activeRole === UserRole.DISTRIBUTOR && "4 Active Delivery Vans"}
                    {activeRole === UserRole.SALES_REP && "8 / 10 Calls Completed"}
                  </span>
                  <button
                    onClick={() => setActiveScreen("ORDERS")}
                    className="bg-white text-slate-900 px-2.5 py-1 rounded-xl font-black text-[11px] shadow-xs active:scale-95 transition-transform"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Action Icons (Clean standalone icons, no outer card box) */}
            <div className="grid grid-cols-4 gap-2 py-1">
              <button
                onClick={() => setActiveScreen("DASHBOARD")}
                className="flex flex-col items-center gap-1.5 transition-all active:scale-90 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50/90 text-[#1A56DB] flex items-center justify-center group-hover:bg-blue-100 transition-colors shadow-2xs">
                  <LayoutDashboard className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-[#1A56DB] transition-colors">Dashboard</span>
              </button>

              <button
                onClick={() => setActiveScreen("MAP")}
                className="flex flex-col items-center gap-1.5 transition-all active:scale-90 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50/90 text-[#059669] flex items-center justify-center group-hover:bg-emerald-100 transition-colors shadow-2xs">
                  <MapPin className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-[#059669] transition-colors">Depots</span>
              </button>

              <button
                onClick={() => setActiveScreen("ORDERS")}
                className="flex flex-col items-center gap-1.5 transition-all active:scale-90 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50/90 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors shadow-2xs">
                  <Truck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Orders</span>
              </button>

              <button
                onClick={() => setActiveScreen("INVENTORY")}
                className="flex flex-col items-center gap-1.5 transition-all active:scale-90 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50/90 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors shadow-2xs">
                  <Boxes className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-amber-600 transition-colors">Stock</span>
              </button>
            </div>

            {/* Active Live Delivery Alert Card (Moving Van Simulation) */}
            <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1A56DB] flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">
                      Dispatched Delivery in Transit
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Invoice #ORD-2026-9041 • 4 Medicines
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ETA 14m
                </span>
              </div>

              {/* Progress Track */}
              <div className="relative pt-1">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[#1A56DB] to-[#059669] h-full w-[70%] rounded-full animate-pulse" />
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mt-1.5">
                  <span>Tejgaon Depot</span>
                  <span className="text-[#1A56DB] font-black">70% En Route</span>
                  <span>Dhanmondi Shop</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-600 font-medium">Driver: Md. Kamal (01799-445566)</span>
                <button
                  onClick={() => setActiveScreen("ORDERS")}
                  className="text-[#1A56DB] font-black flex items-center gap-1 hover:underline text-[11px]"
                >
                  <span>Live GPS</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Near Expiry FEFO Warning Card */}
            <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-3xl flex items-start gap-3 shadow-2xs">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-amber-900">
                  FEFO Priority Alert: 1 Near-Expiry Batch
                </div>
                <div className="text-[11px] text-amber-700 mt-0.5">
                  Batch <strong>BN-2024-NAPA-01</strong> expires in 30 days. Priority dispatch enabled on counter sales.
                </div>
              </div>
              <button
                onClick={() => setActiveScreen("INVENTORY")}
                className="px-2.5 py-1 rounded-xl bg-amber-600 text-white text-[10px] font-black shrink-0 shadow-xs active:scale-95"
              >
                Inspect
              </button>
            </div>

            {/* Popular Wholesaler Offers (10+1 Scheme) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Active Trade Schemes (10+1 FREE)
                </h2>
                <button
                  onClick={() => setActiveScreen("MEDICINES")}
                  className="text-[11px] font-bold text-[#1A56DB] hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {medicineList.slice(0, 2).map((med) => (
                  <div
                    key={med.id}
                    className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1.5"
                  >
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-[#059669] border border-emerald-200">
                      {med.tradeOffer}
                    </span>
                    <div className="text-xs font-black text-slate-900 truncate">{med.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{med.generic}</div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-black text-slate-900">৳{med.boxPrice}/box</span>
                      <button
                        onClick={() => addToCart(med.id)}
                        className="w-6 h-6 rounded-lg bg-[#1A56DB] text-white flex items-center justify-center font-bold text-xs active:scale-90"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 2: MEDICINES SEARCH & WHOLESALE POS                           */}
        {/* ----------------------------------------------------------------- */}
        {activeScreen === "MEDICINES" && (
          <div className="p-4 space-y-3 animate-in fade-in duration-150">
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Napa, Seclo, Esomeprazole, Square..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-2xl bg-white border border-slate-200/90 shadow-2xs focus:border-[#1A56DB] focus:outline-none"
              />
            </div>

            {/* Horizontal Category Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {["ALL", "Pain & Fever", "Gastric Care", "Respiratory", "Vitamins", "Antibiotics"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? "bg-[#1A56DB] text-white shadow-2xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Medicine List Cards */}
            <div className="space-y-2">
              {filteredMedicines.map((med) => {
                const qtyInCart = cart[med.id] || 0;
                return (
                  <div
                    key={med.id}
                    className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900">{med.name}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">({med.form})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 leading-tight">{med.generic}</div>
                        <div className="text-[10px] text-[#1A56DB] font-bold mt-0.5">{med.company}</div>
                      </div>

                      {med.tradeOffer && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-[#059669] border border-emerald-200 whitespace-nowrap shrink-0">
                          {med.tradeOffer}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-xs font-black text-slate-900">৳{med.boxPrice}</span>
                        <span className="text-[10px] text-slate-400 ml-1">/ box (৳{med.unitPrice}/pc)</span>
                      </div>

                      {/* Cart Counter Controls */}
                      {qtyInCart > 0 ? (
                        <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-xl border border-slate-200">
                          <button
                            onClick={() => removeFromCart(med.id)}
                            className="w-5 h-5 rounded-md bg-white text-slate-700 flex items-center justify-center font-black shadow-2xs active:scale-90"
                          >
                            -
                          </button>
                          <span className="text-xs font-black text-slate-900 min-w-[16px] text-center">
                            {qtyInCart}
                          </span>
                          <button
                            onClick={() => addToCart(med.id)}
                            className="w-5 h-5 rounded-md bg-[#1A56DB] text-white flex items-center justify-center font-black shadow-2xs active:scale-90"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(med.id)}
                          className="px-3 py-1 rounded-xl bg-[#1A56DB] hover:bg-[#1E40AF] text-white text-[11px] font-black flex items-center gap-1 shadow-xs transition-colors active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticky Cart Summary Button */}
            {totalCartCount > 0 && (
              <div className="sticky bottom-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">
                    {totalCartCount} Boxes Selected
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    ৳{calculateSubtotal()} Subtotal
                  </div>
                </div>
                <button
                  onClick={() => setActiveScreen("ORDERS")}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1A56DB] to-[#059669] text-white text-xs font-black shadow-md flex items-center gap-1.5 active:scale-95 transition-transform"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Checkout (10+1)</span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 3: NEARBY DEPOTS & GPS ROUTE MAP                             */}
        {/* ----------------------------------------------------------------- */}
        {activeScreen === "MAP" && (
          <div className="p-4 space-y-3 animate-in fade-in duration-150">
            
            <div>
              <h1 className="text-base font-black text-slate-900">Nearby Pharmaceutical Depots</h1>
              <p className="text-xs text-slate-500">Live GPS warehouse inventory near Dhanmondi</p>
            </div>

            {/* Mobile Interactive Map Graphics Container */}
            <div className="relative h-48 w-full rounded-3xl bg-slate-200 overflow-hidden border border-slate-300 shadow-inner">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#1A56DB_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 200">
                <path d="M10,40 Q150,80 290,40" stroke="#94A3B8" strokeWidth="6" fill="none" />
                <path d="M150,10 L150,190" stroke="#94A3B8" strokeWidth="6" fill="none" />
                <path d="M40,180 Q150,120 280,180" stroke="#CBD5E1" strokeWidth="4" fill="none" />
                <path
                  d="M60,60 Q150,80 220,130"
                  stroke="#1A56DB"
                  strokeWidth="4"
                  strokeDasharray="6,4"
                  fill="none"
                />
              </svg>

              {/* User Pharmacy Pin */}
              <div className="absolute top-[40px] left-[50px] -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="w-7 h-7 rounded-full bg-[#1A56DB] text-white flex items-center justify-center shadow-lg ring-4 ring-blue-200/80 animate-pulse">
                  <Store className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-black bg-white px-1.5 py-0.5 rounded shadow-xs mt-1 block">
                  My Pharmacy
                </span>
              </div>

              {/* Depot 1 Pin */}
              <div className="absolute top-[120px] left-[210px] -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="w-8 h-8 rounded-full bg-[#059669] text-white flex items-center justify-center shadow-lg ring-4 ring-emerald-200">
                  <Truck className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-black bg-white px-1.5 py-0.5 rounded shadow-xs mt-1 block">
                  Tejgaon Hub (1.2 km)
                </span>
              </div>

              {/* Moving Van */}
              <div className="absolute top-[90px] left-[130px] -translate-x-1/2 -translate-y-1/2">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400 rotate-45" />
                </div>
              </div>
            </div>

            {/* Depot Cards List */}
            <div className="space-y-2">
              {nearbyDepots.map((depot) => (
                <div
                  key={depot.id}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-black text-slate-900">{depot.name}</div>
                      <div className="text-[11px] text-slate-500">{depot.location}</div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {depot.eta}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
                    <span>📍 {depot.distance}</span>
                    <span>📦 {depot.stockCoverage}% Stock Match</span>
                    {depot.coldChain && (
                      <span className="flex items-center gap-1 text-[#1A56DB] font-bold">
                        <ThermometerSnowflake className="w-3.5 h-3.5" /> Cold-Chain
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => alert(`Calling ${depot.name}: ${depot.phone}`)}
                      className="flex-1 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 hover:bg-slate-50 active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Call Depot</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveScreen("MEDICINES")}
                      className="flex-1 py-1.5 rounded-xl bg-[#1A56DB] text-white font-black text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Order Directly</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 4: ORDERS & DUES PAYMENT                                      */}
        {/* ----------------------------------------------------------------- */}
        {activeScreen === "ORDERS" && (
          <div className="p-4 space-y-4 animate-in fade-in duration-150">
            
            <div>
              <h1 className="text-base font-black text-slate-900">Orders & Dispatches</h1>
              <p className="text-xs text-slate-500">Track delivery fleet & settle distributor dues</p>
            </div>

            {/* Active Order with Live GPS */}
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Invoice Number
                    </span>
                    <div className="text-sm font-black text-slate-900">{order.id}</div>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border bg-blue-50 text-[#1A56DB] border-blue-200 animate-pulse">
                    In Transit
                  </span>
                </div>

                <div className="text-xs text-slate-600">
                  Dispatched from: <strong>{order.depot}</strong>
                </div>

                {/* Items List in Order */}
                <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-800 font-semibold">{it.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">{it.qty} Boxes</span>
                        {it.bonus > 0 && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                            +{it.bonus} Free
                          </span>
                        )}
                        <span className="font-bold text-slate-900 ml-1">৳{it.price}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financials & Payment Dues */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-500">Total Billed:</span>
                    <span className="font-black text-slate-900 ml-1">৳{order.totalAmount}</span>
                  </div>
                  <div className="text-rose-600 font-bold">
                    Due: ৳{order.dueAmount}
                  </div>
                </div>

                {/* Driver & Call Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                      KH
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{order.driver}</div>
                      <div className="text-[10px] text-slate-500">{order.vehicle}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`Calling driver: ${order.driverPhone}`)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Driver</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Settle Wholesale Dues Section */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-black text-slate-900 uppercase">Pay Wholesale Dues</h2>
                  <p className="text-[11px] text-slate-500">Instant bKash, Nagad or Bank settlement</p>
                </div>
                <CreditCard className="w-5 h-5 text-[#1A56DB]" />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { mode: "BKASH", label: "bKash", color: "bg-[#D12053] text-white" },
                  { mode: "NAGAD", label: "Nagad", color: "bg-[#F7941D] text-white" },
                  { mode: "BANK", label: "Bank", color: "bg-[#1A56DB] text-white" },
                  { mode: "CASH", label: "Cash", color: "bg-emerald-600 text-white" },
                ].map((p) => (
                  <button
                    key={p.mode}
                    onClick={() => setPaymentMethod(p.mode as any)}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      paymentMethod === p.mode
                        ? `${p.color} ring-2 ring-slate-900 shadow-md`
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => alert(`Paid ৳9,850 via ${paymentMethod} to Tejgaon Depot!`)}
                className="w-full py-2.5 rounded-xl bg-[#1A56DB] text-white text-xs font-black shadow-md active:scale-98 transition-transform"
              >
                Pay ৳9,850 Due via {paymentMethod}
              </button>
            </div>

          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 5: INVENTORY BATCH INSPECTOR                                  */}
        {/* ----------------------------------------------------------------- */}
        {activeScreen === "INVENTORY" && (
          <div className="p-4 space-y-3 animate-in fade-in duration-150">
            
            <div>
              <h1 className="text-base font-black text-slate-900">Inventory & FEFO Batches</h1>
              <p className="text-xs text-slate-500">First-Expiring First-Out automated stock prioritization</p>
            </div>

            <div className="space-y-2">
              {inventoryBatches.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-black text-slate-900">{item.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">{item.batch}</div>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-600">Stock: <strong>{item.quantity} units</strong></span>
                    <span className="text-slate-600">Expiry: <strong>{item.expiry}</strong></span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-[#1A56DB] font-bold">FEFO Priority Rank #{item.fefoRank}</span>
                    <button
                      onClick={() => setActiveScreen("MEDICINES")}
                      className="text-xs font-bold text-[#1A56DB] hover:underline"
                    >
                      Reorder SKU
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 6: NOTIFICATIONS                                              */}
        {/* ----------------------------------------------------------------- */}
        {activeScreen === "NOTIFICATIONS" && (
          <div className="p-4 space-y-3 animate-in fade-in duration-150">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base font-black text-slate-900">Alerts & Notifications</h1>
                <p className="text-xs text-slate-500">Regulatory, dispatch and scheme updates</p>
              </div>
              <span className="text-[10px] font-bold text-[#1A56DB] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                2 Unread
              </span>
            </div>

            <div className="space-y-2">
              {notificationsList.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    n.unread
                      ? "bg-white border-blue-300 ring-1 ring-blue-100 shadow-xs"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{n.title}</span>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {n.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 7: 5-ROLE REGISTRATION FLOW                                   */}
        {/* ----------------------------------------------------------------- */}
        {activeScreen === "REGISTRATION" && (
          <div className="p-4 space-y-4 animate-in fade-in duration-150">
            
            {/* Step Progress Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base font-black text-slate-900">
                  {regStep === 1 && "Choose Account Role"}
                  {regStep === 2 && "Fill Mandatory Details"}
                  {regStep === 3 && "Verify Phone (OTP)"}
                  {regStep === 4 && "Application Submitted"}
                </h1>
                <p className="text-[11px] text-slate-500">
                  {regStep === 1 && "Select the authorized entity you represent"}
                  {regStep === 2 && "DGDA verified credentials required"}
                  {regStep === 3 && "Enter 6-digit cryptographic PIN"}
                  {regStep === 4 && "Track your pending review status"}
                </p>
              </div>
              <span className="text-xs font-black text-[#1A56DB] bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                Step {regStep} of 4
              </span>
            </div>

            {/* Step 1: Role Chooser */}
            {regStep === 1 && (
              <div className="space-y-2">
                {[
                  {
                    role: UserRole.PHARMACY_OWNER,
                    title: "Pharmacy Owner",
                    desc: "Wholesale medicines, trade offers & depot credit",
                    icon: Store,
                    color: "text-blue-600 bg-blue-50",
                  },
                  {
                    role: UserRole.RETAIL_PHARMACY,
                    title: "Retail Pharmacy",
                    desc: "Independent retail chemist shop with prescription POS",
                    icon: Store,
                    color: "text-teal-600 bg-teal-50",
                  },
                  {
                    role: UserRole.PHARMA_COMPANY,
                    title: "Pharmaceutical Company",
                    desc: "DGDA licensed drug manufacturer & primary distributor",
                    icon: Factory,
                    color: "text-indigo-600 bg-indigo-50",
                  },
                  {
                    role: UserRole.DISTRIBUTOR,
                    title: "Distributor / Depot",
                    desc: "Regional logistics hub with cold-chain warehousing",
                    icon: Truck,
                    color: "text-emerald-600 bg-emerald-50",
                  },
                  {
                    role: UserRole.SALES_REP,
                    title: "Medical Representative (MPO / SR)",
                    desc: "Field officer booking orders from doctors & pharmacies",
                    icon: UserCheck,
                    color: "text-amber-600 bg-amber-50",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = regRole === item.role;
                  return (
                    <button
                      key={item.role}
                      onClick={() => setRegRole(item.role)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                        isSelected
                          ? "bg-white border-[#1A56DB] ring-2 ring-blue-100 shadow-md"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-slate-900">{item.title}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#1A56DB]" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}

                <button
                  onClick={() => setRegStep(2)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#1A56DB] to-[#059669] text-white font-black text-xs shadow-md shadow-blue-500/20 active:scale-98 transition-transform"
                >
                  Proceed to Role Form
                </button>
              </div>
            )}

            {/* Step 2: Form */}
            {regStep === 2 && (
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
                  <Building2 className="w-4 h-4 text-[#1A56DB]" />
                  <span>Applying as: <strong>{regRole}</strong></span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Mahfuzul Islam"
                    value={regFormData.fullName}
                    onChange={(e) => setRegFormData({ ...regFormData, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#1A56DB] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Mobile Number (for OTP) *</label>
                  <input
                    type="tel"
                    placeholder="01711-223344"
                    value={regFormData.phone}
                    onChange={(e) => setRegFormData({ ...regFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#1A56DB] focus:outline-none"
                  />
                </div>

                {(regRole === UserRole.PHARMACY_OWNER || regRole === UserRole.RETAIL_PHARMACY) && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Pharmacy / Shop Name *</label>
                      <input
                        type="text"
                        placeholder="Popular Model Pharmacy"
                        value={regFormData.shopName}
                        onChange={(e) => setRegFormData({ ...regFormData, shopName: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#1A56DB] focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">NID Number *</label>
                        <input
                          type="text"
                          placeholder="NID Number"
                          value={regFormData.nidNumber}
                          onChange={(e) => setRegFormData({ ...regFormData, nidNumber: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#1A56DB] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Trade License *</label>
                        <input
                          type="text"
                          placeholder="TRAD-XXXX"
                          value={regFormData.tradeLicense}
                          onChange={(e) => setRegFormData({ ...regFormData, tradeLicense: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#1A56DB] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Camera simulation */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>Physical Shop Signboard Photo *</span>
                        {regFormData.hasCameraPhoto && (
                          <span className="text-[10px] text-emerald-600 font-black">Captured ✓</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setRegFormData({ ...regFormData, hasCameraPhoto: true })}
                        className="w-full py-2.5 rounded-xl border-2 border-dashed border-blue-300 bg-white hover:bg-blue-50 text-[#1A56DB] text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{regFormData.hasCameraPhoto ? "Retake Photo" : "Take Live Photo with Camera"}</span>
                      </button>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRegStep(1)}
                    className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegStep(3)}
                    className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[#1A56DB] to-[#059669] text-white text-xs font-black shadow-md active:scale-98 transition-transform"
                  >
                    Verify with OTP
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: OTP */}
            {regStep === 3 && (
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1A56DB] flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Enter Verification Code</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Sent to <strong>01711-223344</strong>
                  </p>
                </div>

                <div className="flex justify-center gap-1.5">
                  {[0, 1, 2, 3, 4, 5].map((idx) => (
                    <input
                      key={idx}
                      id={`otp-box-${idx}`}
                      type="text"
                      maxLength={1}
                      value={otpCode[idx] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        const updated = [...otpCode];
                        updated[idx] = val;
                        setOtpCode(updated);
                        if (val && idx < 5) {
                          const next = document.getElementById(`otp-box-${idx + 1}`);
                          if (next) next.focus();
                        }
                      }}
                      className="w-10 h-12 text-center text-lg font-black rounded-xl border-2 border-slate-200 focus:border-[#1A56DB] focus:outline-none"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setOtpCode(["2", "5", "9", "9", "5", "3"])}
                  className="text-[11px] font-bold text-[#1A56DB] hover:underline block mx-auto"
                >
                  Auto-fill Demo Code (259953)
                </button>

                <button
                  type="button"
                  onClick={handleCompleteRegistration}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#1A56DB] to-[#059669] text-white font-black text-xs shadow-md active:scale-98 transition-transform"
                >
                  Confirm & Submit Registration
                </button>
              </div>
            )}

            {/* Step 4: Tracking Receipt */}
            {regStep === 4 && (
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md text-center space-y-4 animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Application Tracking Number
                  </span>
                  <div className="text-xl font-mono font-black text-slate-900 mt-1">
                    {registrationTrackingId}
                  </div>
                </div>

                <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
                  Status: PENDING_VERIFICATION
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Your <strong>{regRole}</strong> registration application has been received and queued for DGDA premises audit.
                </p>

                <button
                  onClick={() => setActiveScreen("DASHBOARD")}
                  className="w-full py-3 rounded-2xl bg-[#1A56DB] text-white font-black text-xs shadow-md active:scale-98 transition-transform"
                >
                  Enter Mobile Dashboard as {regRole}
                </button>
              </div>
            )}

          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* TAB 8: PROFILE & CREDENTIALS                                      */}
        {/* ----------------------------------------------------------------- */}
        {activeScreen === "PROFILE" && (
          <div className="p-4 space-y-4 animate-in fade-in duration-150">
            
            {/* Profile Header */}
            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1A56DB] to-[#059669] text-white flex items-center justify-center font-black text-lg shadow-md">
                MI
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-slate-900">{userProfile.name}</span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-50 text-[#059669] border border-emerald-200">
                    Verified
                  </span>
                </div>
                <div className="text-xs text-slate-500">{userProfile.pharmacyName}</div>
                <div className="text-[11px] text-[#1A56DB] font-bold">{userProfile.phone}</div>
              </div>
            </div>

            {/* Credentials Card */}
            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                DGDA & Trade Verification
              </h2>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Operational Role</span>
                  <span className="font-black text-slate-900">{activeRole}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">DGDA Drug License</span>
                  <span className="font-mono font-bold text-slate-900">{userProfile.dgdaLicense}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Trade License No</span>
                  <span className="font-mono font-bold text-slate-900">{userProfile.tradeLicense}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">e-TIN Number</span>
                  <span className="font-mono font-bold text-slate-900">{userProfile.tin}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Premises Address</span>
                  <span className="font-medium text-slate-700 text-right max-w-[180px]">{userProfile.address}</span>
                </div>
              </div>
            </div>

            {/* Emergency Hotline */}
            <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Support & Emergency Hotlines
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <span>MedGo 24/7 B2B Dispatch Helpline</span>
                  <span className="font-black text-[#1A56DB]">16263</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <span>DGDA Central Regulatory Cell</span>
                  <span className="font-black text-[#059669]">02-9556633</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveScreen("REGISTRATION")}
              className="w-full py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold active:scale-95 transition-transform"
            >
              Register Another Business Entity
            </button>

          </div>
        )}

      </main>

          {/* =================================================================== */}
          {/* 3. NATIVE MOBILE APP BOTTOM NAVIGATION BAR                          */}
          {/* =================================================================== */}
          <nav className="absolute bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 pt-2 pb-1.5 flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-around w-full">
              {[
                { tab: "DASHBOARD", label: "Home", icon: Store },
                { tab: "MEDICINES", label: "Medicines", icon: Search, badge: totalCartCount > 0 ? totalCartCount : undefined },
                { tab: "MAP", label: "Depots", icon: MapPin },
                { tab: "ORDERS", label: "Orders", icon: Truck },
                { tab: "PROFILE", label: "Profile", icon: User },
              ].map((item) => {
                const Icon = item.icon;
                const isCurrent = activeScreen === item.tab;
                return (
                  <button
                    key={item.tab}
                    type="button"
                    onClick={() => setActiveScreen(item.tab as MobileScreen)}
                    className={`flex flex-col items-center gap-0.5 py-0.5 px-2.5 rounded-xl transition-all relative ${
                      isCurrent
                        ? "text-[#1A56DB] font-extrabold"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <div className="relative">
                      <Icon className={`w-5 h-5 ${isCurrent ? "stroke-[2.4]" : "stroke-[1.8]"}`} />
                      {item.badge !== undefined && (
                        <span className="absolute -top-1.5 -right-2 px-1 rounded-full bg-[#059669] text-white text-[8px] font-black">
                          {item.badge}
                        </span>
                      )}
                      {isCurrent && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#059669]" />
                      )}
                    </div>
                    <span className="text-[10px] tracking-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Android / iPhone Bottom Gesture Pill */}
            <div className="w-28 h-1 bg-slate-300 rounded-full mx-auto mt-2 mb-0.5" />
          </nav>

        </div>
      </div>
    </div>
  );
}
