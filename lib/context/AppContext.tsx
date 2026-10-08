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
  ICompany,
  ICustomer,
  ICustomerPayment,
  IPosSale,
  IDailyClosing,
  IDistributorOrder,
  IEmployee,
  IAttendanceRecord,
  ISalaryRecord,
  ILeaveRequest,
  IExpense,
  IMrVisit,
  IMrTarget,
} from "@/types/domain";
import {
  initialMedicines,
  initialBatches,
  initialTradeOffers,
  initialPharmacies,
  initialLedgerEntries,
  initialCompanies,
  initialCustomers,
  initialCustomerPayments,
  initialPosSales,
  initialDistributorOrders,
  initialEmployees,
  initialAttendance,
  initialSalaryRecords,
  initialLeaveRequests,
  initialExpenses,
  initialMrVisits,
  initialMrTarget,
  LedgerEntry,
} from "@/lib/data/clientSeed";
import { PackagingEngine } from "@/services/packagingEngine";
import { Language } from "@/lib/i18n";

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
  type: "ORDER" | "CREDIT" | "STOCK" | "OFFER" | "AI" | "EXPIRY" | "DUE" | "LEAVE" | "POS";
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

  // 1. POS & Retail
  posSales: IPosSale[];
  dailyClosings: IDailyClosing[];
  recordPosSale: (saleData: Omit<IPosSale, "id" | "invoiceNo" | "date">) => IPosSale;
  recordDailyClosing: (closingData: Omit<IDailyClosing, "id" | "closedAt">) => IDailyClosing;

  // 2. Medicine & Batches
  addMedicine: (medicine: IMedicine) => void;
  updateMedicine: (id: string, data: Partial<IMedicine>) => void;
  addBatch: (batch: IBatch) => void;
  adjustStock: (batchId: string, adjustmentPieces: number, reason: string) => void;

  // 3. Companies & Distributor Orders
  companies: ICompany[];
  distributorOrders: IDistributorOrder[];
  createDistributorOrder: (
    order: Omit<IDistributorOrder, "id" | "poNumber" | "orderDate" | "status" | "paymentStatus" | "paidAmount">
  ) => IDistributorOrder;
  updateDistributorOrderStatus: (
    orderId: string,
    status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED"
  ) => void;
  recordCompanyPayment: (companyId: string, amount: number, paymentMethod: string, notes?: string) => void;

  // 4. Employees & Attendance & Payroll
  employees: IEmployee[];
  attendance: IAttendanceRecord[];
  salaryRecords: ISalaryRecord[];
  leaveRequests: ILeaveRequest[];
  addEmployee: (employee: Omit<IEmployee, "id">) => void;
  updateEmployee: (id: string, data: Partial<IEmployee>) => void;
  markAttendance: (record: Omit<IAttendanceRecord, "id">) => void;
  recordSalaryPayment: (salary: Omit<ISalaryRecord, "id" | "status" | "paymentDate">) => void;
  submitLeaveRequest: (req: Omit<ILeaveRequest, "id" | "status" | "requestedDate">) => void;
  updateLeaveRequestStatus: (id: string, status: "APPROVED" | "REJECTED", reviewerNotes?: string) => void;

  // 5. Customer Due Ledger
  customers: ICustomer[];
  customerPayments: ICustomerPayment[];
  recordCustomerPayment: (payment: Omit<ICustomerPayment, "id" | "date">) => void;

  // 6. Expenses
  expenses: IExpense[];
  addExpense: (expense: Omit<IExpense, "id">) => void;
  deleteExpense: (id: string) => void;

  // 7. MR Portal
  mrVisits: IMrVisit[];
  mrTarget: IMrTarget;
  addMrVisit: (visit: Omit<IMrVisit, "id">) => void;
  updateMrTarget: (data: Partial<IMrTarget>) => void;

  // 8. B2B Cart State & Calculations
  cart: CartItem[];
  calculatedCart: CalculatedCartItem[];
  cartItemCount: number;
  cartTotalAmount: number;
  cartTotalBonusPieces: number;
  remainingCreditAfterCart: number;
  isCreditSufficient: boolean;

  // Extras & UI
  language: Language;
  setLanguage: (lang: Language) => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  offlineQueueCount: number;
  syncOfflineQueue: () => void;
  backupDatabase: () => string;
  restoreDatabase: (jsonStr: string) => boolean;
  resetDatabaseToDemo: () => void;

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
    grossAmount: 5145.0,
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
        netItemTotal: 5017.6,
        batches: [
          { batchNumber: "BN-2024-NAPA-01", piecesAllocated: 450, expiryDate: "2026-11-30" },
          { batchNumber: "BN-2025-NAPA-02", piecesAllocated: 1750, expiryDate: "2027-06-30" },
        ],
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
          { batchNumber: "BN-2024-SEC-03", piecesAllocated: 100, expiryDate: "2026-10-31" },
        ],
      },
    ],
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
    grossAmount: 18500.0,
    tradeDiscountAmount: 925.0,
    vatAmount: 421.8,
    netPayableAmount: 17996.8,
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
        netItemTotal: 3920.0,
        batches: [{ batchNumber: "BN-2024-ACE-08", piecesAllocated: 1600, expiryDate: "2026-12-15" }],
      },
    ],
  },
];

