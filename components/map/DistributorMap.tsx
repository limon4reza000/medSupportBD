"use client";

import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { IDistributorLocation, IDistributorSearchResult, ILiveDeliveryVehicle } from "@/types/domain";

interface DistributorMapProps {
  userLocation: { latitude: number; longitude: number; label?: string };
  distributors: IDistributorSearchResult[];
  selectedDistributorId?: string;
  onSelectDistributor: (distributor: IDistributorSearchResult) => void;
  routeCoordinates?: [number, number][];
  activeLiveVehicle?: ILiveDeliveryVehicle;
  showCoverageRadius?: boolean;
}

export const DistributorMap: React.FC<DistributorMapProps> = ({
  userLocation,
  distributors,
  selectedDistributorId,
  onSelectDistributor,
  routeCoordinates,
  activeLiveVehicle,
  showCoverageRadius = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const coverageCircleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.latitude, userLocation.longitude],
        zoom: 13,
        zoomControl: false,
      });

      // Add high-resolution OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | MedSupplyBD',
        maxZoom: 19,
      }).addTo(map);

      // Add custom zoom control in top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update user pharmacy marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const userIcon = L.divIcon({
      className: "custom-user-marker",
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-3 rounded-full bg-emerald-500/25 animate-ping"></div>
          <div class="w-10 h-10 rounded-full bg-[#01382a] border-2 border-white shadow-xl flex items-center justify-center text-white text-lg font-black ring-4 ring-emerald-400/40">
            🏥
          </div>
          <div class="absolute -bottom-6 bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md whitespace-nowrap border border-slate-700">
            ${userLocation.label || "Your Pharmacy"}
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    userMarkerRef.current = L.marker(
      [userLocation.latitude, userLocation.longitude],
      { icon: userIcon, zIndexOffset: 1000 }
    ).addTo(map);

    userMarkerRef.current.bindPopup(`
      <div class="p-2 text-slate-900 text-xs font-sans">
        <div class="font-bold text-sm text-[#01382a]">🏥 ${userLocation.label || "Your Registered Pharmacy"}</div>
        <div class="text-slate-500 text-[11px] mt-0.5">Lat: ${userLocation.latitude.toFixed(4)}, Lng: ${userLocation.longitude.toFixed(4)}</div>
        <div class="text-[10px] text-emerald-700 font-bold mt-1">Active Geo-Center for Radius Search</div>
      </div>
    `);
  }, [userLocation]);

  // Update distributor markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    distributors.forEach((item) => {
      const isSelected = item.distributor.id === selectedDistributorId;
      const dist = item.distributor;
      const stock = item.targetMedicineStock;

      // Color coding per manufacturer company
      let badgeColor = "#025540";
      if (dist.companyName.includes("Beximco")) badgeColor = "#1e40af";
      else if (dist.companyName.includes("Incepta")) badgeColor = "#7c3aed";
      else if (dist.companyName.includes("Renata")) badgeColor = "#b45309";
      else if (dist.companyName.includes("ACI")) badgeColor = "#0e7490";
      else if (dist.companyName.includes("Eskayef")) badgeColor = "#be123c";

      const stockBadge = stock
        ? stock.inStockStatus === "IN_STOCK"
          ? `<span class="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">৳${stock.tradePricePerBox} • In Stock</span>`
          : stock.inStockStatus === "LOW_STOCK"
          ? `<span class="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">Low Stock</span>`
          : `<span class="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">Out of Stock</span>`
        : "";

      const markerHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer ${isSelected ? "scale-110 z-50" : "hover:scale-105"} transition-transform">
          <div class="relative w-9 h-9 rounded-2xl flex items-center justify-center text-white text-base shadow-lg border-2 border-white" style="background-color: ${badgeColor}; ${isSelected ? "box-shadow: 0 0 0 4px #10b981, 0 10px 15px -3px rgba(0,0,0,0.3);" : ""}">
            🏢
            ${isSelected ? '<span class="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-ping"></span>' : ""}
          </div>
          <div class="mt-1 flex flex-col items-center">
            <span class="bg-white/95 backdrop-blur-xs text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-md shadow-md border border-slate-200 whitespace-nowrap">
              ${dist.name.split(" ")[0]} (${item.distanceRoadKm} km)
            </span>
            ${stockBadge ? `<div class="mt-0.5">${stockBadge}</div>` : ""}
          </div>
        </div>
      `;

      const distIcon = L.divIcon({
        className: "custom-distributor-marker",
        html: markerHtml,
        iconSize: [45, 60],
        iconAnchor: [22, 30],
      });

      const marker = L.marker([dist.latitude, dist.longitude], {
        icon: distIcon,
        zIndexOffset: isSelected ? 500 : 100,
      });

      marker.on("click", () => {
        onSelectDistributor(item);
      });

      marker.addTo(markersLayer);
    });
  }, [distributors, selectedDistributorId, onSelectDistributor]);

  // Update Route Polyline and Selected Distributor Coverage Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous route
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    // Clear previous circle
    if (coverageCircleRef.current) {
      coverageCircleRef.current.remove();
      coverageCircleRef.current = null;
    }

    const selected = distributors.find((d) => d.distributor.id === selectedDistributorId);

    if (selected) {
      // Draw coverage radius circle
      if (showCoverageRadius) {
        coverageCircleRef.current = L.circle(
          [selected.distributor.latitude, selected.distributor.longitude],
          {
            radius: selected.distributor.coverageRadiusKm * 1000,
            color: "#059669",
            fillColor: "#10b981",
            fillOpacity: 0.08,
            weight: 1.5,
            dashArray: "4, 6",
          }
        ).addTo(map);
      }

      // Draw road route line
      if (routeCoordinates && routeCoordinates.length > 0) {
        routePolylineRef.current = L.polyline(routeCoordinates, {
          color: "#025540",
          weight: 5,
          opacity: 0.85,
          lineJoin: "round",
          dashArray: "1, 8",
        }).addTo(map);

        // Fit map bounds to show route between user and distributor
        const bounds = L.latLngBounds([
          [userLocation.latitude, userLocation.longitude],
          [selected.distributor.latitude, selected.distributor.longitude],
          ...routeCoordinates,
        ]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } else {
        // Pan to selected distributor
        map.panTo([selected.distributor.latitude, selected.distributor.longitude], {
          animate: true,
          duration: 0.6,
        });
      }
    }
  }, [selectedDistributorId, routeCoordinates, showCoverageRadius, distributors, userLocation]);

  // Update live delivery courier vehicle marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (vehicleMarkerRef.current) {
      vehicleMarkerRef.current.remove();
      vehicleMarkerRef.current = null;
    }

    if (activeLiveVehicle && activeLiveVehicle.isLiveSharing) {
      const vehicleIcon = L.divIcon({
        className: "custom-vehicle-marker",
        html: `
          <div class="relative flex flex-col items-center">
            <div class="absolute -inset-2.5 rounded-full bg-amber-500/30 animate-ping"></div>
            <div class="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-xl border-2 border-white ring-4 ring-amber-400/50">
              🚚
            </div>
            <div class="mt-1 bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md border border-slate-700 whitespace-nowrap">
              ${activeLiveVehicle.driverName} (${activeLiveVehicle.speedKmh} km/h)
            </div>
          </div>
        `,
        iconSize: [40, 55],
        iconAnchor: [20, 20],
      });

      vehicleMarkerRef.current = L.marker(
        [activeLiveVehicle.currentLatitude, activeLiveVehicle.currentLongitude],
        { icon: vehicleIcon, zIndexOffset: 900 }
      ).addTo(map);

      vehicleMarkerRef.current.bindPopup(`
        <div class="p-2 text-slate-900 text-xs">
          <div class="font-bold text-sm text-amber-700 flex items-center gap-1">🚚 Live Courier in Transit</div>
          <div class="font-mono text-xs text-slate-800 mt-1">${activeLiveVehicle.vehicleNumber}</div>
          <div class="text-[11px] text-slate-600 mt-0.5">Driver: <strong>${activeLiveVehicle.driverName}</strong> (${activeLiveVehicle.driverPhone})</div>
          <div class="text-[11px] text-slate-600">Speed: <strong>${activeLiveVehicle.speedKmh} km/h</strong></div>
          <div class="text-[11px] text-emerald-700 font-bold mt-1">Est. Arrival: ~${activeLiveVehicle.estimatedArrivalMinutes || 12} mins</div>
        </div>
      `);
    }
  }, [activeLiveVehicle]);

  // Recenter helper button
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.latitude, userLocation.longitude], 13, {
        animate: true,
      });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-200 shadow-md">
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px] z-0" />

      {/* Floating Map Controls */}
      <div className="absolute top-3 left-3 z-[400] flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 shadow-lg border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 hover:shadow-xl"
          title="Recenter on your pharmacy location"
        >
          <span>🎯</span>
          <span className="hidden sm:inline">My Pharmacy</span>
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-slate-200 text-[11px] text-slate-700 hidden sm:flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#01382a] border border-white"></span>
          <span>Your Pharmacy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[#025540]"></span>
          <span>Distributor Depot</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Live Courier Van</span>
        </div>
      </div>
    </div>
  );
};
