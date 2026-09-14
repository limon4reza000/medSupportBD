"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  DosageForm,
  IBatch,
  IMedicine,
  IPharmacy,
  ITradeOffer,
  OrderStatus,
  PackagingUnit,
  PaymentStatus,
  TradeSchemeType,
  TransactionType,
  UserRole,
} from "@/types/domain";
import {
  initialMedicines,
  initialBatches,
  initialTradeOffers,
  initialPharmacies,
  initialLedgerEntries,
  LedgerEntry,
} from "@/lib/mockDb";
import { PackagingEngine } from "@/services/packagingEngine";

export interface CartItem {
  medicineId: string;
  orderedUnit: PackagingUnit;
  orderedQty: number;
}

export interface CalculatedCartItem extends CartItem {
  medicine: IMedicine;
  totalLoosePieces: number;
  bonusLooseUnits: number;
  bonusSummary: string;
  unitTradePrice: number;
  grossPrice: number;
  discountPercentage: number;
  discountAmount: number;
  vatAmount: number;
  netItemTotal: number;
  availableStockLooseUnits: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "ORDER" | "CREDIT" | "STOCK" | "OFFER" | "AI";
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface AppOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  pharmacyId: string;
  pharmacyName: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalItems: number;
  totalLoosePieces: number;
  totalBonusPieces: number;
  grossAmount: number;
  tradeDiscountAmount: number;
  vatAmount: number;
  netPayableAmount: number;
  expectedDelivery: string;
  assignedSalesRep: string;
  items: {
    medicineId: string;
    brandName: string;
    genericName: string;
    orderedQty: number;
    orderedUnit: PackagingUnit;
    looseUnitsBilled: number;
    bonusLooseUnits: number;
    netItemTotal: number;
    batches: {
      batchNumber: string;
      piecesAllocated: number;
      expiryDate: string;
    }[];
  }[];
}

interface AppContextType {
  // Master Entities
  medicines: IMedicine[];
  batches: IBatch[];
  offers: ITradeOffer[];
  pharmacies: IPharmacy[];
  selectedPharmacyId: string;
  currentPharmacy: IPharmacy;
  orders: AppOrder[];
  ledgerEntries: LedgerEntry[];
  notifications: AppNotification[];
  currentUser: {
    name: string;
    role: UserRole;
    email: string;
    avatar: string;
  };

  // Cart State & Calculations
  cart: CartItem[];
  calculatedCart: CalculatedCartItem[];
  cartItemCount: number;
  cartTotalAmount: number;
  cartTotalBonusPieces: number;
  remainingCreditAfterCart: number;
  isCreditSufficient: boolean;

  // Modals & Navigation
  isSearchOpen: boolean;
  isQuickOrderOpen: boolean;
  isMobileNavOpen: boolean;

  // Actions
  setSelectedPharmacyId: (id: string) => void;
  addToCart: (item: CartItem) => void;
  updateCartQty: (medicineId: string, qty: number, unit?: PackagingUnit) => void;
  removeFromCart: (medicineId: string) => void;
  clearCart: () => void;
  checkout: (deliveryNotes?: string) => Promise<{ success: boolean; order?: AppOrder; error?: string }>;
  setIsSearchOpen: (open: boolean) => void;
  setIsQuickOrderOpen: (open: boolean) => void;
  setIsMobileNavOpen: (open: boolean) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  refreshData: () => Promise<void>;
  setCurrentUserRole: (role: UserRole) => void;
  updateUserAvatar: (avatarUrl: string) => void;
  updateUserProfile: (data: Partial<{ name: string; email: string; avatar: string }>) => void;
}

