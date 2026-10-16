"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Search,
  ShoppingCart,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  Store,
  Factory,
  Truck,
  UserCheck,
  Calendar,
  FileText,
  Camera,
  ExternalLink,
  Zap,
  Info,
  Layers,
  ArrowRight,
  Download,
  Plus,
  Minus,
  Check,
  ChevronRight,
  Phone,
  Navigation,
  Package,
  Boxes,
  Bell,
  User,
  ArrowLeft,
  RotateCw,
  Sparkles,
  TrendingUp,
  Award,
  ThermometerSnowflake,
  BarChart3,
  CreditCard,
  QrCode,
  SlidersHorizontal,
  ChevronDown,
  Activity,
  HeartPulse,
} from "lucide-react";
import { UserRole } from "@/types/domain";

type AndroidScreen =
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

export default function MobilePrototypePage() {
  // Mobile Simulator Shell Controls
  const [isFrameless, setIsFrameless] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(100);
  const [activeScreen, setActiveScreen] = useState<AndroidScreen>("DASHBOARD");

  // Authenticated Role & State (Default: PHARMACY_OWNER)
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.PHARMACY_OWNER);
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
    // Common
    fullName: "",
    phone: "",
    nidNumber: "",
    // Pharmacy / Retail
    shopName: "",
    tradeLicense: "",
    tinNumber: "",
    address: "Tejgaon Commercial Area, Dhaka",
    hasCameraPhoto: false,
    // Pharma Company
    companyName: "",
    corporateEmail: "",
    dgdaLicense: "",
    factoryLocation: "",
    // Distributor / Depot
    depotName: "",
    managerName: "",
    capacitySqFt: "12500",
    hasColdChain: true,
    serviceArea: "Dhaka North & Gazipur",
    // MPO / SR
    assignedCompany: "Square Pharmaceuticals Ltd",
    employeeId: "EMP-SQ-9942",
    territory: "Dhanmondi & Green Road Hub",
  });
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
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
      name: "Dhanmondi Regional Pharma Logistics",
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
    {
      id: "ORD-2026-8812",
      date: "Yesterday, 04:30 PM",
      depot: "Dhanmondi Regional Logistics",
      itemsCount: 2,
      totalAmount: 7200,
      paidAmount: 7200,
      dueAmount: 0,
      status: "DELIVERED",
      statusLabel: "Successfully Delivered & Verified",
      driver: "Abdur Rashid",
      vehicle: "Dhaka Metro-Tha-44-1290",
      driverPhone: "01811-223399",
      etaMinutes: 0,
      items: [
        { name: "Maxpro 20mg Tablet", qty: 8, bonus: 1, price: 5600 },
        { name: "Alatrol 10mg", qty: 5, bonus: 0, price: 1600 },
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
    {
      id: "inv-4",
      name: "Monas 10mg Tablet",
      batch: "BN-2025-MON-12",
      quantity: 580,
      expiry: "2027-08",
      status: "OPTIMAL",
      statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      fefoRank: 4,
    },
  ];

  // Notifications
  const notificationsList = [
    {
      id: "notif-1",
      title: "Delivery Van Out for Delivery",
      time: "10 mins ago",
      desc: "Van #Dhaka-Metro-Ha-11-2024 is 1.2 km away. Estimated arrival: 14 mins.",
      category: "LOGISTICS",
      unread: true,
    },
    {
      id: "notif-2",
      title: "Trade Offer: Square 10+1 Scheme",
      time: "2 hours ago",
      desc: "Order 10 boxes of Napa Extra or Seclo to get +1 Free Box automatically.",
      category: "TRADE_OFFER",
      unread: true,
    },
    {
      id: "notif-3",
      title: "DGDA Compliance Verification Approved",
      time: "Yesterday",
      desc: "Your Pharmacy Trade License TRAD-DHK-2024 has been verified by DGDA.",
      category: "COMPLIANCE",
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

  // Filtered medicines
  const filteredMedicines = medicineList.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.generic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "ALL" || med.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Handle Registration Submit
  const handleCompleteRegistration = () => {
    const generatedId = `REG-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    setRegistrationTrackingId(generatedId);
    setRegStep(4);
    // Automatically switch active role to the newly registered role to show customized dashboard
    setActiveRole(regRole);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-[#1A56DB] selection:text-white">
      
      {/* =================================================================== */}
      {/* 1. TOP SIMULATOR CONTROL BAR                                        */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200/90 shadow-2xs px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Left: Back & Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-[#1A56DB]" />
              <span>Back to Web Platform</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-black text-slate-900 tracking-tight">
                MedGo Android Mobile App Simulator
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-[#1A56DB] border border-blue-200">
                Live Prototype
              </span>
            </div>
          </div>

          {/* Center: Operational Persona Switcher for Prototype Testing */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/90 overflow-x-auto max-w-full">
            <span className="text-[10px] font-black uppercase text-slate-500 px-2 hidden lg:inline">
              Test Role:
            </span>
            {[
              { role: UserRole.PHARMACY_OWNER, label: "Pharmacy Owner" },
              { role: UserRole.RETAIL_PHARMACY, label: "Retail Pharmacy" },
              { role: UserRole.PHARMA_COMPANY, label: "Pharma Company" },
              { role: UserRole.DISTRIBUTOR, label: "Depot Logistics" },
              { role: UserRole.SALES_REP, label: "MPO / SR" },
            ].map((r) => (
              <button
                key={r.role}
                onClick={() => {
                  setActiveRole(r.role);
                  setActiveScreen("DASHBOARD");
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeRole === r.role
                    ? "bg-[#1A56DB] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Right: Device Frame Toggle & Scale */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFrameless(!isFrameless)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                isFrameless
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
              title="Toggle between phone device mockup and full viewport"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#1A56DB]" />
              <span>{isFrameless ? "Full Mobile View" : "Android Device Frame"}</span>
            </button>

            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              {[80, 90, 100].map((s) => (
                <button
                  key={s}
                  onClick={() => setZoomScale(s)}
                  className={`px-2 py-0.5 rounded-lg ${
                    zoomScale === s
                      ? "bg-white text-slate-900 shadow-2xs font-black"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {s}%
                </button>
              ))}
            </div>
          </div>

        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. MAIN SIMULATOR STAGE                                             */}
      {/* =================================================================== */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
        <div
          style={{ transform: `scale(${zoomScale / 100})`, transformOrigin: "top center" }}
          className="transition-transform duration-200 w-full flex justify-center"
        >
          {/* =============================================================== */}
          {/* ANDROID DEVICE SHELL                                            */}
          {/* =============================================================== */}
          <div
            className={`transition-all duration-300 bg-white overflow-hidden ${
              isFrameless
                ? "w-full max-w-[440px] min-h-[820px] rounded-3xl border border-slate-300 shadow-2xl flex flex-col"
                : "w-[412px] h-[860px] rounded-[48px] ring-[12px] ring-slate-900 shadow-[0_25px_70px_rgba(15,23,42,0.35)] border-4 border-slate-800 flex flex-col relative"
            }`}
          >
            
            {/* Top Android Status Bar */}
            <div className="bg-slate-900 text-white px-6 pt-3 pb-2 flex items-center justify-between text-xs select-none shrink-0 relative z-30">
              <span className="font-semibold text-[11px] tracking-tight">10:30</span>
              
              {/* Android Center Punch-Hole Camera */}
              <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800 flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-[#1A56DB]/60" />
              </div>

              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="font-bold text-[10px]">5G</span>
                {/* Signal Bar Icon */}
                <div className="flex items-end gap-[1px] h-3">
                  <span className="w-[2px] h-1 bg-white rounded-xs" />
                  <span className="w-[2px] h-1.5 bg-white rounded-xs" />
                  <span className="w-[2px] h-2 bg-white rounded-xs" />
                  <span className="w-[2px] h-2.5 bg-white rounded-xs" />
                </div>
                {/* Battery Icon */}
                <div className="w-4 h-2.5 border border-white rounded-[2px] p-[1px] flex items-center">
                  <div className="h-full w-3 bg-emerald-400 rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Android Application Top App Bar */}
            <div className="bg-white border-b border-slate-100 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
              <div className="flex items-center gap-2">
                <img
                  src="/images/png-final.png"
                  alt="MedGo"
                  className="h-7 w-auto object-contain"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveScreen("NOTIFICATIONS")}
                  className="relative p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4 text-slate-700" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                </button>

                <button
                  onClick={() => setActiveScreen("REGISTRATION")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1A56DB] text-xs font-black border border-blue-200 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            </div>

            {/* =============================================================== */}
            {/* ANDROID SCREEN CONTENT VIEWPORT (Scrollable)                   */}
            {/* =============================================================== */}
            <div className="flex-1 overflow-y-auto bg-slate-50 text-slate-900 pb-20">
              
              {/* ------------------------------------------------------------- */}
              {/* SCREEN 1: ROLE-SPECIFIC DASHBOARD                             */}
              {/* ------------------------------------------------------------- */}
              {activeScreen === "DASHBOARD" && (
                <div className="p-4 space-y-4 animate-in fade-in duration-200">
                  {/* Operational Quick Stats Card (Blue & Green Healthcare Design) */}
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
                          <Activity className="w-3 h-3 text-emerald-200" /> Live Synchronized
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
                      onClick={() => setActiveScreen("MEDICINES")}
                      className="flex flex-col items-center gap-1.5 transition-all active:scale-90 group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-blue-50/90 text-[#1A56DB] flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Search className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 group-hover:text-[#1A56DB] transition-colors">Search</span>
                    </button>

                    <button
                      onClick={() => setActiveScreen("MAP")}
                      className="flex flex-col items-center gap-1.5 transition-all active:scale-90 group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50/90 text-[#059669] flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                        <MapPin className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 group-hover:text-[#059669] transition-colors">Depots</span>
                    </button>

                    <button
                      onClick={() => setActiveScreen("ORDERS")}
                      className="flex flex-col items-center gap-1.5 transition-all active:scale-90 group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50/90 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                        <Truck className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Orders</span>
                    </button>

                    <button
                      onClick={() => setActiveScreen("INVENTORY")}
                      className="flex flex-col items-center gap-1.5 transition-all active:scale-90 group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-amber-50/90 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
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
                  <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-3xl flex items-start gap-3">
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
                      className="px-2.5 py-1 rounded-xl bg-amber-600 text-white text-[10px] font-black shrink-0 shadow-xs"
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
                              className="w-6 h-6 rounded-lg bg-[#1A56DB] text-white flex items-center justify-center font-bold text-xs"
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

              {/* ------------------------------------------------------------- */}
              {/* SCREEN 2: 5-ROLE REGISTRATION WORKFLOW                        */}
              {/* ------------------------------------------------------------- */}
              {activeScreen === "REGISTRATION" && (
                <div className="p-4 space-y-4 animate-in fade-in duration-200">
                  
                  {/* Step Progress Bar */}
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

                  {/* Step 2: Separate Role Registration Form */}
                  {regStep === 2 && (
                    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                      
                      {/* Role Header Badge */}
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
                        <Building2 className="w-4 h-4 text-[#1A56DB]" />
                        <span>Applying as: <strong>{regRole}</strong></span>
                      </div>

                      {/* Common Fields */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">
                          {regRole === UserRole.PHARMA_COMPANY ? "Authorized Contact Person *" : "Owner / Manager Full Name *"}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Mahfuzul Islam"
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

                      {/* ROLE 1 & 2: Pharmacy Owner & Retail Pharmacy */}
                      {(regRole === UserRole.PHARMACY_OWNER || regRole === UserRole.RETAIL_PHARMACY) && (
                        <>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700">Pharmacy / Shop Name *</label>
                            <input
                              type="text"
                              placeholder="e.g. Popular Model Pharmacy"
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
                                placeholder="10 or 17 digit NID"
                                value={regFormData.nidNumber}
                                onChange={(e) => setRegFormData({ ...regFormData, nidNumber: e.target.value })}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#1A56DB] focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">Trade License *</label>
                              <input
                                type="text"
                                placeholder="TRAD-2024-XXXX"
                                value={regFormData.tradeLicense}
                                onChange={(e) => setRegFormData({ ...regFormData, tradeLicense: e.target.value })}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#1A56DB] focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700">TIN / e-TIN Number *</label>
                            <input
                              type="text"
                              placeholder="12-digit e-TIN Certificate"
                              value={regFormData.tinNumber}
                              onChange={(e) => setRegFormData({ ...regFormData, tinNumber: e.target.value })}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#1A56DB] focus:outline-none"
                            />
                          </div>

                          {/* Camera Photo Simulation */}
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
                              <span>{regFormData.hasCameraPhoto ? "Retake Live Photo" : "Take Live Photo with Mobile Camera"}</span>
                            </button>
                          </div>
                        </>
                      )}

                      {/* ROLE 3: Pharmaceutical Company */}
                      {regRole === UserRole.PHARMA_COMPANY && (
                        <>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700">Pharmaceutical Company Name *</label>
                            <input
                              type="text"
                              placeholder="e.g. Zenith Pharma Ltd."
                              value={regFormData.companyName}
                              onChange={(e) => setRegFormData({ ...regFormData, companyName: e.target.value })}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#1A56DB] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700">Corporate Official Email *</label>
                            <input
                              type="email"
                              placeholder="corporate@zenithpharma.com.bd"
                              value={regFormData.corporateEmail}
                              onChange={(e) => setRegFormData({ ...regFormData, corporateEmail: e.target.value })}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#1A56DB] focus:outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">DGDA License No *</label>
                              <input
                                type="text"
                                placeholder="DGDA-MFG-XXXX"
                                value={regFormData.dgdaLicense}
                                onChange={(e) => setRegFormData({ ...regFormData, dgdaLicense: e.target.value })}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#1A56DB] focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">Factory HQ Location *</label>
                              <input
                                type="text"
                                placeholder="Gazipur Industrial Area"
                                value={regFormData.factoryLocation}
                                onChange={(e) => setRegFormData({ ...regFormData, factoryLocation: e.target.value })}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#1A56DB] focus:outline-none"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* ROLE 4: Distributor / Depot */}
                      {regRole === UserRole.DISTRIBUTOR && (
                        <>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700">Depot / Warehouse Hub Name *</label>
                            <input
                              type="text"
                              placeholder="e.g. Sylhet Regional Pharma Hub"
                              value={regFormData.depotName}
                              onChange={(e) => setRegFormData({ ...regFormData, depotName: e.target.value })}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#1A56DB] focus:outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">Storage Capacity (sq ft)</label>
                              <input
                                type="text"
                                value={regFormData.capacitySqFt}
                                onChange={(e) => setRegFormData({ ...regFormData, capacitySqFt: e.target.value })}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">Cold Chain Active?</label>
                              <button
                                type="button"
                                onClick={() => setRegFormData({ ...regFormData, hasColdChain: !regFormData.hasColdChain })}
                                className={`w-full py-2 text-xs font-bold rounded-xl border ${
                                  regFormData.hasColdChain
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                              >
                                {regFormData.hasColdChain ? "Yes (2°C - 8°C)" : "No (Ambient)"}
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {/* ROLE 5: Medical Representative (MPO) */}
                      {regRole === UserRole.SALES_REP && (
                        <>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700">Affiliated Pharma Company *</label>
                            <input
                              type="text"
                              value={regFormData.assignedCompany}
                              onChange={(e) => setRegFormData({ ...regFormData, assignedCompany: e.target.value })}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">Employee ID *</label>
                              <input
                                type="text"
                                placeholder="EMP-XXXX"
                                value={regFormData.employeeId}
                                onChange={(e) => setRegFormData({ ...regFormData, employeeId: e.target.value })}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">Assigned Territory *</label>
                              <input
                                type="text"
                                placeholder="Dhanmondi Hub"
                                value={regFormData.territory}
                                onChange={(e) => setRegFormData({ ...regFormData, territory: e.target.value })}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* GPS Location simulation */}
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#059669]" />
                          <div>
                            <div className="font-bold text-slate-800">GPS Shop Location Pin</div>
                            <div className="text-[10px] text-slate-500">23.7538° N, 90.3921° E (Auto-detected)</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Pinned
                        </span>
                      </div>

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

                  {/* Step 3: Interactive OTP Keypad */}
                  {regStep === 3 && (
                    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1A56DB] flex items-center justify-center mx-auto">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-sm font-black text-slate-900">Enter Verification Code</h2>
                        <p className="text-xs text-slate-500 mt-1">
                          We sent a 6-digit OTP to <strong>01711-223344</strong>
                        </p>
                      </div>

                      {/* 6-box input */}
                      <div className="flex justify-center gap-1.5">
                        {[0, 1, 2, 3, 4, 5].map((idx) => (
                          <input
                            key={idx}
                            id={`otp-input-${idx}`}
                            type="text"
                            maxLength={1}
                            value={otpCode[idx] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = [...otpCode];
                              updated[idx] = val;
                              setOtpCode(updated);
                              if (val && idx < 5) {
                                const next = document.getElementById(`otp-input-${idx + 1}`);
                                if (next) next.focus();
                              }
                            }}
                            className="w-10 h-12 text-center text-lg font-black rounded-xl border-2 border-slate-200 focus:border-[#1A56DB] focus:outline-none"
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setOtpCode(["2", "5", "9", "9", "5", "3"]);
                          setIsOtpVerified(true);
                        }}
                        className="text-[11px] font-bold text-[#1A56DB] hover:underline block mx-auto"
                      >
                        Auto-fill Demo Code (259953)
                      </button>

                      <button
                        type="button"
                        onClick={handleCompleteRegistration}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#1A56DB] to-[#059669] text-white font-black text-xs shadow-md shadow-blue-500/20 active:scale-98 transition-transform"
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

              {/* ------------------------------------------------------------- */}
              {/* SCREEN 3: 41k MEDICINE SEARCH & ORDER CUTTING                 */}
              {/* ------------------------------------------------------------- */}
              {activeScreen === "MEDICINES" && (
                <div className="p-4 space-y-3 animate-in fade-in duration-200">
                  
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
                                  className="w-5 h-5 rounded-md bg-white text-slate-700 flex items-center justify-center font-black shadow-2xs"
                                >
                                  -
                                </button>
                                <span className="text-xs font-black text-slate-900 min-w-[16px] text-center">
                                  {qtyInCart}
                                </span>
                                <button
                                  onClick={() => addToCart(med.id)}
                                  className="w-5 h-5 rounded-md bg-[#1A56DB] text-white flex items-center justify-center font-black shadow-2xs"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(med.id)}
                                className="px-3 py-1 rounded-xl bg-[#1A56DB] hover:bg-[#1E40AF] text-white text-[11px] font-black flex items-center gap-1 shadow-xs transition-colors"
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
                    <div className="sticky bottom-1 bg-white p-3 rounded-2xl border border-slate-200 shadow-lg flex items-center justify-between">
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

              {/* ------------------------------------------------------------- */}
              {/* SCREEN 4: NEARBY DISTRIBUTOR & LOGISTICS MAP                 */}
              {/* ------------------------------------------------------------- */}
              {activeScreen === "MAP" && (
                <div className="p-4 space-y-3 animate-in fade-in duration-200">
                  
                  <div>
                    <h1 className="text-base font-black text-slate-900">Nearby Pharmaceutical Depots</h1>
                    <p className="text-xs text-slate-500">Live GPS warehouse inventory near Dhanmondi</p>
                  </div>

                  {/* Mobile Interactive Map Graphics Container */}
                  <div className="relative h-48 w-full rounded-3xl bg-slate-200 overflow-hidden border border-slate-300 shadow-inner">
                    {/* Map Grid Background */}
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#1A56DB_1px,transparent_1px)] [background-size:16px_16px]" />
                    
                    {/* Simulated Roads */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 200">
                      <path d="M10,40 Q150,80 290,40" stroke="#94A3B8" strokeWidth="6" fill="none" />
                      <path d="M150,10 L150,190" stroke="#94A3B8" strokeWidth="6" fill="none" />
                      <path d="M40,180 Q150,120 280,180" stroke="#CBD5E1" strokeWidth="4" fill="none" />
                      {/* Active Delivery Route Highlight */}
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

                    {/* Depot 1 Pin (Tejgaon Depot) */}
                    <div className="absolute top-[120px] left-[210px] -translate-x-1/2 -translate-y-1/2 text-center">
                      <div className="w-8 h-8 rounded-full bg-[#059669] text-white flex items-center justify-center shadow-lg ring-4 ring-emerald-200">
                        <Truck className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-black bg-white px-1.5 py-0.5 rounded shadow-xs mt-1 block">
                        Tejgaon Hub (1.2 km)
                      </span>
                    </div>

                    {/* Live Delivery Van in Transit */}
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
                            className="flex-1 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 hover:bg-slate-50"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#059669]" />
                            <span>Call Depot</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveScreen("MEDICINES")}
                            className="flex-1 py-1.5 rounded-xl bg-[#1A56DB] text-white font-black text-xs flex items-center justify-center gap-1 shadow-xs"
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

              {/* ------------------------------------------------------------- */}
              {/* SCREEN 5: ORDERS & LIVE DELIVERY TRACKING                    */}
              {/* ------------------------------------------------------------- */}
              {activeScreen === "ORDERS" && (
                <div className="p-4 space-y-4 animate-in fade-in duration-200">
                  
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
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                          order.status === "IN_TRANSIT"
                            ? "bg-blue-50 text-[#1A56DB] border-blue-200 animate-pulse"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          {order.status === "IN_TRANSIT" ? "In Transit" : "Delivered"}
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
                        {order.dueAmount > 0 ? (
                          <div className="text-rose-600 font-bold">
                            Due: ৳{order.dueAmount}
                          </div>
                        ) : (
                          <span className="text-emerald-600 font-black">Fully Paid ✓</span>
                        )}
                      </div>

                      {/* Driver & Call Action if In Transit */}
                      {order.status === "IN_TRANSIT" && (
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
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call Driver</span>
                          </button>
                        </div>
                      )}
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

              {/* ------------------------------------------------------------- */}
              {/* SCREEN 6: INVENTORY & FEFO BATCH TRACKER                      */}
              {/* ------------------------------------------------------------- */}
              {activeScreen === "INVENTORY" && (
                <div className="p-4 space-y-3 animate-in fade-in duration-200">
                  
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

              {/* ------------------------------------------------------------- */}
              {/* SCREEN 7: NOTIFICATIONS                                       */}
              {/* ------------------------------------------------------------- */}
              {activeScreen === "NOTIFICATIONS" && (
                <div className="p-4 space-y-3 animate-in fade-in duration-200">
                  
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

              {/* ------------------------------------------------------------- */}
              {/* SCREEN 8: MY PROFILE & VERIFIED CREDENTIALS                  */}
              {/* ------------------------------------------------------------- */}
              {activeScreen === "PROFILE" && (
                <div className="p-4 space-y-4 animate-in fade-in duration-200">
                  
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

                  {/* Regulatory Credentials Card */}
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

                  {/* Security & Emergency Hotline */}
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
                    className="w-full py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold"
                  >
                    Register Another Business Entity
                  </button>

                </div>
              )}

            </div>

            {/* =============================================================== */}
            {/* ANDROID BOTTOM NAVIGATION BAR (Functional 5 Tabs)              */}
            {/* =============================================================== */}
            <div className="absolute bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-3 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
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
                    onClick={() => setActiveScreen(item.tab as AndroidScreen)}
                    className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all relative ${
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

            {/* Android System Pill Gesture Bar at Bottom */}
            {!isFrameless && (
              <div className="bg-white pb-2 flex justify-center shrink-0 relative z-30">
                <div className="w-24 h-1 rounded-full bg-slate-300" />
              </div>
            )}

          </div>
        </div>
      </main>

    </div>
  );
}