const initialNotificationsSeed: AppNotification[] = [
  {
    id: "notif-1",
    title: "Near Expiry Alert",
    message: "Napa Extra Batch BN-2024-NAPA-01 expires in 53 days. Prioritize dispensing.",
    type: "EXPIRY",
    timestamp: "10 mins ago",
    isRead: false,
    link: "/inventory/batches",
  },
  {
    id: "notif-2",
    title: "Low Stock Warning",
    message: "Zimax 500 has only 120 pieces remaining. Reorder suggested.",
    type: "STOCK",
    timestamp: "1 hour ago",
    isRead: false,
    link: "/inventory",
  },
  {
    id: "notif-3",
    title: "Customer Due Reminder",
    message: "Al-Amin Hossain has an outstanding balance of ৳8,400 overdue.",
    type: "DUE",
    timestamp: "3 hours ago",
    isRead: false,
    link: "/customer-due",
  },
  {
    id: "notif-4",
    title: "Leave Request Submitted",
    message: "Habibur Rahman submitted a sick leave request for Oct 12-13.",
    type: "LEAVE",
    timestamp: "5 hours ago",
    isRead: false,
    link: "/employees",
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Master Entities
  const [medicines, setMedicines] = useState<IMedicine[]>(initialMedicines);
  const [batches, setBatches] = useState<IBatch[]>(initialBatches);
  const [offers, setOffers] = useState<ITradeOffer[]>(initialTradeOffers);
  const [pharmacies, setPharmacies] = useState<IPharmacy[]>(initialPharmacies);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>("pharm-01");
  const [orders, setOrders] = useState<AppOrder[]>(initialOrdersSeed);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(initialLedgerEntries);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotificationsSeed);

  // New Domain Entities
  const [companies, setCompanies] = useState<ICompany[]>(initialCompanies);
  const [customers, setCustomers] = useState<ICustomer[]>(initialCustomers);
  const [customerPayments, setCustomerPayments] = useState<ICustomerPayment[]>(initialCustomerPayments);
  const [posSales, setPosSales] = useState<IPosSale[]>(initialPosSales);
  const [dailyClosings, setDailyClosings] = useState<IDailyClosing[]>([]);
  const [distributorOrders, setDistributorOrders] = useState<IDistributorOrder[]>(initialDistributorOrders);
  const [employees, setEmployees] = useState<IEmployee[]>(initialEmployees);
  const [attendance, setAttendance] = useState<IAttendanceRecord[]>(initialAttendance);
  const [salaryRecords, setSalaryRecords] = useState<ISalaryRecord[]>(initialSalaryRecords);
  const [leaveRequests, setLeaveRequests] = useState<ILeaveRequest[]>(initialLeaveRequests);
  const [expenses, setExpenses] = useState<IExpense[]>(initialExpenses);
  const [mrVisits, setMrVisits] = useState<IMrVisit[]>(initialMrVisits);
  const [mrTarget, setMrTarget] = useState<IMrTarget>(initialMrTarget);

  // System & Extra State
  const [language, setLanguage] = useState<Language>("en");
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  // Current User Profile
  const [currentUser, setCurrentUser] = useState({
    name: "Dr. Rafiqul Islam",
    role: UserRole.PHARMACY_OWNER,
    email: "rafiqul.pharma@gmail.com",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
  });

  // Cart State (B2B Procurement)
  const [cart, setCart] = useState<CartItem[]>([
    { medicineId: "med-01", orderedUnit: PackagingUnit.BOX, orderedQty: 2 },
  ]);

  // Modals & Navigation
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // LocalStorage Hydration
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const savedLang = localStorage.getItem("medsupply_lang") as Language;
        if (savedLang) setLanguage(savedLang);

        const savedSales = localStorage.getItem("medsupply_pos_sales");
        if (savedSales) setPosSales(JSON.parse(savedSales));

        const savedCustomers = localStorage.getItem("medsupply_customers");
        if (savedCustomers) setCustomers(JSON.parse(savedCustomers));

        const savedExpenses = localStorage.getItem("medsupply_expenses");
        if (savedExpenses) setExpenses(JSON.parse(savedExpenses));

        const savedAttendance = localStorage.getItem("medsupply_attendance");
        if (savedAttendance) setAttendance(JSON.parse(savedAttendance));

        const savedDistOrders = localStorage.getItem("medsupply_dist_orders");
        if (savedDistOrders) setDistributorOrders(JSON.parse(savedDistOrders));
      }
    } catch (e) {
      console.warn("LocalStorage hydration error:", e);
    }
  }, []);

  // Save on state updates
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("medsupply_lang", language);
        localStorage.setItem("medsupply_pos_sales", JSON.stringify(posSales));
        localStorage.setItem("medsupply_customers", JSON.stringify(customers));
        localStorage.setItem("medsupply_expenses", JSON.stringify(expenses));
        localStorage.setItem("medsupply_attendance", JSON.stringify(attendance));
        localStorage.setItem("medsupply_dist_orders", JSON.stringify(distributorOrders));
      }
    } catch (e) {
      // Storage full or private mode
    }
  }, [language, posSales, customers, expenses, attendance, distributorOrders]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Current Pharmacy
  const currentPharmacy =
    pharmacies.find((p) => p.id === selectedPharmacyId) || pharmacies[0] || initialPharmacies[0];

  // Calculated B2B Cart
  const calculatedCart: CalculatedCartItem[] = cart
    .map((item) => {
      const med = medicines.find((m) => m.id === item.medicineId);
      if (!med) return null;

      const calc = PackagingEngine.calculateTradePricing({
        medicine: med,
        orderedUnit: item.orderedUnit,
        orderedQty: item.orderedQty,
        availableOffers: offers,
      });

      const medBatches = batches.filter((b) => b.medicineId === med.id);
      const stock = medBatches.reduce((acc, b) => acc + b.availableLooseUnits, 0);

      return {
        ...item,
        medicine: med,
        totalLoosePieces: calc.looseUnitsBilled + calc.bonusLooseUnits,
        bonusLooseUnits: calc.bonusLooseUnits,
        bonusSummary: calc.bonusSummary,
        unitTradePrice: calc.unitTradePrice,
        grossPrice: calc.grossPrice,
        discountPercentage: calc.discountPercentage,
        discountAmount: calc.discountAmount,
        vatAmount: calc.vatAmount,
        netItemTotal: calc.netItemTotal,
        availableStockLooseUnits: stock,
      };
    })
    .filter(Boolean) as CalculatedCartItem[];

  const cartItemCount = cart.reduce((acc, c) => acc + c.orderedQty, 0);
  const cartTotalAmount = calculatedCart.reduce((acc, c) => acc + c.netItemTotal, 0);
  const cartTotalBonusPieces = calculatedCart.reduce((acc, c) => acc + c.bonusLooseUnits, 0);
  const remainingCreditAfterCart =
    currentPharmacy.creditLimit - (currentPharmacy.currentBalance + cartTotalAmount);
  const isCreditSufficient = remainingCreditAfterCart >= 0;

  // ---------------------------------------------------------------------------
  // 1. POS ACTION: RECORD DAILY SALE & AUTO STOCK REDUCTION
  // ---------------------------------------------------------------------------
  const recordPosSale = (saleData: Omit<IPosSale, "id" | "invoiceNo" | "date">): IPosSale => {
    const saleId = `pos-sale-${Date.now()}`;
    const dateStr = new Date().toISOString();
    const invoiceNo = `POS-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(
      posSales.length + 1
    ).padStart(3, "0")}`;

    const newSale: IPosSale = {
      ...saleData,
      id: saleId,
      invoiceNo,
      date: dateStr,
    };

    // Auto-stock reduction: Deduct looseUnits from batches (FEFO)
    setBatches((prevBatches) => {
      const updated = [...prevBatches];
      newSale.items.forEach((item) => {
        let remainingPiecesToDeduct = item.looseUnits;
        const matchingBatches = updated
          .filter((b) => b.medicineId === item.medicineId && b.availableLooseUnits > 0)
          .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

        for (const b of matchingBatches) {
          if (remainingPiecesToDeduct <= 0) break;
          const deduct = Math.min(b.availableLooseUnits, remainingPiecesToDeduct);
          b.availableLooseUnits -= deduct;
          remainingPiecesToDeduct -= deduct;
        }
      });
      return updated;
    });

    // Handle Customer Due: If there is due amount, update customer due ledger
    if (newSale.dueAmount > 0 && newSale.customerPhone) {
      setCustomers((prevCusts) => {
        const existing = prevCusts.find((c) => c.phone.trim() === newSale.customerPhone.trim());
        if (existing) {
          return prevCusts.map((c) =>
            c.id === existing.id
              ? {
                  ...c,
                  name: newSale.customerName || c.name,
                  totalCreditPurchases: c.totalCreditPurchases + newSale.dueAmount,
                  currentDue: c.currentDue + newSale.dueAmount,
                  lastPurchaseDate: dateStr,
                }
              : c
          );
        } else {
          const newCust: ICustomer = {
            id: `cust-${Date.now()}`,
            name: newSale.customerName || "Customer " + newSale.customerPhone,
            phone: newSale.customerPhone,
            address: newSale.customerAddress || "",
            totalCreditPurchases: newSale.dueAmount,
            totalPaid: 0,
            currentDue: newSale.dueAmount,
            lastPurchaseDate: dateStr,
            createdAt: dateStr,
          };
          return [newCust, ...prevCusts];
        }
      });
    }

    setPosSales((prev) => [newSale, ...prev]);

    // Push notification for the sale
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "Daily POS Sale Completed",
        message: `Invoice #${invoiceNo} for ৳${newSale.netTotal.toFixed(
          2
        )} completed via ${newSale.paymentMethod}.${
          newSale.dueAmount > 0 ? ` (Due: ৳${newSale.dueAmount.toFixed(2)})` : ""
        }`,
        type: "POS",
        timestamp: "Just now",
        isRead: false,
        link: "/pos",
      },
      ...prev,
    ]);

    // Offline queueing if disconnected
    if (!isOnline) {
      setOfflineQueue((q) => [...q, { type: "POS_SALE", data: newSale }]);
    }

    return newSale;
  };

  // ---------------------------------------------------------------------------
  // DAILY CLOSING REPORT
  // ---------------------------------------------------------------------------
  const recordDailyClosing = (closingData: Omit<IDailyClosing, "id" | "closedAt">): IDailyClosing => {
    const newClosing: IDailyClosing = {
      ...closingData,
      id: `close-${Date.now()}`,
      closedAt: new Date().toISOString(),
    };
    setDailyClosings((prev) => [newClosing, ...prev]);
    return newClosing;
  };

  // ---------------------------------------------------------------------------
  // 2. MEDICINE & BATCH ACTIONS
  // ---------------------------------------------------------------------------
  const addMedicine = (medicine: IMedicine) => {
    setMedicines((prev) => [medicine, ...prev]);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "Medicine Catalog Updated",
        message: `${medicine.brandName} (${medicine.genericName}) was added to catalog.`,
        type: "STOCK",
        timestamp: "Just now",
        isRead: false,
        link: "/inventory",
      },
      ...prev,
    ]);
  };

  const updateMedicine = (id: string, data: Partial<IMedicine>) => {
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
  };

  const addBatch = (batch: IBatch) => {
    setBatches((prev) => [batch, ...prev]);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "New Batch Inwarded",
        message: `Batch ${batch.batchNumber} added with ${batch.availableLooseUnits} pieces.`,
        type: "STOCK",
        timestamp: "Just now",
        isRead: false,
        link: "/inventory/batches",
      },
      ...prev,
    ]);
  };

  const adjustStock = (batchId: string, adjustmentPieces: number, reason: string) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? { ...b, availableLooseUnits: Math.max(0, b.availableLooseUnits + adjustmentPieces) }
          : b
      )
    );
  };

  // ---------------------------------------------------------------------------
  // 3. DISTRIBUTOR / COMPANY ORDERS ACTIONS
  // ---------------------------------------------------------------------------
  const createDistributorOrder = (
    order: Omit<IDistributorOrder, "id" | "poNumber" | "orderDate" | "status" | "paymentStatus" | "paidAmount">
  ): IDistributorOrder => {
    const poNumber = `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(
      distributorOrders.length + 1
    ).padStart(3, "0")}`;
    const newOrder: IDistributorOrder = {
      ...order,
      id: `dist-po-${Date.now()}`,
      poNumber,
      orderDate: new Date().toISOString(),
      status: "PENDING",
      paymentStatus: "UNPAID",
      paidAmount: 0,
    };

    setDistributorOrders((prev) => [newOrder, ...prev]);

    // Increase company due balance
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === newOrder.companyId ? { ...c, dueBalance: c.dueBalance + newOrder.totalAmount } : c
      )
    );

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "Purchase Order Created",
        message: `Order #${poNumber} for ${newOrder.companyName} created (৳${newOrder.totalAmount.toLocaleString()}).`,
        type: "ORDER",
        timestamp: "Just now",
        isRead: false,
        link: "/distributor-orders",
      },
      ...prev,
    ]);

    return newOrder;
  };

  const updateDistributorOrderStatus = (
    orderId: string,
    status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED"
  ) => {
    setDistributorOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const updated = { ...o, status };
        if (status === "DELIVERED") {
          updated.deliveredDate = new Date().toISOString();
          // Auto intake items into stock!
          o.items.forEach((item) => {
            const med = medicines.find((m) => m.id === item.medicineId);
            const boxPieces = med ? med.piecesPerStrip * med.stripsPerBox : 100;
            const pieces =
              item.unit === PackagingUnit.BOX
                ? item.orderedQty * boxPieces
                : item.unit === PackagingUnit.STRIP
                ? item.orderedQty * (med?.piecesPerStrip || 10)
                : item.orderedQty;

            const newBatch: IBatch = {
              id: `batch-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              batchNumber: `BN-${new Date().getFullYear()}-${item.brandName
                .slice(0, 4)
                .toUpperCase()}-${Math.floor(Math.random() * 90 + 10)}`,
              medicineId: item.medicineId,
              depotId: "depot-dhk-01",
              manufacturingDate: new Date().toISOString().slice(0, 10),
              expiryDate: new Date(Date.now() + 730 * 24 * 3600 * 1000).toISOString().slice(0, 10),
              initialLooseUnits: pieces,
              availableLooseUnits: pieces,
              reservedLooseUnits: 0,
              costPricePerPiece: med?.tradePricePerPiece || 2.5,
              mrpPerPiece: med?.mrpPerPiece || 3.0,
            };
            addBatch(newBatch);
          });
        }
        return updated;
      })
    );
  };

  const recordCompanyPayment = (
    companyId: string,
    amount: number,
    paymentMethod: string,
    notes?: string
  ) => {
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId ? { ...c, dueBalance: Math.max(0, c.dueBalance - amount) } : c
      )
    );
  };

  // ---------------------------------------------------------------------------
  // 4. EMPLOYEE MANAGEMENT ACTIONS
  // ---------------------------------------------------------------------------
  const addEmployee = (empData: Omit<IEmployee, "id">) => {
    const newEmp: IEmployee = {
      ...empData,
      id: `emp-${Date.now()}`,
    };
    setEmployees((prev) => [newEmp, ...prev]);
  };

  const updateEmployee = (id: string, data: Partial<IEmployee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
  };

  const markAttendance = (record: Omit<IAttendanceRecord, "id">) => {
    setAttendance((prev) => {
      const filtered = prev.filter(
        (a) => !(a.employeeId === record.employeeId && a.date === record.date)
      );
      return [{ ...record, id: `att-${Date.now()}` }, ...filtered];
    });
  };

  const recordSalaryPayment = (salaryData: Omit<ISalaryRecord, "id" | "status" | "paymentDate">) => {
    const newSal: ISalaryRecord = {
      ...salaryData,
      id: `sal-${Date.now()}`,
      status: "PAID",
      paymentDate: new Date().toISOString().slice(0, 10),
    };
    setSalaryRecords((prev) => [newSal, ...prev]);
    // Also record an operating expense automatically
    addExpense({
      date: newSal.paymentDate || new Date().toISOString().slice(0, 10),
      category: "SALARY",
      title: `Salary Payment: ${newSal.employeeName} (${newSal.month})`,
      amount: newSal.netSalary,
      paymentMethod: "BANK",
      payee: newSal.employeeName,
      notes: `Base: ৳${newSal.baseSalary}, Bonus: ৳${newSal.bonus}, Absent Ded: ৳${newSal.absenceDeduction}`,
      voucherNo: `PAYSLIP-${newSal.month}-${newSal.employeeId}`,
    });
  };

  const submitLeaveRequest = (req: Omit<ILeaveRequest, "id" | "status" | "requestedDate">) => {
    const newReq: ILeaveRequest = {
      ...req,
      id: `leave-${Date.now()}`,
      status: "PENDING",
      requestedDate: new Date().toISOString().slice(0, 10),
    };
    setLeaveRequests((prev) => [newReq, ...prev]);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "New Leave Request Submitted",
        message: `${newReq.employeeName} requested ${newReq.totalDays} day(s) ${newReq.leaveType} leave.`,
        type: "LEAVE",
        timestamp: "Just now",
        isRead: false,
        link: "/employees",
      },
      ...prev,
    ]);
  };

  const updateLeaveRequestStatus = (
    id: string,
    status: "APPROVED" | "REJECTED",
    reviewerNotes?: string
  ) => {
    setLeaveRequests((prev) =>
      prev.map((lr) => {
        if (lr.id !== id) return lr;
        const updated = {
          ...lr,
          status,
          reviewedDate: new Date().toISOString().slice(0, 10),
          reviewerNotes,
        };
        // If approved, automatically mark attendance as LEAVE for the dates
        if (status === "APPROVED") {
          markAttendance({
            employeeId: lr.employeeId,
            date: lr.startDate,
            status: "LEAVE",
            notes: `Approved ${lr.leaveType} leave: ${lr.reason}`,
          });
        }
        return updated;
      })
    );
  };

  // ---------------------------------------------------------------------------
  // 5. CUSTOMER DUE LEDGER ACTIONS
  // ---------------------------------------------------------------------------
  const recordCustomerPayment = (paymentData: Omit<ICustomerPayment, "id" | "date">) => {
    const dateStr = new Date().toISOString();
    const newPayment: ICustomerPayment = {
      ...paymentData,
      id: `pay-c-${Date.now()}`,
      date: dateStr,
    };
    setCustomerPayments((prev) => [newPayment, ...prev]);

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === paymentData.customerId
          ? {
              ...c,
              totalPaid: c.totalPaid + paymentData.amount,
              currentDue: Math.max(0, c.currentDue - paymentData.amount),
            }
          : c
      )
    );

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "Customer Due Collected",
        message: `৳${paymentData.amount.toLocaleString()} received from ${paymentData.customerName} via ${paymentData.paymentMethod}.`,
        type: "CREDIT",
        timestamp: "Just now",
        isRead: false,
        link: "/customer-due",
      },
      ...prev,
    ]);
  };

  // ---------------------------------------------------------------------------
  // 6. EXPENSES ACTIONS
  // ---------------------------------------------------------------------------
  const addExpense = (expenseData: Omit<IExpense, "id">) => {
    const newExp: IExpense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // ---------------------------------------------------------------------------
  // 7. MR PANEL ACTIONS
  // ---------------------------------------------------------------------------
  const addMrVisit = (visitData: Omit<IMrVisit, "id">) => {
    const newVisit: IMrVisit = {
      ...visitData,
      id: `visit-${Date.now()}`,
    };
    setMrVisits((prev) => [newVisit, ...prev]);
  };

  const updateMrTarget = (data: Partial<IMrTarget>) => {
    setMrTarget((prev) => ({ ...prev, ...data }));
  };

  // ---------------------------------------------------------------------------
  // 8. BACKUP, RESTORE & OFFLINE SYNC
  // ---------------------------------------------------------------------------
  const syncOfflineQueue = () => {
    setOfflineQueue([]);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "Offline Sync Completed",
        message: "All queued transactions have been committed and synced.",
        type: "ORDER",
        timestamp: "Just now",
        isRead: false,
      },
      ...prev,
    ]);
  };

  const backupDatabase = (): string => {
    const backupObj = {
      exportedAt: new Date().toISOString(),
      version: "2.0.0",
      medicines,
      batches,
      offers,
      companies,
      customers,
      customerPayments,
      posSales,
      dailyClosings,
      distributorOrders,
      employees,
      attendance,
      salaryRecords,
      leaveRequests,
      expenses,
      mrVisits,
      mrTarget,
    };
    return JSON.stringify(backupObj, null, 2);
  };

  const restoreDatabase = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.medicines) setMedicines(data.medicines);
      if (data.batches) setBatches(data.batches);
      if (data.companies) setCompanies(data.companies);
      if (data.customers) setCustomers(data.customers);
      if (data.posSales) setPosSales(data.posSales);
      if (data.distributorOrders) setDistributorOrders(data.distributorOrders);
      if (data.employees) setEmployees(data.employees);
      if (data.attendance) setAttendance(data.attendance);
      if (data.expenses) setExpenses(data.expenses);
      return true;
    } catch (e) {
      console.error("Failed to restore backup JSON:", e);
      return false;
    }
  };

  const resetDatabaseToDemo = () => {
    setMedicines(initialMedicines);
    setBatches(initialBatches);
    setOffers(initialTradeOffers);
    setCompanies(initialCompanies);
    setCustomers(initialCustomers);
    setCustomerPayments(initialCustomerPayments);
    setPosSales(initialPosSales);
    setDistributorOrders(initialDistributorOrders);
    setEmployees(initialEmployees);
    setAttendance(initialAttendance);
    setSalaryRecords(initialSalaryRecords);
    setLeaveRequests(initialLeaveRequests);
    setExpenses(initialExpenses);
    setMrVisits(initialMrVisits);
    setMrTarget(initialMrTarget);
    setOrders(initialOrdersSeed);
  };

  // ---------------------------------------------------------------------------
  // B2B Cart Management
  // ---------------------------------------------------------------------------
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (c) => c.medicineId === item.medicineId && c.orderedUnit === item.orderedUnit
      );
      if (existing) {
        return prev.map((c) =>
          c.medicineId === item.medicineId && c.orderedUnit === item.orderedUnit
            ? { ...c, orderedQty: c.orderedQty + item.orderedQty }
            : c
        );
      }
      return [...prev, item];
    });
  };

  const updateCartQty = (medicineId: string, qty: number, unit?: PackagingUnit) => {
    if (qty <= 0) {
      removeFromCart(medicineId);
      return;
    }
    setCart((prev) =>
      prev.map((c) => {
        if (c.medicineId === medicineId) {
          return {
            ...c,
            orderedQty: qty,
            orderedUnit: unit || c.orderedUnit,
          };
        }
        return c;
      })
    );
  };

  const removeFromCart = (medicineId: string) => {
    setCart((prev) => prev.filter((c) => c.medicineId !== medicineId));
  };

  const clearCart = () => setCart([]);

  // B2B Checkout
  const checkout = async (
    deliveryNotes?: string
  ): Promise<{ success: boolean; order?: AppOrder; error?: string }> => {
    if (cart.length === 0) return { success: false, error: "Cart is empty." };

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
          error: data.error?.message || "Checkout failed. Review credit balance.",
        };
      }

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
            expiryDate:
              typeof b.expiryDate === "string"
                ? b.expiryDate
                : new Date(b.expiryDate).toISOString().split("T")[0],
          })),
        })),
      };

      setOrders((prev) => [newOrder, ...prev]);
      clearCart();
      return { success: true, order: newOrder };
    } catch (err: any) {
      console.error("Checkout error:", err);
      return { success: false, error: err.message || "Network error occurred." };
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const refreshData = async () => {};

  const setCurrentUserRole = (role: UserRole) => {
    setCurrentUser((prev) => ({ ...prev, role }));
  };

  const updateUserAvatar = (avatarUrl: string) => {
    setCurrentUser((prev) => ({ ...prev, avatar: avatarUrl }));
  };

  const updateUserProfile = (data: Partial<{ name: string; email: string; avatar: string }>) => {
    setCurrentUser((prev) => ({ ...prev, ...data }));
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
        companies,
        customers,
        customerPayments,
        posSales,
        dailyClosings,
        distributorOrders,
        employees,
        attendance,
        salaryRecords,
        leaveRequests,
        expenses,
        mrVisits,
        mrTarget,
        cart,
        calculatedCart,
        cartItemCount,
        cartTotalAmount,
        cartTotalBonusPieces,
        remainingCreditAfterCart,
        isCreditSufficient,
        language,
        setLanguage,
        isOnline,
        setIsOnline,
        offlineQueueCount: offlineQueue.length,
        syncOfflineQueue,
        backupDatabase,
        restoreDatabase,
        resetDatabaseToDemo,
        isSearchOpen,
        isQuickOrderOpen,
        isMobileNavOpen,
        setSelectedPharmacyId,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        checkout,
        recordPosSale,
        recordDailyClosing,
        addMedicine,
        updateMedicine,
        addBatch,
        adjustStock,
        createDistributorOrder,
        updateDistributorOrderStatus,
        recordCompanyPayment,
        addEmployee,
        updateEmployee,
        markAttendance,
        recordSalaryPayment,
        submitLeaveRequest,
        updateLeaveRequestStatus,
        recordCustomerPayment,
        addExpense,
        deleteExpense,
        addMrVisit,
        updateMrTarget,
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
