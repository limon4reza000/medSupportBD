"use client";

import React from "react";
import { useApp } from "@/lib/context/AppContext";
import { UserRole } from "@/types/domain";
import { SuperAdminDashboard } from "@/components/dashboards/SuperAdminDashboard";
import { PharmaCompanyDashboard } from "@/components/dashboards/PharmaCompanyDashboard";
import { DistributorDashboard } from "@/components/dashboards/DistributorDashboard";
import { MpoTerminalDashboard } from "@/components/dashboards/MpoTerminalDashboard";
import { PharmacyOwnerDashboard } from "@/components/dashboards/PharmacyOwnerDashboard";

export default function HomePage() {
  const { currentUser } = useApp();

  // Multi-tenant operational role dashboards
  if (currentUser?.role === UserRole.SUPER_ADMIN || currentUser?.role === UserRole.ADMIN) {
    return <SuperAdminDashboard />;
  }
  if (currentUser?.role === UserRole.PHARMA_COMPANY) {
    return <PharmaCompanyDashboard />;
  }
  if (currentUser?.role === UserRole.DISTRIBUTOR || currentUser?.role === UserRole.DEPOT_MANAGER) {
    return <DistributorDashboard />;
  }
  if (currentUser?.role === UserRole.SALES_REP) {
    return <MpoTerminalDashboard />;
  }

  // Default: Pharmacy Owner Executive SaaS Dashboard matching user specification
  return <PharmacyOwnerDashboard />;
}