const initialOrdersSeed: AppOrder[] = [
  {
    id: "ord-901",
    orderNumber: "ORD-2026-0914-01",
    orderDate: "2026-09-14T10:15:00Z",
    pharmacyId: "pharm-01",
    pharmacyName: "Green Care Pharmacy & Med Store",
    status: OrderStatus.PROCESSING,
    paymentStatus: PaymentStatus.UNPAID,
    totalItems: 2,
    totalLoosePieces: 2100,
    totalBonusPieces: 200,
    grossAmount: 5145.00,
    tradeDiscountAmount: 0,
    vatAmount: 123.48,
    netPayableAmount: 5268.48,
    expectedDelivery: "Today, 4:30 PM",
    assignedSalesRep: "Tariqul Anam (SR-104)",
    items: [
      {
        medicineId: "med-01",
        brandName: "Napa Extra",
        genericName: "Paracetamol + Caffeine",
        orderedQty: 10,
        orderedUnit: PackagingUnit.BOX,
        looseUnitsBilled: 2000,
        bonusLooseUnits: 200,
        netItemTotal: 5017.60,
        batches: [
          { batchNumber: "BN-2024-NAPA-01", piecesAllocated: 450, expiryDate: "2026-11-30" },
          { batchNumber: "BN-2025-NAPA-02", piecesAllocated: 1750, expiryDate: "2027-06-30" }
        ]
      },
      {
        medicineId: "med-03",
        brandName: "Seclo 20",
        genericName: "Omeprazole",
        orderedQty: 1,
        orderedUnit: PackagingUnit.BOX,
        looseUnitsBilled: 100,
        bonusLooseUnits: 0,
        netItemTotal: 501.76,
        batches: [
          { batchNumber: "BN-2024-SEC-03", piecesAllocated: 100, expiryDate: "2026-10-31" }
        ]
      }
    ]
  },
  {
    id: "ord-889",
    orderNumber: "ORD-2026-0910-03",
    orderDate: "2026-09-10T14:40:00Z",
    pharmacyId: "pharm-01",
    pharmacyName: "Green Care Pharmacy & Med Store",
    status: OrderStatus.DELIVERED,
    paymentStatus: PaymentStatus.PAID,
    totalItems: 3,
    totalLoosePieces: 3200,
    totalBonusPieces: 100,
    grossAmount: 18500.00,
    tradeDiscountAmount: 925.00,
    vatAmount: 421.80,
    netPayableAmount: 17996.80,
    expectedDelivery: "2026-09-11 (Delivered)",
    assignedSalesRep: "Tariqul Anam (SR-104)",
    items: [
      {
        medicineId: "med-02",
        brandName: "Ace Plus",
        genericName: "Paracetamol + Caffeine",
        orderedQty: 8,
        orderedUnit: PackagingUnit.BOX,
        looseUnitsBilled: 1600,
        bonusLooseUnits: 0,
        netItemTotal: 3920.00,
        batches: [{ batchNumber: "BN-2024-ACE-08", piecesAllocated: 1600, expiryDate: "2026-12-15" }]
      }
    ]
  }
];

