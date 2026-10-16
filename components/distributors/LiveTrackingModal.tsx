"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Truck,
  Phone,
  ShieldCheck,
  MapPin,
  Clock,
  Compass,
  Zap,
  CheckCircle2,
  Navigation,
} from "lucide-react";
import { ILiveDeliveryVehicle } from "@/types/domain";

interface LiveTrackingModalProps {
  vehicle: ILiveDeliveryVehicle | null;
  onClose: () => void;
  onFocusOnMap: (lat: number, lng: number) => void;
}

export const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({
  vehicle,
  onClose,
  onFocusOnMap,
}) => {
  const [currentEta, setCurrentEta] = useState(vehicle?.estimatedArrivalMinutes || 12);
  const [speed, setSpeed] = useState(vehicle?.speedKmh || 26.5);

  useEffect(() => {
    if (!vehicle) return;

    // Simulate minor movement adjustments every 4 seconds
    const interval = setInterval(() => {
      setSpeed((prev) => Math.max(15, Math.min(42, Number((prev + (Math.random() * 4 - 2)).toFixed(1)))));
      setCurrentEta((prev) => Math.max(2, prev > 5 ? prev - 1 : prev));
    }, 4000);

    return () => clearInterval(interval);
  }, [vehicle]);

  if (!vehicle) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-inner border border-white/30">
              🚚
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-400 rounded-full border-2 border-white animate-ping"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-white">
                  Live Courier Tracking
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-400 text-slate-950 text-[10px] font-black uppercase">
                  Active GPS
                </span>
              </div>
              <p className="text-xs text-amber-200 font-mono mt-0.5">
                {vehicle.vehicleNumber} &bull; {vehicle.depotName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-amber-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs text-slate-800">
          
          {/* Real-time Status Card */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
                Estimated Delivery Arrival
              </span>
              <div className="font-black text-2xl text-slate-900 mt-0.5 flex items-baseline gap-1.5">
                <span>~{currentEta} Minutes</span>
                <span className="text-xs font-normal text-slate-500">({speed} km/h)</span>
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          {/* Courier Driver Details */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Assigned Delivery Personnel</span>
            </h4>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-black text-sm text-slate-900">{vehicle.driverName}</div>
                <div className="text-[11px] text-slate-500">Authorized Logistics Representative</div>
              </div>

              <a
                href={`tel:${vehicle.driverPhone}`}
                className="px-3 py-1.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-600 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Driver</span>
              </a>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div>
                <span className="text-slate-400 block">Phone:</span>
                <span className="font-bold text-slate-800">{vehicle.driverPhone}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Active Dispatch Order:</span>
                <span className="font-mono font-bold text-indigo-800">{vehicle.activeOrderId || "In Transit"}</span>
              </div>
            </div>
          </div>

          {/* Live Coordinates info */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
            <div>
              <span className="text-slate-400 block">Current GPS Coordinates:</span>
              <span className="font-mono font-bold text-slate-700">
                {vehicle.currentLatitude.toFixed(5)}, {vehicle.currentLongitude.toFixed(5)}
              </span>
            </div>

            <button
              onClick={() => {
                onFocusOnMap(vehicle.currentLatitude, vehicle.currentLongitude);
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#4F46E5] hover:bg-[#1E1743] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Navigation className="w-3 h-3 text-indigo-300" />
              <span>Locate on Map</span>
            </button>
          </div>

          {/* Privacy Note */}
          <div className="text-[10px] text-slate-500 text-center leading-relaxed">
            🔒 Location tracking is enabled in real-time only while the delivery representative is actively fulfilling dispatched orders.
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
