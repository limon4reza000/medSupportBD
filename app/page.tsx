"use client";

import React, { useState, useEffect } from "react";
import { IBatch, IMedicine, IPharmacy, ITradeOffer } from "@/types/domain";
import { initialMedicines, initialBatches, initialTradeOffers, initialPharmacies } from "@/lib/mockDb";
import { Navbar } from "@/components/Navbar";
import { MetricsOverview } from "@/components/MetricsOverview";
import { OrderCuttingTerminal, CartItem } from "@/components/OrderCuttingTerminal";
import { AiSlipParserModal } from "@/components/AiSlipParserModal";
import { FifoBatchInspector } from "@/components/FifoBatchInspector";
import { AiDemandForecaster } from "@/components/AiDemandForecaster";
import { GenericAlternativesFinder } from "@/components/GenericAlternativesFinder";
import { LedgerManager } from "@/components/LedgerManager";

export default function Home() {
  const [medicines, setMedicines] = useState<IMedicine[]>(initialMedicines);
  const [batches, setBatches] = useState<IBatch[]>(initialBatches);
  const [offers] = useState<ITradeOffer[]>(initialTradeOffers);
  const [pharmacies, setPharmacies] = useState<IPharmacy[]>(initialPharmacies);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>("pharm-01");
  const [activeTab, setActiveTab] = useState<string>("order-cutting");
  const [incomingCartItems, setIncomingCartItems] = useState<CartItem[]>([]);

  // Refresh pharmacy data & batch stock from API / in-memory store
  const refreshData = async () => {
    try {
      const [medRes, pharmRes] = await Promise.all([
        fetch("/api/medicines"),
        fetch("/api/pharmacies"),
      ]);

      if (medRes.ok) {
        const medData = await medRes.json();
        setMedicines(medData);
        // Gather all batches
        const allBatches = medData.flatMap((m: any) => m.batches || []);
        if (allBatches.length > 0) setBatches(allBatches);
      }

      if (pharmRes.ok) {
        const pharmData = await pharmRes.json();
        setPharmacies(pharmData);
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const currentPharmacy =
    pharmacies.find((p) => p.id === selectedPharmacyId) || pharmacies[0];

  const handleImportToCart = (items: CartItem[]) => {
    setIncomingCartItems(items);
    setActiveTab("order-cutting");
  };

  const handleOrderSuccess = (orderData: any) => {
    refreshData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#01140f] text-white selection:bg-[#10b981] selection:text-black">
      {/* Top Navbar */}
      <Navbar
        pharmacies={pharmacies}
        selectedPharmacyId={selectedPharmacyId}
        onSelectPharmacy={(id) => setSelectedPharmacyId(id)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Metrics Bar */}
        <MetricsOverview
          medicines={medicines}
          batches={batches}
          offers={offers}
          pharmacy={currentPharmacy}
        />

        {/* Tab Views */}
        {activeTab === "order-cutting" && (
          <OrderCuttingTerminal
            medicines={medicines}
            batches={batches}
            offers={offers}
            pharmacy={currentPharmacy}
            onOrderSuccess={handleOrderSuccess}
            externalCartItems={incomingCartItems}
            onClearExternalCart={() => setIncomingCartItems([])}
          />
        )}

        {activeTab === "ai-slip-parser" && (
          <AiSlipParserModal
            medicines={medicines}
            onImportToCart={handleImportToCart}
          />
        )}

        {activeTab === "fifo-inspector" && (
          <FifoBatchInspector medicines={medicines} batches={batches} />
        )}

        {activeTab === "ai-forecast" && (
          <AiDemandForecaster
            medicines={medicines}
            pharmacyId={selectedPharmacyId}
            onImportToCart={handleImportToCart}
          />
        )}

        {activeTab === "generic-substitute" && (
          <GenericAlternativesFinder
            medicines={medicines}
            onImportToCart={handleImportToCart}
          />
        )}

        {activeTab === "credit-ledger" && (
          <LedgerManager
            pharmacy={currentPharmacy}
            onRefreshPharmacy={refreshData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#047857]/30 bg-[#011b14] py-4 text-center text-xs text-emerald-300/60">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MedSupply BD — B2B Pharmaceutical Order Cutting & Inventory Platform</span>
          <span className="text-emerald-400 font-mono">Theme: #025540 Surgical Green • Text: Pure White</span>
        </div>
      </footer>
    </div>
  );
}