const initialNotificationsSeed: AppNotification[] = [
  {
    id: "notif-1",
    title: "Order Dispatched",
    message: "Order #ORD-2026-0914-01 has been dispatched from Dhaka Central Depot.",
    type: "ORDER",
    timestamp: "10 mins ago",
    isRead: false,
    link: "/my-orders"
  },
  {
    id: "notif-2",
    title: "Trade Offer Activated",
    message: "New 10+1 Free scheme activated for Napa Extra (500mg+65mg).",
    type: "OFFER",
    timestamp: "1 hour ago",
    isRead: false,
    link: "/trade-offers"
  },
  {
    id: "notif-3",
    title: "AI Demand Warning",
    message: "Zimax 500 stockout predicted within 3.6 days. Reorder suggested.",
    type: "AI",
    timestamp: "3 hours ago",
    isRead: false,
    link: "/ai-insights"
  },
  {
    id: "notif-4",
    title: "Payment Received",
    message: "৳20,000 payment via bKash Merchant settled. Available credit updated.",
    type: "CREDIT",
    timestamp: "Yesterday",
    isRead: true,
    link: "/credit"
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [medicines, setMedicines] = useState<IMedicine[]>(initialMedicines);
  const [batches, setBatches] = useState<IBatch[]>(initialBatches);
  const [offers, setOffers] = useState<ITradeOffer[]>(initialTradeOffers);
  const [pharmacies, setPharmacies] = useState<IPharmacy[]>(initialPharmacies);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>("pharm-01");
  const [orders, setOrders] = useState<AppOrder[]>(initialOrdersSeed);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(initialLedgerEntries);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotificationsSeed);

  const [cart, setCart] = useState<CartItem[]>([
    { medicineId: "med-01", orderedUnit: PackagingUnit.BOX, orderedQty: 5 },
    { medicineId: "med-03", orderedUnit: PackagingUnit.STRIP, orderedQty: 25 },
  ]);

  const [currentUser, setCurrentUser] = useState({
    name: "Dr. Rafiqul Islam",
    role: UserRole.PHARMACY_OWNER,
    email: "greencare.pharm@gmail.com",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Sync with API routes on mount
  const refreshData = async () => {
    try {
      const [medRes, pharmRes, ledgRes] = await Promise.all([
        fetch("/api/medicines").catch(() => null),
        fetch("/api/pharmacies").catch(() => null),
        fetch(`/api/ledger?pharmacyId=${selectedPharmacyId}`).catch(() => null),
      ]);

      if (medRes && medRes.ok) {
        const medData = await medRes.json();
        setMedicines(medData);
        const allBatches = medData.flatMap((m: any) => m.batches || []);
        if (allBatches.length > 0) setBatches(allBatches);
      }

      if (pharmRes && pharmRes.ok) {
        const pharmData = await pharmRes.json();
        setPharmacies(pharmData);
      }

      if (ledgRes && ledgRes.ok) {
        const ledgData = await ledgRes.json();
        if (ledgData.ledgerEntries) setLedgerEntries(ledgData.ledgerEntries);
      }
    } catch (e) {
      console.error("Failed to fetch fresh data:", e);
    }
  };

  useEffect(() => {
    refreshData();
  }, [selectedPharmacyId]);

  const currentPharmacy =
    pharmacies.find((p) => p.id === selectedPharmacyId) || pharmacies[0];

  // Calculate cart dynamically
  const calculatedCart: CalculatedCartItem[] = cart
    .map((item) => {
      const medicine = medicines.find((m) => m.id === item.medicineId);
      if (!medicine) return null;

      const offer = offers.find((o) => o.medicineId === medicine.id && o.isActive);
      const calcResult = PackagingEngine.calculateTradePricing(medicine, item.orderedUnit, item.orderedQty, offer);

      const medBatches = batches.filter((b) => b.medicineId === medicine.id);
      const availableStockLooseUnits = medBatches.reduce((acc, b) => acc + b.availableLooseUnits, 0);

      return {
        ...item,
        medicine,
        totalLoosePieces: calcResult.looseUnitsBilled,
        bonusLooseUnits: calcResult.bonusLooseUnits,
        bonusSummary: calcResult.bonusSummary,
        unitTradePrice: calcResult.unitTradePrice,
        grossPrice: calcResult.grossPrice,
        discountPercentage: calcResult.discountPercentage,
        discountAmount: calcResult.discountAmount,
        vatAmount: calcResult.vatAmount,
        netItemTotal: calcResult.netItemTotal,
        availableStockLooseUnits,
      };
    })
    .filter((item): item is CalculatedCartItem => item !== null);

  const cartItemCount = cart.reduce((acc, item) => acc + item.orderedQty, 0);
  const cartTotalAmount = calculatedCart.reduce((acc, item) => acc + item.netItemTotal, 0);
  const cartTotalBonusPieces = calculatedCart.reduce((acc, item) => acc + item.bonusLooseUnits, 0);

  const availableCredit = Math.max(0, currentPharmacy.creditLimit - currentPharmacy.currentBalance);
  const remainingCreditAfterCart = availableCredit - cartTotalAmount;
  const isCreditSufficient = remainingCreditAfterCart >= 0 && !currentPharmacy.isCreditBlocked;

  // Cart operations
  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.medicineId === newItem.medicineId && i.orderedUnit === newItem.orderedUnit
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].orderedQty += newItem.orderedQty;
        return updated;
      }
      return [...prev, newItem];
    });
  };

  const updateCartQty = (medicineId: string, qty: number, unit?: PackagingUnit) => {
    setCart((prev) => {
      if (qty <= 0) {
        return prev.filter((i) => i.medicineId !== medicineId);
      }
      return prev.map((item) => {
        if (item.medicineId === medicineId) {
          return {
            ...item,
            orderedQty: qty,
            orderedUnit: unit || item.orderedUnit,
          };
        }
        return item;
      });
    });
  };

  const removeFromCart = (medicineId: string) => {
    setCart((prev) => prev.filter((i) => i.medicineId !== medicineId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Notification methods
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const updateUserAvatar = (avatarUrl: string) => {
    setCurrentUser((prev) => ({ ...prev, avatar: avatarUrl }));
  };

  const updateUserProfile = (data: Partial<{ name: string; email: string; avatar: string }>) => {
    setCurrentUser((prev) => ({ ...prev, ...data }));
  };

  const setCurrentUserRole = (role: UserRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      role,
      name:
        role === UserRole.PHARMACY_OWNER
          ? "Dr. Rafiqul Islam (Pharmacy Owner)"
          : role === UserRole.SALES_REP
          ? "Tariqul Anam (SR/MPO)"
          : role === UserRole.DEPOT_MANAGER
          ? "Kamrul Hasan (Depot Manager)"
          : "System Administrator",
    }));
  };

  // Checkout action
  const checkout = async (deliveryNotes?: string): Promise<{ success: boolean; order?: AppOrder; error?: string }> => {
    if (cart.length === 0) {
      return { success: false, error: "Cart is empty." };
    }

    try {
      const payload = {
        pharmacyId: selectedPharmacyId,
        depotId: currentPharmacy.depotId,
        salesRepId: currentPharmacy.salesRepId || "user-sr-01",
        items: cart.map((c) => ({
          medicineId: c.medicineId,
          orderedUnit: c.orderedUnit,
          orderedQty: c.orderedQty,
        })),
        deliveryNotes,
      };

      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error?.message || "Checkout failed. Please review stock or credit balance.",
        };
      }

      // Create new AppOrder record in local state
      const checkoutData = data.data;
      const newOrder: AppOrder = {
        id: checkoutData.orderId,
        orderNumber: checkoutData.orderNumber,
        orderDate: new Date().toISOString(),
        pharmacyId: currentPharmacy.id,
        pharmacyName: currentPharmacy.tradeName,
        status: OrderStatus.PROCESSING,
        paymentStatus: PaymentStatus.UNPAID,
        totalItems: checkoutData.totalItems,
        totalLoosePieces: checkoutData.totalLoosePieces,
        totalBonusPieces: checkoutData.totalBonusPieces,
        grossAmount: checkoutData.grossAmount,
        tradeDiscountAmount: checkoutData.tradeDiscountAmount,
        vatAmount: checkoutData.vatAmount,
        netPayableAmount: checkoutData.netPayableAmount,
        expectedDelivery: "Tomorrow, 11:00 AM",
        assignedSalesRep: "Tariqul Anam (SR-104)",
        items: checkoutData.allocatedItems.map((ai: any) => ({
          medicineId: ai.medicineId,
          brandName: ai.brandName,
          genericName: medicines.find((m) => m.id === ai.medicineId)?.genericName || "",
          orderedQty: ai.orderedQty,
          orderedUnit: ai.orderedUnit,
          looseUnitsBilled: ai.looseUnitsBilled,
          bonusLooseUnits: ai.bonusLooseUnits,
          netItemTotal: ai.netItemTotal,
          batches: ai.batchBreakdown.map((b: any) => ({
            batchNumber: b.batchNumber,
            piecesAllocated: b.piecesAllocated,
            expiryDate: typeof b.expiryDate === "string" ? b.expiryDate : new Date(b.expiryDate).toISOString().split("T")[0],
          })),
        })),
      };

      setOrders((prev) => [newOrder, ...prev]);

      // Add Notification
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: "Order Placed Successfully",
          message: `Order #${newOrder.orderNumber} for ৳${newOrder.netPayableAmount.toLocaleString()} has been cut and sent for FEFO batch allocation.`,
          type: "ORDER",
          timestamp: "Just now",
          isRead: false,
          link: `/orders/${newOrder.id}`,
        },
        ...prev,
      ]);

      clearCart();
      await refreshData();

      return { success: true, order: newOrder };
    } catch (err: any) {
      console.error("Checkout error:", err);
      return { success: false, error: err.message || "Network error occurred." };
    }
  };

  return (
    <AppContext.Provider
      value={{
        medicines,
        batches,
        offers,
        pharmacies,
        selectedPharmacyId,
        currentPharmacy,
        orders,
        ledgerEntries,
        notifications,
        currentUser,
        cart,
        calculatedCart,
        cartItemCount,
        cartTotalAmount,
        cartTotalBonusPieces,
        remainingCreditAfterCart,
        isCreditSufficient,
        isSearchOpen,
        isQuickOrderOpen,
        isMobileNavOpen,
        setSelectedPharmacyId,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        checkout,
        setIsSearchOpen,
        setIsQuickOrderOpen,
        setIsMobileNavOpen,
        markNotificationRead,
        markAllNotificationsRead,
        refreshData,
        setCurrentUserRole,
        updateUserAvatar,
        updateUserProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
