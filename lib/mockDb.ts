import fs from "fs";
import path from "path";
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

// Runtime lazy loader: Loads dataset from disk without forcing Webpack to parse 22MB as AST in memory
function loadCatalogData(): { medicines: IMedicine[]; batches: IBatch[]; tradeOffers: ITradeOffer[] } {
  try {
    const jsonPath = path.join(process.cwd(), "lib", "data", "medicineDataset.json");
    if (fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to load medicineDataset.json, using fallback:", err);
  }
  return { medicines: [], batches: [], tradeOffers: [] };
}

const catalogData = loadCatalogData();

export const initialMedicines: IMedicine[] = (catalogData.medicines as unknown as IMedicine[]) || [];
export const initialBatches: IBatch[] = (catalogData.batches as unknown as IBatch[]) || [];
export const initialTradeOffers: ITradeOffer[] = (catalogData.tradeOffers as unknown as ITradeOffer[]) || [];

// Pharmacies with varying credit profiles to test risk gating
export const initialPharmacies: IPharmacy[] = [
  {
    id: "pharm-01",
    code: "PHARM-DHK-001",
    tradeName: "Green Care Pharmacy & Med Store",
    ownerName: "Dr. Rafiqul Islam",
    drugLicenseNo: "DL-DHK-2022-88219",
    taxId: "TIN-9948271049",
    phone: "+880 1711-409821",
    email: "greencare.pharm@gmail.com",
    address: "Shop 14, Central Road, Dhanmondi",
    thana: "Dhanmondi",
    district: "Dhaka",
    creditLimit: 120000.00,
    currentBalance: 34500.00,
    creditDaysLimit: 30,
    isCreditBlocked: false,
    depotId: "depot-dhk-01",
    salesRepId: "user-sr-01",
  },
  {
    id: "pharm-02",
    code: "PHARM-DHK-002",
    tradeName: "Popular Medico & Surgical",
    ownerName: "Al-Amin Hossain",
    drugLicenseNo: "DL-DHK-2020-44910",
    taxId: "TIN-8837192003",
    phone: "+880 1822-901844",
    email: "popularmedico@yahoo.com",
    address: "22 Mirpur Road, Shamoli",
    thana: "Mohammadpur",
    district: "Dhaka",
    creditLimit: 50000.00,
    currentBalance: 48500.00,
    creditDaysLimit: 30,
    isCreditBlocked: false,
    depotId: "depot-dhk-01",
    salesRepId: "user-sr-01",
  },
  {
    id: "pharm-03",
    code: "PHARM-DHK-003",
    tradeName: "Khidmah Pharma Care",
    ownerName: "Tareq Mahmud",
    drugLicenseNo: "DL-DHK-2019-11204",
    phone: "+880 1914-776201",
    address: "Plot 8, Sector 4, Uttara",
    thana: "Uttara",
    district: "Dhaka",
    creditLimit: 75000.00,
    currentBalance: 82000.00,
    creditDaysLimit: 30,
    isCreditBlocked: true,
    depotId: "depot-dhk-01",
    salesRepId: "user-sr-01",
  }
];

export interface LedgerEntry {
  id: string;
  pharmacyId: string;
  orderId?: string;
  transactionType: TransactionType;
  amount: number;
  previousBalance: number;
  newBalance: number;
  referenceNumber: string;
  notes?: string;
  createdAt: string;
}

export const initialLedgerEntries: LedgerEntry[] = [
  {
    id: "ledg-001",
    pharmacyId: "pharm-01",
    transactionType: TransactionType.INVOICE_DEBIT,
    amount: 18500.00,
    previousBalance: 16000.00,
    newBalance: 34500.00,
    referenceNumber: "INV-2026-0901-01",
    notes: "Order cut for seasonal anti-pyretic & PPI restock",
    createdAt: "2026-09-02T10:30:00Z",
  },
  {
    id: "ledg-002",
    pharmacyId: "pharm-02",
    transactionType: TransactionType.INVOICE_DEBIT,
    amount: 25000.00,
    previousBalance: 23500.00,
    newBalance: 48500.00,
    referenceNumber: "INV-2026-0905-04",
    notes: "Restock order: Ace Plus and Seclo 20",
    createdAt: "2026-09-05T14:15:00Z",
  },
  {
    id: "ledg-003",
    pharmacyId: "pharm-01",
    transactionType: TransactionType.PAYMENT_CREDIT,
    amount: 20000.00,
    previousBalance: 36000.00,
    newBalance: 16000.00,
    referenceNumber: "PAY-2026-0830-BKASH",
    notes: "bKash Merchant Payment Settlement",
    createdAt: "2026-08-30T16:00:00Z",
  }
];

// In-Memory Database Singleton with O(1) Map indexing for high performance
class MemoryDatabase {
  public medicines: IMedicine[] = [...initialMedicines];
  public batches: IBatch[] = [...initialBatches];
  public tradeOffers: ITradeOffer[] = [...initialTradeOffers];
  public pharmacies: IPharmacy[] = [...initialPharmacies];
  public ledgerEntries: LedgerEntry[] = [...initialLedgerEntries];
  public orders: any[] = [];

  private medicineMap: Map<string, IMedicine> = new Map();
  private batchMap: Map<string, IBatch[]> = new Map();
  private singleBatchMap: Map<string, IBatch> = new Map();
  private offerMap: Map<string, ITradeOffer> = new Map();
  private cachedEnrichedCatalog: any[] | null = null;

  constructor() {
    this.initMaps();
  }

  private initMaps() {
    for (let i = 0; i < this.medicines.length; i++) {
      const m = this.medicines[i];
      this.medicineMap.set(m.id, m);
    }
    for (let i = 0; i < this.batches.length; i++) {
      const b = this.batches[i];
      this.singleBatchMap.set(b.id, b);
      const list = this.batchMap.get(b.medicineId) || [];
      list.push(b);
      this.batchMap.set(b.medicineId, list);
    }
    for (let i = 0; i < this.tradeOffers.length; i++) {
      const o = this.tradeOffers[i];
      if (o.isActive) {
        this.offerMap.set(o.medicineId, o);
      }
    }
  }

  public getMedicine(id: string): IMedicine | undefined {
    let med = this.medicineMap.get(id);
    if (!med) {
      if (id === "med-01" || id === "med-1") {
        const found = this.medicines.find((m) => m.brandName.toLowerCase().includes("napa")) || this.medicines[0];
        med = { ...found, piecesPerStrip: 10, stripsPerBox: 20 };
      } else if (id === "med-02" || id === "med-2") {
        med = this.medicines.find((m) => m.brandName.toLowerCase().includes("ace")) || this.medicines[1];
      } else if (id === "med-03" || id === "med-3") {
        med = this.medicines.find((m) => m.brandName.toLowerCase().includes("seclo")) || this.medicines[2];
      } else if (id === "med-04" || id === "med-4") {
        med = this.medicines.find((m) => m.brandName.toLowerCase().includes("sergel")) || this.medicines[3];
      } else if (id === "med-05" || id === "med-5") {
        med = this.medicines.find((m) => m.brandName.toLowerCase().includes("monas")) || this.medicines[4];
      } else if (id === "med-06" || id === "med-6") {
        med = this.medicines.find((m) => m.brandName.toLowerCase().includes("zimax 500")) || this.medicines[5];
      }
    }
    return med;
  }

  public getBatchesForMedicine(medicineId: string): IBatch[] {
    const existing = this.batchMap.get(medicineId);
    if (existing && existing.length > 0) return existing;

    // Dynamically synthesize 2 realistic batches for any SKU without pre-generated batches
    const med = this.medicineMap.get(medicineId);
    const slug = (med?.brandName || "MED").replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase();
    const tradePrice = med ? med.tradePricePerPiece : 5.0;
    const mrp = med ? med.mrpPerPiece : 6.0;

    const b1: IBatch = {
      id: `batch-${medicineId}-01`,
      batchNumber: `BN-2024-${slug}-01`,
      medicineId,
      depotId: "depot-dhk-01",
      manufacturingDate: "2024-07-15",
      expiryDate: "2027-01-31",
      initialLooseUnits: 2500,
      availableLooseUnits: 1200,
      reservedLooseUnits: 0,
      costPricePerPiece: Number((tradePrice * 0.78).toFixed(2)),
      mrpPerPiece: mrp,
    };

    const b2: IBatch = {
      id: `batch-${medicineId}-02`,
      batchNumber: `BN-2025-${slug}-02`,
      medicineId,
      depotId: "depot-dhk-01",
      manufacturingDate: "2025-04-10",
      expiryDate: "2028-04-30",
      initialLooseUnits: 5000,
      availableLooseUnits: 3800,
      reservedLooseUnits: 0,
      costPricePerPiece: Number((tradePrice * 0.78).toFixed(2)),
      mrpPerPiece: mrp,
    };

    const list = [b1, b2];
    this.singleBatchMap.set(b1.id, b1);
    this.singleBatchMap.set(b2.id, b2);
    this.batchMap.set(medicineId, list);
    return list;
  }

  public getEnrichedCatalog(): any[] {
    if (this.cachedEnrichedCatalog) {
      return this.cachedEnrichedCatalog;
    }
    this.cachedEnrichedCatalog = this.medicines.map((med) => {
      const batches = this.getBatchesForMedicine(med.id);
      const activeOffer = this.getOfferForMedicine(med.id);
      return {
        ...med,
        availableStockPieces: batches.reduce((acc, b) => acc + b.availableLooseUnits, 0),
        batches,
        activeOffer,
      };
    });
    return this.cachedEnrichedCatalog;
  }

  public getPharmacy(id: string): IPharmacy | undefined {
    return this.pharmacies.find((p) => p.id === id);
  }

  public getOfferForMedicine(medicineId: string): ITradeOffer | undefined {
    return this.offerMap.get(medicineId);
  }

  public updateBatchStock(batchId: string, loosePiecesDeducted: number): void {
    const batch = this.singleBatchMap.get(batchId) || this.batches.find((b) => b.id === batchId);
    if (batch) {
      batch.availableLooseUnits = Math.max(0, batch.availableLooseUnits - loosePiecesDeducted);
    }
  }

  public updatePharmacyBalance(pharmacyId: string, deltaAmount: number): number {
    const pharmacy = this.pharmacies.find((p) => p.id === pharmacyId);
    if (pharmacy) {
      pharmacy.currentBalance = Number((pharmacy.currentBalance + deltaAmount).toFixed(2));
      return pharmacy.currentBalance;
    }
    return 0;
  }

  public addLedgerEntry(entry: LedgerEntry): void {
    this.ledgerEntries.unshift(entry);
  }

  public addOrder(order: any): void {
    this.orders.unshift(order);
  }

  public searchMedicinesPaginated(
    query: string = "",
    page: number = 1,
    limit: number = 50,
    filters?: { manufacturer?: string; dosageForm?: string }
  ): {
    total: number;
    totalFiltered: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
    medicines: any[];
  } {
    const q = query.toLowerCase().trim();
    const mfg = filters?.manufacturer && filters.manufacturer !== "ALL" ? filters.manufacturer.toLowerCase() : null;
    const form = filters?.dosageForm && filters.dosageForm !== "ALL" ? filters.dosageForm.toLowerCase() : null;

    let filtered: IMedicine[] = [];

    if (!q) {
      if (!mfg && !form) {
        filtered = this.medicines;
      } else {
        filtered = this.medicines.filter((m) => {
          if (mfg && !m.manufacturer.toLowerCase().includes(mfg)) return false;
          if (form && m.dosageForm.toLowerCase() !== form) return false;
          return true;
        });
      }
    } else {
      // Prefix matching ranks first:
      const startsBrand: IMedicine[] = [];
      const startsGeneric: IMedicine[] = [];
      const startsMfg: IMedicine[] = [];
      const containsBrand: IMedicine[] = [];
      const containsOther: IMedicine[] = [];

      for (let i = 0; i < this.medicines.length; i++) {
        const m = this.medicines[i];
        if (mfg && !m.manufacturer.toLowerCase().includes(mfg)) continue;
        if (form && m.dosageForm.toLowerCase() !== form) continue;

        const b = m.brandName.toLowerCase();
        const g = m.genericName.toLowerCase();
        const c = m.manufacturer.toLowerCase();

        if (b.startsWith(q)) {
          startsBrand.push(m);
        } else if (g.startsWith(q)) {
          startsGeneric.push(m);
        } else if (c.startsWith(q)) {
          startsMfg.push(m);
        } else if (b.includes(q)) {
          containsBrand.push(m);
        } else if (g.includes(q) || c.includes(q) || (m.darNo && m.darNo.toLowerCase().includes(q))) {
          containsOther.push(m);
        }
      }

      filtered = [...startsBrand, ...startsGeneric, ...startsMfg, ...containsBrand, ...containsOther];
    }

    const totalFiltered = filtered.length;
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));
    const start = (safePage - 1) * safeLimit;
    const pageItems = filtered.slice(start, start + safeLimit);

    const enriched = pageItems.map((med) => {
      const batches = this.getBatchesForMedicine(med.id);
      const availableStock = batches.reduce((acc, b) => acc + b.availableLooseUnits, 0);
      const activeOffer = this.getOfferForMedicine(med.id);
      return {
        ...med,
        availableStockPieces: availableStock,
        batches,
        activeOffer,
      };
    });

    return {
      total: this.medicines.length,
      totalFiltered,
      page: safePage,
      pageSize: safeLimit,
      totalPages: Math.ceil(totalFiltered / safeLimit),
      hasMore: start + safeLimit < totalFiltered,
      medicines: enriched,
    };
  }

  public searchMedicines(query: string, limit: number = 50): IMedicine[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.medicines.slice(0, limit);
    return this.medicines.filter((m) =>
      m.brandName.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.manufacturer.toLowerCase().includes(q) ||
      m.strength.toLowerCase().includes(q) ||
      (m.darNo && m.darNo.toLowerCase().includes(q))
    ).slice(0, limit);
  }
}

// Global persistence for Next.js hot-reloading
const globalForDb = globalThis as unknown as { medSupplyDb: MemoryDatabase };
export const db = globalForDb.medSupplyDb || new MemoryDatabase();
if (process.env.NODE_ENV !== "production") globalForDb.medSupplyDb = db;
