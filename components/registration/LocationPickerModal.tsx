"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  X,
  Check,
  Navigation,
  Compass,
  Building,
  Search,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLocation: (location: {
    address: string;
    latitude: number;
    longitude: number;
    thana?: string;
    district?: string;
  }) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  title?: string;
}

const BD_DIVISIONS = [
  { name: "Dhaka (Central)", lat: 23.8103, lng: 90.4125, thana: "Dhanmondi", district: "Dhaka" },
  { name: "Chittagong (Port)", lat: 22.3569, lng: 91.7832, thana: "Kotwali", district: "Chittagong" },
  { name: "Sylhet (Tea Valley)", lat: 24.8949, lng: 91.8687, thana: "Amberkhana", district: "Sylhet" },
  { name: "Rajshahi (Silk City)", lat: 24.3636, lng: 88.6241, thana: "Boalia", district: "Rajshahi" },
  { name: "Khulna (Sundarbans)", lat: 22.8456, lng: 89.5403, thana: "Sonadanga", district: "Khulna" },
  { name: "Barisal (Coastal Hub)", lat: 22.701, lng: 90.3535, thana: "Kotwali", district: "Barisal" },
  { name: "Rangpur (North Hub)", lat: 25.7439, lng: 89.2752, thana: "Kotwali", district: "Rangpur" },
  { name: "Mymensingh (Central North)", lat: 24.7471, lng: 90.4203, thana: "Sadar", district: "Mymensingh" },
];

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onConfirmLocation,
  initialLat = 23.7465,
  initialLng = 90.376,
  initialAddress = "",
  title = "Select Business Physical Location",
}) => {
  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [addressInput, setAddressInput] = useState(initialAddress);
  const [district, setDistrict] = useState("Dhaka");
  const [thana, setThana] = useState("Dhanmondi");
  const [isLocating, setIsLocating] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Initialize and manage Leaflet map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically import Leaflet
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [currentLat, currentLng],
          zoom: 14,
          zoomControl: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap | MedSupplyBD GeoPicker',
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: "topright" }).addTo(map);

        // Custom Pin Icon
        const customIcon = L.divIcon({
          className: "custom-picker-pin",
          html: `
            <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full">
              <div class="w-10 h-10 rounded-2xl bg-[#4F46E5] border-2 border-white shadow-2xl flex items-center justify-center text-white text-base font-black ring-4 ring-indigo-500/30">
                📍
              </div>
              <div class="absolute -bottom-2 w-3 h-3 bg-[#4F46E5] rotate-45 border-r border-b border-white"></div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        const marker = L.marker([currentLat, currentLng], {
          icon: customIcon,
          draggable: true,
        }).addTo(map);

        marker.on("dragend", (e: any) => {
          const latlng = e.target.getLatLng();
          setCurrentLat(Number(latlng.lat.toFixed(6)));
          setCurrentLng(Number(latlng.lng.toFixed(6)));
        });

        // Click anywhere on map to drop / move pin
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          setCurrentLat(Number(lat.toFixed(6)));
          setCurrentLng(Number(lng.toFixed(6)));
          marker.setLatLng([lat, lng]);
        });

        markerRef.current = marker;
        mapRef.current = map;
      } else {
        mapRef.current.invalidateSize();
      }
    });

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen]);

  // Update marker position when state coordinates change
  const setCoords = (lat: number, lng: number) => {
    setCurrentLat(lat);
    setCurrentLng(lng);
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.setView([lat, lng], 14, { animate: true });
    }
  };

  // HTML5 Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setCoords(lat, lng);
        setAddressInput(`GPS Location (Lat: ${lat}, Lng: ${lng})`);
      },
      (err) => {
        setIsLocating(false);
        alert(`Location access denied or unavailable: ${err.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectDivision = (div: typeof BD_DIVISIONS[0]) => {
    setCoords(div.lat, div.lng);
    setDistrict(div.district);
    setThana(div.thana);
    if (!addressInput) {
      setAddressInput(`${div.thana}, ${div.district}`);
    }
  };

  const handleConfirm = () => {
    const finalAddress = addressInput.trim() || `${thana}, ${district} (GPS: ${currentLat}, ${currentLng})`;
    onConfirmLocation({
      address: finalAddress,
      latitude: currentLat,
      longitude: currentLng,
      thana,
      district,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#241B52] via-[#2E236C] to-[#4338CA] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight">{title}</h3>
              <p className="text-[11px] text-indigo-100/80">Click on map or drag pin to set exact GPS coordinates</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Division Quick Presets */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[10px] font-black uppercase text-slate-400 shrink-0 pr-1">Division Preset:</span>
            {BD_DIVISIONS.map((d) => (
              <button
                key={d.name}
                type="button"
                onClick={() => handleSelectDivision(d)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-indigo-50 hover:text-[#4F46E5] hover:border-indigo-300 shrink-0 text-[11px] transition-all"
              >
                {d.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Map Area */}
        <div className="relative flex-1 min-h-[300px] w-full bg-slate-100">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

          {/* Floating Geolocation & Coords Widget */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="px-3 py-2 rounded-xl bg-white shadow-lg border border-slate-200 text-xs font-bold text-slate-800 hover:text-[#4F46E5] flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Navigation className={`w-3.5 h-3.5 text-[#4F46E5] ${isLocating ? "animate-spin" : ""}`} />
              <span>{isLocating ? "Detecting GPS..." : "My GPS Location"}</span>
            </button>

            <div className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-lg text-[11px] font-mono border border-slate-700">
              <span className="text-indigo-400 font-bold">Lat:</span> {currentLat.toFixed(5)},{" "}
              <span className="text-indigo-400 font-bold">Lng:</span> {currentLng.toFixed(5)}
            </div>
          </div>
        </div>

        {/* Footer: Address Input & Confirm Button */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 space-y-3 shrink-0">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Shop Physical Address & Landmark: <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="e.g. Shop 14, Central Road, Dhanmondi, Dhaka"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 bg-slate-50/50"
              />
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="text-[11px] text-slate-500 hidden sm:block">
              Coordinates will be locked to your DGDA geo-verified territory.
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Location & Coordinates</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
