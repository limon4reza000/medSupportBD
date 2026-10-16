"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Search,
  Filter,
  Navigation,
  Building2,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  ChevronRight,
  ShoppingCart,
  Maximize2,
  Columns,
  List,
  Map as MapIcon,
  Phone,
  RefreshCw,
  LocateFixed,
  Zap,
  X,
} from "lucide-react";
import {
  IDistributorSearchResult,
  ILiveDeliveryVehicle,
  IMedicine,
  PackagingUnit,
} from "@/types/domain";
import { DistributorDetailModal } from "@/components/distributors/DistributorDetailModal";
import { LiveTrackingModal } from "@/components/distributors/LiveTrackingModal";
import { useApp } from "@/lib/context/AppContext";

// Dynamic import of Leaflet Map to avoid Next.js SSR window errors
const DistributorMap = dynamic(
  () => import("@/components/map/DistributorMap").then((mod) => mod.DistributorMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[450px] rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-slate-500 gap-3 border border-slate-200">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-slate-600">Initializing Interactive Leaflet Map...</span>
      </div>
    ),
  }
);

// Location Presets across Dhaka metropolitan area
const PRESET_LOCATIONS = [
  { id: "pharm-01", label: "Green Care Pharmacy (Dhanmondi Central)", lat: 23.7465, lng: 90.376 },
  { id: "pharm-02", label: "Popular Medico (Shamoli / Mirpur Rd)", lat: 23.7705, lng: 90.364 },
  { id: "pharm-03", label: "Khidmah Pharma Care (Uttara Sector 4)", lat: 23.865, lng: 90.399 },
  { id: "loc-tejgaon", label: "Tejgaon Industrial Zone Hub", lat: 23.764, lng: 90.391 },
  { id: "loc-motijheel", label: "Motijheel Commercial District", lat: 23.731, lng: 90.417 },
  { id: "loc-mirpur", label: "Mirpur-10 Circle", lat: 23.807, lng: 90.368 },
];

const RADIUS_OPTIONS = [
  { value: 1, label: "1 km" },
  { value: 5, label: "5 km" },
  { value: 10, label: "10 km" },
  { value: 20, label: "20 km" },
  { value: 50, label: "50 km" },
  { value: 0, label: "All Covered" },
];

