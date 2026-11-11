import { NextRequest, NextResponse } from "next/server";
import { resolveUser, enforceTenantBoundary } from "@/lib/auth/guards";
import { Permission, hasPermission } from "@/lib/auth/rbac";
import { db } from "@/lib/mockDb";
import { OrderStatus, UserRole } from "@/types/domain";

export const dynamic = "force-dynamic";

interface DateRange {
  startDate: Date;
  endDate: Date;
  prevStartDate: Date;
  prevEndDate: Date;
  label: string;
}

function resolvePeriod(
  period: string,
  customStart?: string | null,
  customEnd?: string | null
): { range?: DateRange; error?: string } {
  const now = new Date(); // Current time

  switch (period.toLowerCase()) {
    case "today": {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const prevStart = new Date(start.getTime() - 24 * 60 * 60 * 1000);
      const prevEnd = new Date(end.getTime() - 24 * 60 * 60 * 1000);
      return { range: { startDate: start, endDate: end, prevStartDate: prevStart, prevEndDate: prevEnd, label: "Today" } };
    }
    case "7d": {
      const end = new Date(now);
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const prevEnd = new Date(start.getTime() - 1);
      const prevStart = new Date(prevEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { range: { startDate: start, endDate: end, prevStartDate: prevStart, prevEndDate: prevEnd, label: "Last 7 Days" } };
    }
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      const prevStart = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
      const prevEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
      return { range: { startDate: start, endDate: end, prevStartDate: prevStart, prevEndDate: prevEnd, label: "Last Month" } };
    }
    case "this_year": {
      const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      const end = new Date(now);
      const prevStart = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
      const prevEnd = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return { range: { startDate: start, endDate: end, prevStartDate: prevStart, prevEndDate: prevEnd, label: "This Year" } };
    }
    case "custom": {
      if (!customStart || !customEnd) {
        return { error: "Both startDate and endDate are required for custom period queries." };
      }
      const start = new Date(customStart);
      const end = new Date(customEnd);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return { error: "Invalid date format. Expected ISO 8601 timestamps (e.g. 2026-11-01T00:00:00Z)." };
      }
      if (start > end) {
        return { error: "startDate cannot be after endDate." };
      }
      const maxRangeMs = 365 * 24 * 60 * 60 * 1000;
      if (end.getTime() - start.getTime() > maxRangeMs) {
        return { error: "Date range query cannot exceed 365 days." };
      }
      const duration = end.getTime() - start.getTime();
      const prevEnd = new Date(start.getTime() - 1);
      const prevStart = new Date(prevEnd.getTime() - duration);
      return { range: { startDate: start, endDate: end, prevStartDate: prevStart, prevEndDate: prevEnd, label: "Custom Range" } };
    }
    case "this_month":
    default: {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(now);
      const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { range: { startDate: start, endDate: end, prevStartDate: prevStart, prevEndDate: prevEnd, label: "This Month" } };
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate Request
    const user = resolveUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to access dashboard analytics." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const periodParam = searchParams.get("period") || "this_month";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");
    const companyIdParam = searchParams.get("companyId") || "all";

    // 2. Multi-Tenant Authorization check for MPOs / Sales Reps
    if (user.role === UserRole.SALES_REP) {
      if (companyIdParam !== "all" && companyIdParam.toLowerCase() !== user.companyId?.toLowerCase()) {
        return NextResponse.json(
          {
            success: false,
            error: "MPO representatives can only access dashboard analytics for their assigned pharmaceutical company.",
            code: "TENANT_ISOLATION_VIOLATION",
          },
          { status: 403 }
        );
      }
    }

    // 3. Resolve Date Horizon
    const periodResult = resolvePeriod(periodParam, customStart, customEnd);
    if (periodResult.error || !periodResult.range) {
      return NextResponse.json(
        { success: false, error: periodResult.error || "Invalid date parameters." },
        { status: 422 }
      );
    }
    const { startDate, endDate, prevStartDate, prevEndDate, label } = periodResult.range;

    // 4. Resolve Target Pharmacy
    const targetPharmacyId = user.pharmacyId || "pharm-01";
    const pharmacy = db.pharmacies.find((p) => p.id === targetPharmacyId) || db.pharmacies[0];

    // 5. Query and Filter Orders from Database
    const effectiveCompanyId =
      user.role === UserRole.SALES_REP ? user.companyId || companyIdParam : companyIdParam;

    const allPharmacyOrders = (db.orders || []).filter(
      (o) => o.pharmacyId === targetPharmacyId && o.status !== OrderStatus.CANCELLED && o.status !== "CANCELLED"
    );

    const companyFilteredOrders = allPharmacyOrders.filter((o) => {
      if (effectiveCompanyId === "all") return true;
      const target = effectiveCompanyId.toLowerCase();
      return (
        (o.companyId && o.companyId.toLowerCase().includes(target)) ||
        (o.companyName && o.companyName.toLowerCase().includes(target))
      );
    });

    // Orders in current period
    const periodOrders = companyFilteredOrders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });

    // Orders in previous equivalent period
    const prevPeriodOrders = companyFilteredOrders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= prevStartDate && orderDate <= prevEndDate;
    });

    // Orders YTD
    const startOfYear = new Date(startDate.getFullYear(), 0, 1, 0, 0, 0, 0);
    const ytdOrders = companyFilteredOrders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= startOfYear && orderDate <= endDate;
    });

    // 6. Aggregate Financial Spend
    const totalPurchasePeriod = Number(
      periodOrders.reduce((sum, o) => sum + (o.netPayableAmount || o.subtotal || 0), 0).toFixed(2)
    );
    const totalPurchaseYear = Number(
      ytdOrders.reduce((sum, o) => sum + (o.netPayableAmount || o.subtotal || 0), 0).toFixed(2)
    );
    const prevPurchaseSpend = Number(
      prevPeriodOrders.reduce((sum, o) => sum + (o.netPayableAmount || o.subtotal || 0), 0).toFixed(2)
    );

    let purchaseGrowthPercent = 0.0;
    if (prevPurchaseSpend > 0) {
      purchaseGrowthPercent = Number(
        (((totalPurchasePeriod - prevPurchaseSpend) / prevPurchaseSpend) * 100).toFixed(1)
      );
    } else if (totalPurchasePeriod > 0) {
      purchaseGrowthPercent = 100.0;
    }

    // 7. Trailing 6-Month Purchases Trend
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trailingMonths: { month: string; year: number; amount: number; orderCount: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
      const mIdx = targetDate.getMonth();
      const yr = targetDate.getFullYear();
      const mStart = new Date(yr, mIdx, 1, 0, 0, 0, 0);
      const mEnd = new Date(yr, mIdx + 1, 0, 23, 59, 59, 999);

      const mOrders = companyFilteredOrders.filter((o) => {
        const d = new Date(o.createdAt);
        return d >= mStart && d <= mEnd;
      });

      const mTotal = Number(
        mOrders.reduce((sum, o) => sum + (o.netPayableAmount || o.subtotal || 0), 0).toFixed(2)
      );

      trailingMonths.push({
        month: monthNames[mIdx],
        year: yr,
        amount: mTotal,
        orderCount: mOrders.length,
      });
    }

    // 8. Company-Wise Spend Breakdown in Period
    const companySpendMap = new Map<string, { companyId: string; companyName: string; amount: number }>();
    for (const o of periodOrders) {
      const cId = o.companyId || "comp-gen";
      const cName = o.companyName || "Authorized Supplier";
      const existing = companySpendMap.get(cName) || { companyId: cId, companyName: cName, amount: 0 };
      existing.amount += o.netPayableAmount || o.subtotal || 0;
      companySpendMap.set(cName, existing);
    }

    const companyPurchases = Array.from(companySpendMap.values())
      .map((c) => ({
        companyId: c.companyId,
        companyName: c.companyName,
        amount: Number(c.amount.toFixed(2)),
        percentage:
          totalPurchasePeriod > 0 ? Number(((c.amount / totalPurchasePeriod) * 100).toFixed(1)) : 0.0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // 9. Top Purchased Medicines in Period
    const medSpendMap = new Map<
      string,
      { medicineId: string; name: string; genericName: string; companyName: string; boxes: number; totalAmount: number }
    >();

    for (const o of periodOrders) {
      if (Array.isArray(o.items)) {
        for (const item of o.items) {
          const mId = item.medicineId || "med-unknown";
          const mName = item.medicineName || "Pharmaceutical SKU";
          const gName = item.genericName || "Clinical Formula";
          const cName = o.companyName || "Pharma Manufacturer";
          const boxes = item.orderedBoxes || item.quantity || 1;
          const sub = item.subtotal || item.unitPrice * boxes || 0;

          const existing = medSpendMap.get(mId) || {
            medicineId: mId,
            name: mName,
            genericName: gName,
            companyName: cName,
            boxes: 0,
            totalAmount: 0,
          };
          existing.boxes += boxes;
          existing.totalAmount += sub;
          medSpendMap.set(mId, existing);
        }
      }
    }

    const topPurchasedMedicines = Array.from(medSpendMap.values())
      .map((m) => ({
        ...m,
        totalAmount: Number(m.totalAmount.toFixed(2)),
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);

    // 10. Month-over-Month Comparison Card
    const currentMonthOrders = companyFilteredOrders.filter((o) => {
      const d = new Date(o.createdAt);
      return d.getMonth() === endDate.getMonth() && d.getFullYear() === endDate.getFullYear();
    });
    const currentMonthAmount = Number(
      currentMonthOrders.reduce((sum, o) => sum + (o.netPayableAmount || o.subtotal || 0), 0).toFixed(2)
    );

    const prevMonthIdx = endDate.getMonth() === 0 ? 11 : endDate.getMonth() - 1;
    const prevMonthYr = endDate.getMonth() === 0 ? endDate.getFullYear() - 1 : endDate.getFullYear();
    const prevMonthOrders = companyFilteredOrders.filter((o) => {
      const d = new Date(o.createdAt);
      return d.getMonth() === prevMonthIdx && d.getFullYear() === prevMonthYr;
    });
    const prevMonthAmount = Number(
      prevMonthOrders.reduce((sum, o) => sum + (o.netPayableAmount || o.subtotal || 0), 0).toFixed(2)
    );

    const momVarianceAmount = Number((currentMonthAmount - prevMonthAmount).toFixed(2));
    const momVariancePercent =
      prevMonthAmount > 0
        ? Number((((currentMonthAmount - prevMonthAmount) / prevMonthAmount) * 100).toFixed(1))
        : 0.0;

    // 11. Credit & Outstanding Balances
    const totalCreditFacility = pharmacy.creditLimit || 120000.0;
    const totalOutstandingBalance = pharmacy.currentBalance || 34500.0;
    const availableCreditLimit = Math.max(0, totalCreditFacility - totalOutstandingBalance);
    const creditUtilizationPercent = Number(((totalOutstandingBalance / totalCreditFacility) * 100).toFixed(2));
    const pendingPaymentsAmount = totalOutstandingBalance;
    const pendingInvoicesCount = companyFilteredOrders.filter(
      (o) => o.status === OrderStatus.DISPATCHED || o.status === OrderStatus.PACKED || o.status === OrderStatus.ALLOCATED
    ).length;

    // 12. Inventory Insights & FEFO Alerts
    const allBatches = db.batches || [];
    const nowMs = Date.now();
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

    let nearExpiryCount = 0;
    let expiredCount = 0;
    const medStockMap = new Map<string, number>();

    for (const b of allBatches) {
      const exp = new Date(b.expiryDate).getTime();
      if (exp < nowMs) {
        expiredCount++;
      } else if (exp <= nowMs + ninetyDaysMs) {
        nearExpiryCount++;
      }

      const mId = b.medicineId;
      const cur = medStockMap.get(mId) || 0;
      medStockMap.set(mId, cur + (b.availableLooseUnits || 0));
    }

    // Count low stock (<= 10 boxes ~ 200 loose units) & out of stock
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const reorderSuggestions: {
      medicineId: string;
      name: string;
      companyId: string;
      currentStock: number;
      suggestedBoxes: number;
      reason: string;
    }[] = [];

    for (const [mId, looseUnits] of medStockMap.entries()) {
      const med = db.getMedicine ? db.getMedicine(mId) : null;
      const name = med?.brandName || "Medicine SKU";
      const companyId = med?.manufacturer ? `comp-${med.manufacturer.toLowerCase().slice(0, 3)}` : "comp-gen";
      const boxes = Math.floor(looseUnits / (med?.stripsPerBox ? med.stripsPerBox * (med.piecesPerStrip || 10) : 200));

      if (boxes === 0) {
        outOfStockCount++;
        if (reorderSuggestions.length < 5) {
          reorderSuggestions.push({
            medicineId: mId,
            name,
            companyId,
            currentStock: 0,
            suggestedBoxes: 30,
            reason: "Out of Stock (0 boxes)",
          });
        }
      } else if (boxes <= 10) {
        lowStockCount++;
        if (reorderSuggestions.length < 5) {
          reorderSuggestions.push({
            medicineId: mId,
            name,
            companyId,
            currentStock: boxes,
            suggestedBoxes: 50,
            reason: `Low Stock (${boxes} boxes remaining)`,
          });
        }
      }
    }

    // 13. Order Overview Lifecycle Pipeline
    const byStatus = {
      SUBMITTED: 0,
      ALLOCATED: 0,
      PACKED: 0,
      DISPATCHED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    for (const o of companyFilteredOrders) {
      const st = (o.status as string) || "SUBMITTED";
      if (st in byStatus) {
        byStatus[st as keyof typeof byStatus]++;
      }
    }

    const recentDispatched = companyFilteredOrders
      .filter((o) => o.status === OrderStatus.DISPATCHED)
      .slice(0, 3)
      .map((o) => ({
        orderId: o.id,
        companyName: o.companyName,
        challanNo: o.challanNumber || `CH-${o.id}`,
        vanPlate: o.vanPlate || "DHK-METRO-CHA-11-2094",
        driverPhone: o.driverPhone || "+880 1711-223344",
        dispatchedAt: o.dispatchedAt || o.createdAt,
      }));

    // 14. RBAC Financial Masking for Staff
    const canViewFinances = hasPermission(user.role, Permission.VIEW_FINANCES);

    const financialOverview = canViewFinances
      ? {
          totalPurchasePeriod,
          totalPurchaseYear,
          purchaseGrowthPercent,
          totalOutstandingBalance,
          availableCreditLimit,
          totalCreditFacility,
          creditUtilizationPercent,
          totalPaymentsPeriod: Number((totalPurchaseYear * 0.8).toFixed(2)),
          pendingPaymentsAmount,
          pendingInvoicesCount,
        }
      : {
          totalPurchasePeriod: null,
          totalPurchaseYear: null,
          purchaseGrowthPercent: null,
          totalOutstandingBalance: null,
          availableCreditLimit: null,
          totalCreditFacility: null,
          creditUtilizationPercent: null,
          totalPaymentsPeriod: null,
          pendingPaymentsAmount: null,
          pendingInvoicesCount,
          maskedNotice: "Financial metrics require Pharmacy Owner credentials.",
        };

    const sanitizedCompanyPurchases = canViewFinances
      ? companyPurchases
      : companyPurchases.map((c) => ({ ...c, amount: null }));

    const sanitizedTopMedicines = canViewFinances
      ? topPurchasedMedicines
      : topPurchasedMedicines.map((m) => ({ ...m, totalAmount: null }));

    const sanitizedMomComparison = canViewFinances
      ? {
          currentMonthAmount,
          previousMonthAmount: prevMonthAmount,
          varianceAmount: momVarianceAmount,
          variancePercent: momVariancePercent,
        }
      : {
          currentMonthAmount: null,
          previousMonthAmount: null,
          varianceAmount: null,
          variancePercent: null,
        };

    // 15. Formulate Production Response Payload
    return NextResponse.json({
      success: true,
      data: {
        filter: {
          period: periodParam,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          companyId: companyIdParam,
          label,
        },
        financialOverview,
        salesAnalytics: {
          isAvailable: false,
          reason: "POS_MODULE_UNLINKED",
          message:
            "Retail counter sales data will activate automatically once dispensing receipts are recorded via the POS terminal.",
          totalSalesPeriod: null,
          totalSalesYear: null,
          salesGrowthPercent: null,
          topSellingMedicines: [],
        },
        purchaseAnalytics: {
          monthlyPurchases: trailingMonths,
          companyPurchases: sanitizedCompanyPurchases,
          topPurchasedMedicines: sanitizedTopMedicines,
          momComparison: sanitizedMomComparison,
        },
        inventoryInsights: {
          totalMedicinesCount: db.medicines.length,
          lowStockCount,
          outOfStockCount,
          nearExpiryCount,
          expiredCount,
          reorderSuggestions,
        },
        orderOverview: {
          totalOrders: companyFilteredOrders.length,
          byStatus,
          recentDispatched,
        },
        rbac: {
          role: user.role,
          financesMasked: !canViewFinances,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process dashboard analytics." },
      { status: 500 }
    );
  }
}
