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
  Menu,
  X,
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedHub, setSelectedHub] = useState("All Hubs & Depots");
  const [isHubDropdownOpen, setIsHubDropdownOpen] = useState(false);

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
    <div className="min-h-screen w-full bg-white py-0 sm:py-6 flex flex-col items-center justify-center font-sans antialiased text-slate-800 selection:bg-[#00ac92] selection:text-white">
      

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
          
          {/* Slide-in Mobile Drawer (Triggered by Hamburger Menu) */}
          {isDrawerOpen && (
            <div className="absolute inset-0 z-50 flex">
              {/* Backdrop */}
              <div
                onClick={() => setIsDrawerOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
              />

              {/* Drawer Content */}
              <div className="relative ml-auto w-64 h-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
                {/* Drawer Header */}
                <div className="bg-[#00ac92] p-3.5 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src="/images/png-final.png" alt="MedGo" className="h-6 w-auto" />
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Pharmacy Info Card (Click to View Profile) */}
                <div
                  onClick={() => {
                    setActiveScreen("PROFILE");
                    setIsDrawerOpen(false);
                  }}
                  className="p-3 bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                  title="View Pharmacy Profile & DGDA Credentials"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00ac92] to-[#059669] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      MI
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">{userProfile.name}</span>
                        <span className="text-[10px] font-bold text-[#00ac92] bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 hover:bg-teal-100 transition-colors">
                          Profile &rarr;
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{userProfile.pharmacyName}</div>
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs font-semibold text-slate-700">
                  {[
                    { screen: "MEDICINES", label: "Stock Borrow (+Borrow)", icon: ShoppingCart },
                    { screen: "DASHBOARD", label: "Dashboard", icon: LayoutDashboard },
                    { screen: "MAP", label: "Depots & Warehouses", icon: MapPin },
                    { screen: "ORDERS", label: "Orders & Van GPS", icon: Truck },
                    { screen: "INVENTORY", label: "FEFO Stock Manager", icon: Boxes },
                    { screen: "NOTIFICATIONS", label: "Notifications", icon: Bell },
                    { screen: "REGISTRATION", label: "Role Registration", icon: UserCheck },
                    { screen: "PROFILE", label: "Pharmacy Profile & DGDA", icon: User },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeScreen === item.screen;
                    return (
                      <button
                        key={item.screen}
                        onClick={() => {
                          setActiveScreen(item.screen as MobileScreen);
                          setIsDrawerOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                          isActive
                            ? "bg-teal-50 text-[#00ac92] font-bold"
                            : "hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? "text-[#00ac92]" : "text-slate-500"}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Drawer Footer */}
                <div className="p-3 border-t border-slate-200 text-center">
                  <div className="text-[11px] text-slate-500">24/7 Helpline: <strong className="text-[#00ac92]">16263</strong></div>
                  <div className="text-[9px] text-slate-400 mt-0.5">MedGo Mobile Prototype v2.4</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Top Status Bar with Dynamic Island & Signal */}
          <div className="h-8 px-5 bg-[#00ac92] text-white text-[11px] font-semibold flex items-center justify-between shrink-0 select-none z-50">
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
          <header className="sticky top-0 z-40 bg-[#00ac92] border-b border-teal-700/30 px-4 py-2.5 flex items-center justify-between shadow-md shrink-0">
        
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

        {/* Right: Notification Bell & +Borrow Action Button */}
        <div className="flex items-center gap-2">
          {/* Notifications Bell */}
          <button
            onClick={() => setActiveScreen("NOTIFICATIONS")}
            className="relative p-1.5 rounded-xl hover:bg-white/10 text-white/90 hover:text-white transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-white" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#00ac92]" />
          </button>

          {/* +Borrow Action */}
          <button
            onClick={() => setActiveScreen("MEDICINES")}
            className="flex items-center gap-0.5 px-1.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-900 text-xs font-black shadow-xs active:scale-95 transition-all border border-white/20"
            title="Emergency Stock Borrow (+Borrow)"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
            <span>Borrow</span>
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
            
            {/* Marketplace Search & Hub Location Card (Matching User Reference) */}
            <div className="-mx-4 -mt-4 px-4 pt-4 pb-5 bg-gradient-to-b from-[#d8f4ef] via-[#e2f7f3] to-[#ebf9f6] rounded-b-[32px] border-b border-[#00ac92]/15 shadow-xs space-y-3">
              {/* Header Title */}
              <div className="text-center">
                <h1 className="text-sm font-extrabold text-[#007d6b] tracking-tight">
                  Explore the healthcare marketplace
                </h1>
              </div>

              {/* Floating Filter & Search Card */}
              <div className="bg-white rounded-2xl p-3 shadow-md shadow-[#00ac92]/10 border border-teal-100/80 relative">
                {/* Top Row: Location / Depot Hub Selector */}
                <div className="relative">
                  <div
                    onClick={() => setIsHubDropdownOpen(!isHubDropdownOpen)}
                    className="flex items-center justify-between cursor-pointer py-0.5 group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#00ac92]/15 flex items-center justify-center text-[#00ac92] shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-[#00ac92] transition-colors truncate">
                        {selectedHub}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform ${isHubDropdownOpen ? "rotate-180" : ""}`} />
                  </div>

                  {/* Hub Selection Dropdown */}
                  {isHubDropdownOpen && (
                    <div className="absolute top-8 left-0 right-0 z-30 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 animate-in fade-in zoom-in-95 text-xs">
                      {[
                        "All Hubs & Depots",
                        "Tejgaon Central Depot (1.2 km)",
                        "Dhanmondi Express Hub (0.8 km)",
                        "Bogura Regional Depot",
                        "Sylhet Logistics Hub",
                        "Chattogram Port Depot",
                      ].map((hub) => (
                        <button
                          key={hub}
                          type="button"
                          onClick={() => {
                            setSelectedHub(hub);
                            setIsHubDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
                            selectedHub === hub
                              ? "bg-teal-50 text-[#00ac92] font-bold"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {hub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Divider Line */}
                <div className="h-px bg-slate-100 my-2" />

                {/* Bottom Row: Search Input + Teal Magnifying Search Button */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search medicines, generics, brands..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setActiveScreen("MEDICINES");
                    }}
                    className="flex-1 text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => setActiveScreen("MEDICINES")}
                    className="w-8 h-8 rounded-xl bg-[#00ac92] hover:bg-[#00927c] text-white flex items-center justify-center shadow-xs active:scale-95 transition-all shrink-0"
                    title="Search Catalog"
                  >
                    <Search className="w-4 h-4 stroke-[2.4]" />
                  </button>
                </div>
              </div>
            </div>

            {/* All Platform Services (12 Interactive Modules) */}
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-y-3 gap-x-2 py-1">
                {[
                  { screen: "DASHBOARD", label: "Dashboard", icon: LayoutDashboard, bg: "bg-teal-50/90 text-[#00ac92] group-hover:bg-blue-100" },
                  { screen: "MEDICINES", label: "Medicines", icon: Search, bg: "bg-emerald-50/90 text-[#059669] group-hover:bg-emerald-100" },
                  { screen: "MEDICINES", label: "+Borrow", icon: Plus, bg: "bg-cyan-50/90 text-cyan-600 group-hover:bg-cyan-100" },
                  { screen: "MAP", label: "Depots", icon: MapPin, bg: "bg-purple-50/90 text-purple-600 group-hover:bg-purple-100" },
                  { screen: "ORDERS", label: "Van GPS", icon: Truck, bg: "bg-indigo-50/90 text-indigo-600 group-hover:bg-indigo-100" },
                  { screen: "INVENTORY", label: "FEFO Stock", icon: Boxes, bg: "bg-amber-50/90 text-amber-600 group-hover:bg-amber-100" },
                  { screen: "MEDICINES", label: "AI Scanner", icon: Camera, bg: "bg-rose-50/90 text-rose-600 group-hover:bg-rose-100" },
                  { screen: "ORDERS", label: "Pay Dues", icon: CreditCard, bg: "bg-emerald-50/90 text-emerald-600 group-hover:bg-emerald-100" },
                  { screen: "PROFILE", label: "DGDA Audit", icon: ShieldCheck, bg: "bg-teal-50/90 text-teal-600 group-hover:bg-teal-100" },
                  { screen: "REGISTRATION", label: "Role Portal", icon: UserCheck, bg: "bg-violet-50/90 text-violet-600 group-hover:bg-violet-100" },
                  { screen: "NOTIFICATIONS", label: "Alerts", icon: Bell, bg: "bg-rose-50/90 text-rose-500 group-hover:bg-rose-100" },
                  { screen: "PROFILE", label: "Hotline", icon: Phone, bg: "bg-slate-100 text-slate-700 group-hover:bg-slate-200" },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveScreen(item.screen as MobileScreen)}
                      className="flex flex-col items-center gap-1.5 transition-all active:scale-90 group text-center"
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-2xs ${item.bg}`}>
                        <Icon className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick 1-Tap Reorder (জনপ্রিয় দ্রুত রি-অর্ডার) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Quick 1-Tap Reorder (দ্রুত রি-অর্ডার)
                </span>
                <button
                  onClick={() => setActiveScreen("MEDICINES")}
                  className="text-[11px] font-bold text-[#00ac92] hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "med-1", name: "Napa Extra", strength: "500mg+65mg", price: 500, comp: "Beximco" },
                  { id: "med-2", name: "Seclo", strength: "20mg Capsule", price: 600, comp: "Square" },
                  { id: "med-3", name: "Sergel", strength: "20mg Tablet", price: 700, comp: "Healthcare" },
                  { id: "med-4", name: "Ceevit", strength: "250mg Chewable", price: 420, comp: "Square" },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-1">
                      <div className="text-xs font-black text-slate-900 truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{item.comp} • {item.strength}</div>
                      <div className="text-[11px] font-black text-slate-900 mt-0.5">৳{item.price}/box</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addToCart(item.id)}
                      className="w-7 h-7 rounded-xl bg-blue-50 hover:bg-[#00ac92] text-[#00ac92] hover:text-white flex items-center justify-center font-bold shadow-2xs active:scale-90 transition-all shrink-0"
                      title="Add to Cart"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Regulatory & Express Hub Guarantee */}
            <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-600 font-bold">Cold Chain 3.8°C Active</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                2-Hr Express Dispatch
              </span>
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
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-2xl bg-white border border-slate-200/90 shadow-2xs focus:border-[#00ac92] focus:outline-none"
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
                      ? "bg-[#00ac92] text-white shadow-2xs"
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
                        <div className="text-[10px] text-[#00ac92] font-bold mt-0.5">{med.company}</div>
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
                            className="w-5 h-5 rounded-md bg-[#00ac92] text-white flex items-center justify-center font-black shadow-2xs active:scale-90"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(med.id)}
                          className="px-3 py-1 rounded-xl bg-[#00ac92] hover:bg-[#00927c] text-white text-[11px] font-black flex items-center gap-1 shadow-xs transition-colors active:scale-95"
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
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00ac92] to-[#059669] text-white text-xs font-black shadow-md flex items-center gap-1.5 active:scale-95 transition-transform"
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
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#00ac92_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 200">
                <path d="M10,40 Q150,80 290,40" stroke="#94A3B8" strokeWidth="6" fill="none" />
                <path d="M150,10 L150,190" stroke="#94A3B8" strokeWidth="6" fill="none" />
                <path d="M40,180 Q150,120 280,180" stroke="#CBD5E1" strokeWidth="4" fill="none" />
                <path
                  d="M60,60 Q150,80 220,130"
                  stroke="#00ac92"
                  strokeWidth="4"
                  strokeDasharray="6,4"
                  fill="none"
                />
              </svg>

              {/* User Pharmacy Pin */}
              <div className="absolute top-[40px] left-[50px] -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="w-7 h-7 rounded-full bg-[#00ac92] text-white flex items-center justify-center shadow-lg ring-4 ring-blue-200/80 animate-pulse">
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
                      <span className="flex items-center gap-1 text-[#00ac92] font-bold">
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
                      className="flex-1 py-1.5 rounded-xl bg-[#00ac92] text-white font-black text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95"
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
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border bg-teal-50 text-[#00ac92] border-teal-200 animate-pulse">
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
                <CreditCard className="w-5 h-5 text-[#00ac92]" />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { mode: "BKASH", label: "bKash", color: "bg-[#D12053] text-white" },
                  { mode: "NAGAD", label: "Nagad", color: "bg-[#F7941D] text-white" },
                  { mode: "BANK", label: "Bank", color: "bg-[#00ac92] text-white" },
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
                className="w-full py-2.5 rounded-xl bg-[#00ac92] text-white text-xs font-black shadow-md active:scale-98 transition-transform"
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
                    <span className="text-[#00ac92] font-bold">FEFO Priority Rank #{item.fefoRank}</span>
                    <button
                      onClick={() => setActiveScreen("MEDICINES")}
                      className="text-xs font-bold text-[#00ac92] hover:underline"
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
              <span className="text-[10px] font-bold text-[#00ac92] bg-blue-50 px-2 py-0.5 rounded-full border border-teal-200">
                2 Unread
              </span>
            </div>

            <div className="space-y-2">
              {notificationsList.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    n.unread
                      ? "bg-white border-teal-300 ring-1 ring-teal-100 shadow-xs"
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
              <span className="text-xs font-black text-[#00ac92] bg-blue-50 px-2 py-1 rounded-full border border-teal-200">
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
                          ? "bg-white border-[#00ac92] ring-2 ring-teal-100 shadow-md"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-slate-900">{item.title}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#00ac92]" />}
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
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#00ac92] to-[#059669] text-white font-black text-xs shadow-md shadow-teal-500/20 active:scale-98 transition-transform"
                >
                  Proceed to Role Form
                </button>
              </div>
            )}

            {/* Step 2: Form */}
            {regStep === 2 && (
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
                  <Building2 className="w-4 h-4 text-[#00ac92]" />
                  <span>Applying as: <strong>{regRole}</strong></span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Mahfuzul Islam"
                    value={regFormData.fullName}
                    onChange={(e) => setRegFormData({ ...regFormData, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#00ac92] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Mobile Number (for OTP) *</label>
                  <input
                    type="tel"
                    placeholder="01711-223344"
                    value={regFormData.phone}
                    onChange={(e) => setRegFormData({ ...regFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#00ac92] focus:outline-none"
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
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#00ac92] focus:outline-none"
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
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#00ac92] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Trade License *</label>
                        <input
                          type="text"
                          placeholder="TRAD-XXXX"
                          value={regFormData.tradeLicense}
                          onChange={(e) => setRegFormData({ ...regFormData, tradeLicense: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#00ac92] focus:outline-none"
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
                        className="w-full py-2.5 rounded-xl border-2 border-dashed border-teal-300 bg-white hover:bg-teal-50 text-[#00ac92] text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
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
                    className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[#00ac92] to-[#059669] text-white text-xs font-black shadow-md active:scale-98 transition-transform"
                  >
                    Verify with OTP
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: OTP */}
            {regStep === 3 && (
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#00ac92] flex items-center justify-center mx-auto">
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
                      className="w-10 h-12 text-center text-lg font-black rounded-xl border-2 border-slate-200 focus:border-[#00ac92] focus:outline-none"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setOtpCode(["2", "5", "9", "9", "5", "3"])}
                  className="text-[11px] font-bold text-[#00ac92] hover:underline block mx-auto"
                >
                  Auto-fill Demo Code (259953)
                </button>

                <button
                  type="button"
                  onClick={handleCompleteRegistration}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#00ac92] to-[#059669] text-white font-black text-xs shadow-md active:scale-98 transition-transform"
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
                  className="w-full py-3 rounded-2xl bg-[#00ac92] text-white font-black text-xs shadow-md active:scale-98 transition-transform"
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
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00ac92] to-[#059669] text-white flex items-center justify-center font-black text-lg shadow-md">
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
                <div className="text-[11px] text-[#00ac92] font-bold">{userProfile.phone}</div>
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
                  <span className="font-black text-[#00ac92]">16263</span>
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
                { tab: "MENU", label: "Menu", icon: Menu },
              ].map((item) => {
                const Icon = item.icon;
                const isCurrent = activeScreen === item.tab || (item.tab === "MENU" && (isDrawerOpen || activeScreen === "PROFILE"));

                if (item.tab === "MAP") {
                  return (
                    <button
                      key={item.tab}
                      type="button"
                      onClick={() => setActiveScreen("MAP")}
                      className="flex flex-col items-center relative px-2 active:scale-95 transition-all group"
                    >
                      <div className="relative -mt-6 mb-0.5">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg border-[3.5px] border-white transition-all ${
                            isCurrent
                              ? "bg-[#00ac92] shadow-[#00ac92]/45 ring-2 ring-[#00ac92]/30 scale-105"
                              : "bg-[#00ac92] hover:bg-[#00927c] shadow-[#00ac92]/35"
                          }`}
                        >
                          <Icon className="w-5 h-5 stroke-[2.4]" />
                        </div>
                      </div>
                      <span
                        className={`text-[10px] tracking-tight transition-colors ${
                          isCurrent
                            ? "text-[#00ac92] font-black"
                            : "text-slate-600 font-bold group-hover:text-slate-900"
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                }

                if (item.tab === "MENU") {
                  return (
                    <button
                      key={item.tab}
                      type="button"
                      onClick={() => setIsDrawerOpen(true)}
                      className={`flex flex-col items-center gap-0.5 py-0.5 px-2.5 rounded-xl transition-all relative ${
                        isCurrent
                          ? "text-[#00ac92] font-extrabold"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                      title="Open Menu & Profile"
                    >
                      <div className="relative">
                        <Menu className={`w-5 h-5 ${isCurrent ? "stroke-[2.4]" : "stroke-[1.8]"}`} />
                        {isCurrent && (
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#00ac92]" />
                        )}
                      </div>
                      <span className="text-[10px] tracking-tight">{item.label}</span>
                    </button>
                  );
                }

                return (
                  <button
                    key={item.tab}
                    type="button"
                    onClick={() => setActiveScreen(item.tab as MobileScreen)}
                    className={`flex flex-col items-center gap-0.5 py-0.5 px-2.5 rounded-xl transition-all relative ${
                      isCurrent
                        ? "text-[#00ac92] font-extrabold"
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