export default function DistributorsMapPage() {
  const { currentPharmacy, addToCart } = useApp();

  // Location State
  const [userLocation, setUserLocation] = useState({
    latitude: 23.7465,
    longitude: 90.376,
    label: currentPharmacy?.tradeName || "Green Care Pharmacy (Dhanmondi)",
  });
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Filters State
  const [selectedRadius, setSelectedRadius] = useState<number>(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>(null);
  const [selectedMedicineName, setSelectedMedicineName] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"distance" | "price" | "stock" | "delivery">("distance");
  const [viewMode, setViewMode] = useState<"split" | "map" | "list">("split");

  // Autocomplete Medicine Suggestions
  const [medicineSuggestions, setMedicineSuggestions] = useState<IMedicine[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);

  // Distributor Results & Selections
  const [distributors, setDistributors] = useState<IDistributorSearchResult[]>([]);
  const [isLoadingDistributors, setIsLoadingDistributors] = useState(true);
  const [selectedDistributorId, setSelectedDistributorId] = useState<string | undefined>(undefined);
  const [activeModalDistributor, setActiveModalDistributor] = useState<IDistributorSearchResult | null>(null);

  // Road Route & Live Vehicle
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][] | undefined>(undefined);
  const [activeLiveVehicle, setActiveLiveVehicle] = useState<ILiveDeliveryVehicle | null>(null);

  // Quick Cart Feedback
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  // Fetch Nearby Distributors
  const fetchDistributors = useCallback(async () => {
    setIsLoadingDistributors(true);
    try {
      const params = new URLSearchParams();
      params.set("lat", userLocation.latitude.toString());
      params.set("lng", userLocation.longitude.toString());
      params.set("radiusKm", selectedRadius.toString());
      params.set("sortBy", sortBy);
      if (inStockOnly) params.set("inStockOnly", "true");
      if (selectedMedicineId) {
        params.set("medicineId", selectedMedicineId);
      } else if (searchQuery.trim().length > 0) {
        params.set("q", searchQuery.trim());
      }

      const res = await fetch(`/api/distributors/nearby?${params.toString()}`);
      const data = await res.json();

      if (data.distributors) {
        setDistributors(data.distributors);
        if (data.distributors.length > 0 && !selectedDistributorId) {
          setSelectedDistributorId(data.distributors[0].distributor.id);
        }
      }
    } catch (err) {
      console.error("Failed to load nearby distributors:", err);
    } finally {
      setIsLoadingDistributors(false);
    }
  }, [userLocation, selectedRadius, sortBy, inStockOnly, selectedMedicineId, searchQuery, selectedDistributorId]);

  useEffect(() => {
    fetchDistributors();
  }, [fetchDistributors]);

  // Autocomplete Search Debounce
  useEffect(() => {
    if (!searchQuery.trim() || selectedMedicineId) {
      setMedicineSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearchingSuggestions(true);
      fetch(`/api/medicines?q=${encodeURIComponent(searchQuery.trim())}&limit=6`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setMedicineSuggestions(data);
            setShowSuggestionsDropdown(true);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setIsSearchingSuggestions(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedMedicineId]);

  // Request Road Route from Pharmacy to selected Distributor
  const handleRequestRoute = async (distributor: IDistributorSearchResult) => {
    setSelectedDistributorId(distributor.distributor.id);
    try {
      const res = await fetch("/api/distributors/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startLat: userLocation.latitude,
          startLng: userLocation.longitude,
          destLat: distributor.distributor.latitude,
          destLng: distributor.distributor.longitude,
        }),
      });
      const data = await res.json();
      if (data.route && data.route.coordinates) {
        setRouteCoordinates(data.route.coordinates);
      }
    } catch (err) {
      console.error("Failed to calculate route:", err);
    }
  };

  // Browser Geolocation Detection
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          label: "Current GPS Location (Live)",
        });
        setIsDetectingGps(false);
      },
      (err) => {
        setIsDetectingGps(false);
        setGpsError(
          err.code === 1
            ? "Location permission denied. Please allow location access or choose a preset."
            : "Unable to detect GPS position. Using default location."
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectMedicineSuggestion = (med: IMedicine) => {
    setSelectedMedicineId(med.id);
    setSelectedMedicineName(`${med.brandName} (${med.strength})`);
    setSearchQuery(med.brandName);
    setShowSuggestionsDropdown(false);
  };

  const handleClearMedicineFilter = () => {
    setSelectedMedicineId(null);
    setSelectedMedicineName(null);
    setSearchQuery("");
  };

  const handleQuickAddToCart = (dist: IDistributorSearchResult, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!dist.targetMedicineStock) return;
    addToCart({
      medicineId: dist.targetMedicineStock.medicineId,
      orderedUnit: PackagingUnit.BOX,
      orderedQty: 1,
    });

    setAddedItemIds((prev) => ({ ...prev, [dist.distributor.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [dist.distributor.id]: false }));
    }, 2000);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* =================================================================== */}
      {/* 1. TOP HEADER & TITLE BANNER                                        */}
      {/* =================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-[#241B52] via-[#2E236C] to-[#4338CA] text-white p-5 rounded-3xl shadow-lg border border-indigo-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FB923C] text-white text-[10px] font-black uppercase tracking-wider">
              Live Geospatial Logistics
            </span>
            <span className="text-xs text-indigo-200">
              Interactive Leaflet Map &bull; OSRM Routing &bull; DGDA Depots
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Nearby Distributor &amp; Medicine Inventory Finder
          </h1>
          <p className="text-xs text-indigo-100/90 max-w-2xl">
            Locate authorized pharmaceutical depots within your radius, compare available stock and B2B trade prices, inspect turn-by-turn routes, and place direct orders.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl border border-white/20 self-start md:self-auto shrink-0">
          <button
            onClick={() => setViewMode("split")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === "split"
                ? "bg-white text-[#01382a] shadow-md"
                : "text-emerald-200 hover:text-white"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split View</span>
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === "map"
                ? "bg-white text-[#01382a] shadow-md"
                : "text-emerald-200 hover:text-white"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map Only</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === "list"
                ? "bg-white text-[#01382a] shadow-md"
                : "text-emerald-200 hover:text-white"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List Only</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. SEARCH & LOCATION CONTROLS BAR                                   */}
      {/* =================================================================== */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* 2A. Medicine Inventory Search Input with Autocomplete */}
          <div className="md:col-span-6 relative">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search medicine (e.g., Napa Extra, Seclo 20, Ace Plus)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (selectedMedicineId) setSelectedMedicineId(null);
                }}
                onFocus={() => {
                  if (medicineSuggestions.length > 0) setShowSuggestionsDropdown(true);
                }}
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
              {(searchQuery || selectedMedicineId) && (
                <button
                  onClick={handleClearMedicineFilter}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Selected Medicine Pill Badge */}
            {selectedMedicineName && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                <span className="text-[11px] text-slate-500">Searching Stock For:</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold text-[11px] flex items-center gap-1">
                  <span>{selectedMedicineName}</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={handleClearMedicineFilter} />
                </span>
              </div>
            )}

            {/* Autocomplete Dropdown */}
            {showSuggestionsDropdown && medicineSuggestions.length > 0 && (
              <div className="absolute top-12 left-0 right-0 z-50 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs">
                {medicineSuggestions.map((med) => (
                  <button
                    key={med.id}
                    onClick={() => handleSelectMedicineSuggestion(med)}
                    className="w-full p-2.5 text-left hover:bg-emerald-50/70 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{med.brandName}</span>
                        <span className="text-[11px] text-slate-500 font-normal">{med.strength}</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[9px] text-slate-600 font-bold">
                          {med.dosageForm}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {med.genericName} &bull; {med.manufacturer}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-700">৳{med.tradePricePerPiece}/pc</div>
                      <div className="text-[10px] text-slate-400">MRP ৳{med.mrpPerPiece}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2B. Location Selector Dropdown & GPS Detect */}
          <div className="md:col-span-4 flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-emerald-700 pointer-events-none" />
              <select
                value={
                  PRESET_LOCATIONS.find(
                    (p) =>
                      Math.abs(p.lat - userLocation.latitude) < 0.001 &&
                      Math.abs(p.lng - userLocation.longitude) < 0.001
                  )?.id || "custom"
                }
                onChange={(e) => {
                  const preset = PRESET_LOCATIONS.find((p) => p.id === e.target.value);
                  if (preset) {
                    setUserLocation({
                      latitude: preset.lat,
                      longitude: preset.lng,
                      label: preset.label,
                    });
                    setRouteCoordinates(undefined);
                  }
                }}
                className="w-full pl-9 pr-7 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 bg-slate-50/50 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 truncate"
              >
                {PRESET_LOCATIONS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    📍 {preset.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleDetectGps}
              disabled={isDetectingGps}
              className="px-3 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 disabled:opacity-50"
              title="Detect current GPS coordinates from browser"
            >
              <LocateFixed className={`w-3.5 h-3.5 text-emerald-700 ${isDetectingGps ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{isDetectingGps ? "Locating..." : "GPS"}</span>
            </button>
          </div>

          {/* 2C. Sort Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 text-xs text-slate-800 bg-slate-50/50 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="distance">⚡ Nearest (Road)</option>
              <option value="price">💰 Lowest Trade Price</option>
              <option value="stock">📦 Highest Stock</option>
              <option value="delivery">🚀 Fastest Delivery</option>
            </select>
          </div>

        </div>

        {/* GPS Permission Error Alert */}
        {gpsError && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{gpsError}</span>
            </div>
            <button onClick={() => setGpsError(null)} className="text-amber-700 font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* 2D. Radius Filter Pills & In-Stock Switch */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <span>Distance Radius:</span>
            </span>
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedRadius(opt.value)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedRadius === opt.value
                    ? "bg-[#025540] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span>In-Stock Only</span>
            </label>

            <span className="text-xs text-slate-400 font-medium">
              Found <strong>{distributors.length}</strong> Authorized Depots
            </span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. MAIN SPLIT VIEW (MAP + LISTING)                                 */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT COLUMN: DISTRIBUTOR LISTING (Visible in Split or List mode) */}
        {(viewMode === "split" || viewMode === "list") && (
          <div
            className={`${
              viewMode === "split" ? "lg:col-span-5" : "lg:col-span-12"
            } space-y-3 max-h-[750px] overflow-y-auto pr-1`}
          >
            {isLoadingDistributors ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-2">
                <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold">Scanning nearby authorized pharmaceutical depots...</span>
              </div>
            ) : distributors.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center text-slate-500 space-y-2">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800">No Distributors in this Radius</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try expanding your search radius to 20 km or 50 km, or select &quot;All Covered&quot; to inspect all authorized Bangladesh depots.
                </p>
                <button
                  onClick={() => setSelectedRadius(50)}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  Expand to 50 km
                </button>
              </div>
            ) : (
              distributors.map((item) => {
                const isSelected = item.distributor.id === selectedDistributorId;
                const dist = item.distributor;
                const stock = item.targetMedicineStock;

                return (
                  <div
                    key={dist.id}
                    onClick={() => {
                      setSelectedDistributorId(dist.id);
                      handleRequestRoute(item);
                    }}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer bg-white ${
                      isSelected
                        ? "border-emerald-600 ring-2 ring-emerald-500/30 shadow-md"
                        : "border-slate-200/90 hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    {/* Top Row: Name, Badge, Distance */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-black text-sm text-slate-900">{dist.name}</h4>
                          <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                            Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {dist.companyName} &bull; {dist.thana}, {dist.district}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-black text-xs text-emerald-800">
                          {item.distanceRoadKm} km by Road
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ~{item.estimatedDriveTimeMinutes} mins drive ({item.distanceStraightKm} km straight)
                        </div>
                      </div>
                    </div>

                    {/* Target Medicine Stock Card if searching */}
                    {stock ? (
                      <div className="mt-3 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {stock.brandName} ({stock.strength})
                            </span>
                            <span className="text-[10px] text-slate-500">{stock.manufacturer}</span>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              stock.inStockStatus === "IN_STOCK"
                                ? "bg-emerald-200 text-emerald-900"
                                : stock.inStockStatus === "LOW_STOCK"
                                ? "bg-amber-200 text-amber-900"
                                : "bg-rose-200 text-rose-900"
                            }`}
                          >
                            {stock.availableStockBoxes} Boxes Available
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 text-xs">
                          <div>
                            <span className="font-black text-slate-900">৳{stock.tradePricePerBox} / Box</span>
                            <span className="text-[10px] text-slate-400 ml-1.5">(MRP ৳{stock.mrpPerBox})</span>
                          </div>

                          <button
                            onClick={(e) => handleQuickAddToCart(item, e)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1 active:scale-95"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>{addedItemIds[dist.id] ? "Added!" : "Quick Order"}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl">
                        <span>Full {item.totalCatalogSkusCount}+ SKU Catalog Available</span>
                        <span className="font-bold text-slate-800">Min Order ৳{dist.minOrderAmount.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Active Live Vehicle Badge if courier is sharing */}
                    {item.activeLiveVehicle && item.activeLiveVehicle.isLiveSharing && (
                      <div className="mt-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </span>
                          <span className="font-bold">Active Courier Van in Transit (~{item.activeLiveVehicle.estimatedArrivalMinutes || 12} mins away)</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLiveVehicle(item.activeLiveVehicle || null);
                          }}
                          className="px-2 py-0.5 rounded-md bg-amber-600 text-white font-bold text-[10px]"
                        >
                          Track Van
                        </button>
                      </div>
                    )}

                    {/* Card Actions Footer */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRequestRoute(item);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-all flex items-center gap-1"
                        >
                          <Navigation className="w-3 h-3 text-emerald-700" />
                          <span>Road Route</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModalDistributor(item);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-all flex items-center gap-1"
                        >
                          <Package className="w-3 h-3 text-slate-600" />
                          <span>View Inventory</span>
                        </button>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalDistributor(item);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#025540] hover:bg-[#01382a] text-white font-black transition-all flex items-center gap-1 active:scale-95 shadow-xs"
                      >
                        <span>Select Depot</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* RIGHT COLUMN: INTERACTIVE LEAFLET MAP (Visible in Split or Map mode) */}
        {(viewMode === "split" || viewMode === "map") && (
          <div
            className={`${
              viewMode === "split" ? "lg:col-span-7" : "lg:col-span-12"
            } h-[750px] sticky top-20`}
          >
            <DistributorMap
              userLocation={userLocation}
              distributors={distributors}
              selectedDistributorId={selectedDistributorId}
              onSelectDistributor={(dist) => {
                setSelectedDistributorId(dist.distributor.id);
                handleRequestRoute(dist);
              }}
              routeCoordinates={routeCoordinates}
              activeLiveVehicle={activeLiveVehicle || distributors.find((d) => d.distributor.id === selectedDistributorId)?.activeLiveVehicle}
              showCoverageRadius={true}
            />
          </div>
        )}

      </div>

      {/* =================================================================== */}
      {/* 4. MODALS (DETAIL INVENTORY DRAWER & LIVE TRACKING MODAL)           */}
      {/* =================================================================== */}
      {activeModalDistributor && (
        <DistributorDetailModal
          distributorData={activeModalDistributor}
          onClose={() => setActiveModalDistributor(null)}
          onRequestRoute={() => handleRequestRoute(activeModalDistributor)}
        />
      )}

      {activeLiveVehicle && (
        <LiveTrackingModal
          vehicle={activeLiveVehicle}
          onClose={() => setActiveLiveVehicle(null)}
          onFocusOnMap={(lat, lng) => {
            setUserLocation({ latitude: lat, longitude: lng, label: "Live Courier Point" });
          }}
        />
      )}

    </div>
  );
}
