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

// Initial seed data representing real-world pharmaceutical catalog & batches
export const initialMedicines: IMedicine[] = [
  {
    id: "med-01",
    code: "MED-NAP-EXT",
    brandName: "Napa Extra",
    genericName: "Paracetamol + Caffeine",
    dosageForm: DosageForm.TABLET,
    strength: "500mg + 65mg",
    manufacturer: "Beximco Pharmaceuticals Ltd.",
    description: "Analgesic & Antipyretic for severe headache, migraine, toothache and fever.",
    piecesPerStrip: 10,
    stripsPerBox: 20, // 1 Box = 200 Pieces
    mrpPerPiece: 3.00,
    tradePricePerPiece: 2.45,
    vatPercentage: 2.40,
    isActive: true,
  },
  {
    id: "med-02",
    code: "MED-ACE-PLS",
    brandName: "Ace Plus",
    genericName: "Paracetamol + Caffeine",
    dosageForm: DosageForm.TABLET,
    strength: "500mg + 65mg",
    manufacturer: "Square Pharmaceuticals PLC",
    description: "Rapid relief from pain, fever, neuralgic pain, and headache.",
    piecesPerStrip: 10,
    stripsPerBox: 20, // 1 Box = 200 Pieces
    mrpPerPiece: 3.00,
    tradePricePerPiece: 2.45,
    vatPercentage: 2.40,
    isActive: true,
  },
  {
    id: "med-03",
    code: "MED-SEC-020",
    brandName: "Seclo 20",
    genericName: "Omeprazole",
    dosageForm: DosageForm.CAPSULE,
    strength: "20mg",
    manufacturer: "Square Pharmaceuticals PLC",
    description: "Proton Pump Inhibitor (PPI) for gastric ulcer, GERD, and hyperacidity.",
    piecesPerStrip: 10,
    stripsPerBox: 10, // 1 Box = 100 Pieces
    mrpPerPiece: 6.00,
    tradePricePerPiece: 4.90,
    vatPercentage: 2.40,
    isActive: true,
  },
  {
    id: "med-04",
    code: "MED-SER-020",
    brandName: "Sergel 20",
    genericName: "Esomeprazole",
    dosageForm: DosageForm.CAPSULE,
    strength: "20mg",
    manufacturer: "Incepta Pharmaceuticals Ltd.",
    description: "Next-gen PPI for erosive esophagitis, acid reflux, and peptic ulcer.",
    piecesPerStrip: 14,
    stripsPerBox: 8, // 1 Box = 112 Pieces
    mrpPerPiece: 8.00,
    tradePricePerPiece: 6.50,
    vatPercentage: 2.40,
    isActive: true,
  },
  {
    id: "med-05",
    code: "MED-MON-010",
    brandName: "Monas 10",
    genericName: "Montelukast Sodium",
    dosageForm: DosageForm.TABLET,
    strength: "10mg",
    manufacturer: "Acme Laboratories Ltd.",
    description: "Leukotriene receptor antagonist for chronic asthma and allergic rhinitis.",
    piecesPerStrip: 10,
    stripsPerBox: 5, // 1 Box = 50 Pieces
    mrpPerPiece: 17.50,
    tradePricePerPiece: 14.20,
    vatPercentage: 2.40,
    isActive: true,
  },
  {
    id: "med-06",
    code: "MED-AZI-500",
    brandName: "Zimax 500",
    genericName: "Azithromycin",
    dosageForm: DosageForm.TABLET,
    strength: "500mg",
    manufacturer: "Square Pharmaceuticals PLC",
    description: "Macrolide antibiotic for upper and lower respiratory tract infections.",
    piecesPerStrip: 3,
    stripsPerBox: 6, // 1 Box = 18 Pieces
    mrpPerPiece: 40.00,
    tradePricePerPiece: 33.00,
    vatPercentage: 2.40,
    isActive: true,
  },
  {
    id: "med-07",
    code: "MED-FEX-120",
    brandName: "Fexo 120",
    genericName: "Fexofenadine HCl",
    dosageForm: DosageForm.TABLET,
    strength: "120mg",
    manufacturer: "Square Pharmaceuticals PLC",
    description: "Non-sedating antihistamine for seasonal allergic rhinitis and urticaria.",
    piecesPerStrip: 10,
    stripsPerBox: 5, // 1 Box = 50 Pieces
    mrpPerPiece: 10.00,
    tradePricePerPiece: 8.15,
    vatPercentage: 2.40,
    isActive: true,
  },
  {
    id: "med-08",
    code: "MED-CIP-500",
    brandName: "Ciprocin 500",
    genericName: "Ciprofloxacin",
    dosageForm: DosageForm.TABLET,
    strength: "500mg",
    manufacturer: "Square Pharmaceuticals PLC",
    description: "Broad-spectrum fluoroquinolone antibiotic for bacterial infections.",
    piecesPerStrip: 10,
    stripsPerBox: 5, // 1 Box = 50 Pieces
    mrpPerPiece: 15.00,
    tradePricePerPiece: 12.30,
    vatPercentage: 2.40,
    isActive: true,
  }
];

// Multiple batches per medicine with varying manufacturing/expiry dates for FIFO simulation
export const initialBatches: IBatch[] = [
  // Napa Extra Batches
  {
    id: "batch-napa-01",
    batchNumber: "BN-2024-NAPA-01",
    medicineId: "med-01",
    depotId: "depot-dhk-01",
    manufacturingDate: "2024-03-10",
    expiryDate: "2026-11-30", // Expiring soon (Near expiry FIFO priority)
    initialLooseUnits: 2000,
    availableLooseUnits: 450,
    reservedLooseUnits: 0,
    costPricePerPiece: 1.90,
    mrpPerPiece: 3.00,
  },
  {
    id: "batch-napa-02",
    batchNumber: "BN-2025-NAPA-02",
    medicineId: "med-01",
    depotId: "depot-dhk-01",
    manufacturingDate: "2025-01-15",
    expiryDate: "2027-06-30", // Later expiry
    initialLooseUnits: 5000,
    availableLooseUnits: 3800,
    reservedLooseUnits: 0,
    costPricePerPiece: 1.95,
    mrpPerPiece: 3.00,
  },
  {
    id: "batch-napa-03",
    batchNumber: "BN-2025-NAPA-03",
    medicineId: "med-01",
    depotId: "depot-dhk-01",
    manufacturingDate: "2025-08-01",
    expiryDate: "2028-01-31", // Freshest batch
    initialLooseUnits: 10000,
    availableLooseUnits: 9800,
    reservedLooseUnits: 0,
    costPricePerPiece: 2.00,
    mrpPerPiece: 3.00,
  },

  // Ace Plus Batches
  {
    id: "batch-ace-01",
    batchNumber: "BN-2024-ACE-08",
    medicineId: "med-02",
    depotId: "depot-dhk-01",
    manufacturingDate: "2024-06-10",
    expiryDate: "2026-12-15",
    initialLooseUnits: 3000,
    availableLooseUnits: 1200,
    reservedLooseUnits: 0,
    costPricePerPiece: 1.90,
    mrpPerPiece: 3.00,
  },
  {
    id: "batch-ace-02",
    batchNumber: "BN-2025-ACE-11",
    medicineId: "med-02",
    depotId: "depot-dhk-01",
    manufacturingDate: "2025-03-20",
    expiryDate: "2027-09-30",
    initialLooseUnits: 6000,
    availableLooseUnits: 5400,
    reservedLooseUnits: 0,
    costPricePerPiece: 1.95,
    mrpPerPiece: 3.00,
  },

  // Seclo 20 Batches
  {
    id: "batch-sec-01",
    batchNumber: "BN-2024-SEC-03",
    medicineId: "med-03",
    depotId: "depot-dhk-01",
    manufacturingDate: "2024-05-15",
    expiryDate: "2026-10-31", // Very near expiry!
    initialLooseUnits: 1500,
    availableLooseUnits: 300,
    reservedLooseUnits: 0,
    costPricePerPiece: 3.80,
    mrpPerPiece: 6.00,
  },
  {
    id: "batch-sec-02",
    batchNumber: "BN-2025-SEC-09",
    medicineId: "med-03",
    depotId: "depot-dhk-01",
    manufacturingDate: "2025-02-10",
    expiryDate: "2027-05-31",
    initialLooseUnits: 4000,
    availableLooseUnits: 3200,
    reservedLooseUnits: 0,
    costPricePerPiece: 3.90,
    mrpPerPiece: 6.00,
  },

  // Sergel 20 Batches
  {
    id: "batch-ser-01",
    batchNumber: "BN-2025-SER-01",
    medicineId: "med-04",
    depotId: "depot-dhk-01",
    manufacturingDate: "2025-01-10",
    expiryDate: "2027-04-30",
    initialLooseUnits: 2500,
    availableLooseUnits: 2100,
    reservedLooseUnits: 0,
    costPricePerPiece: 5.10,
    mrpPerPiece: 8.00,
  },

  // Monas 10 Batches
  {
    id: "batch-mon-01",
    batchNumber: "BN-2025-MON-04",
    medicineId: "med-05",
    depotId: "depot-dhk-01",
    manufacturingDate: "2025-04-10",
    expiryDate: "2027-08-31",
    initialLooseUnits: 1800,
    availableLooseUnits: 1500,
    reservedLooseUnits: 0,
    costPricePerPiece: 11.20,
    mrpPerPiece: 17.50,
  },

  // Zimax 500 Batches (Low stock scenario for AI alternative test)
  {
    id: "batch-zim-01",
    batchNumber: "BN-2024-ZIM-02",
    medicineId: "med-06",
    depotId: "depot-dhk-01",
    manufacturingDate: "2024-08-15",
    expiryDate: "2026-11-20",
    initialLooseUnits: 200,
    availableLooseUnits: 18, // Barely 1 box left!
    reservedLooseUnits: 0,
    costPricePerPiece: 26.50,
    mrpPerPiece: 40.00,
  },

  // Fexo 120 Batches
  {
    id: "batch-fex-01",
    batchNumber: "BN-2025-FEX-01",
    medicineId: "med-07",
    depotId: "depot-dhk-01",
    manufacturingDate: "2025-02-20",
    expiryDate: "2027-07-31",
    initialLooseUnits: 2000,
    availableLooseUnits: 1800,
    reservedLooseUnits: 0,
    costPricePerPiece: 6.40,
    mrpPerPiece: 10.00,
  },

  // Ciprocin 500 Batches
  {
    id: "batch-cip-01",
    batchNumber: "BN-2025-CIP-02",
    medicineId: "med-08",
    depotId: "depot-dhk-01",
    manufacturingDate: "2025-03-01",
    expiryDate: "2027-09-30",
    initialLooseUnits: 3000,
    availableLooseUnits: 2600,
    reservedLooseUnits: 0,
    costPricePerPiece: 9.60,
    mrpPerPiece: 15.00,
  }
];

// Active promotional trade schemes
export const initialTradeOffers: ITradeOffer[] = [
  {
    id: "offer-01",
    title: "Monsoon Health Surge: Buy 10 Boxes Napa Extra, Get 1 Box Free",
    medicineId: "med-01",
    schemeType: TradeSchemeType.BUY_X_GET_Y_FREE,
    qualifyingUnit: PackagingUnit.BOX,
    minQualifyingQty: 10,
    bonusQty: 1,
    bonusUnit: PackagingUnit.BOX,
    startDate: "2026-08-01",
    endDate: "2026-10-31",
    isActive: true,
  },
  {
    id: "offer-02",
    title: "Gastric Care Volume Offer: 5.0% Instant Trade Discount on >= 20 Strips Seclo 20",
    medicineId: "med-03",
    schemeType: TradeSchemeType.SLAB_DISCOUNT,
    qualifyingUnit: PackagingUnit.STRIP,
    minQualifyingQty: 20,
    bonusQty: 0,
    bonusUnit: PackagingUnit.STRIP,
    discountPercent: 5.0,
    startDate: "2026-08-15",
    endDate: "2026-11-15",
    isActive: true,
  },
  {
    id: "offer-03",
    title: "Allergy Season Bonus: 5% Bonus Loose Pieces on Monas 10",
    medicineId: "med-05",
    schemeType: TradeSchemeType.BONUS_RATIO,
    qualifyingUnit: PackagingUnit.BOX,
    minQualifyingQty: 2,
    bonusQty: 5,
    bonusUnit: PackagingUnit.PIECE,
    discountPercent: 5.0, // 5% bonus ratio
    startDate: "2026-09-01",
    endDate: "2026-10-31",
    isActive: true,
  }
];

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
    currentBalance: 34500.00, // Healthy credit headroom
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
    currentBalance: 48500.00, // Near Credit Ceiling (৳1,500 headroom)
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
    currentBalance: 82000.00, // Overdue / Limit Exceeded
    creditDaysLimit: 30,
    isCreditBlocked: true, // Blocked by admin
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

// In-Memory Database Singleton to support local API routes and real-time state mutations
class MemoryDatabase {
  public medicines: IMedicine[] = [...initialMedicines];
  public batches: IBatch[] = [...initialBatches];
  public tradeOffers: ITradeOffer[] = [...initialTradeOffers];
  public pharmacies: IPharmacy[] = [...initialPharmacies];
  public ledgerEntries: LedgerEntry[] = [...initialLedgerEntries];
  public orders: any[] = [];

  public getMedicine(id: string): IMedicine | undefined {
    return this.medicines.find((m) => m.id === id);
  }

  public getBatchesForMedicine(medicineId: string): IBatch[] {
    return this.batches.filter((b) => b.medicineId === medicineId);
  }

  public getPharmacy(id: string): IPharmacy | undefined {
    return this.pharmacies.find((p) => p.id === id);
  }

  public getOfferForMedicine(medicineId: string): ITradeOffer | undefined {
    return this.tradeOffers.find((o) => o.medicineId === medicineId && o.isActive);
  }

  public updateBatchStock(batchId: string, loosePiecesDeducted: number): void {
    const batch = this.batches.find((b) => b.id === batchId);
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
}

// Global persistence for Next.js hot-reloading
const globalForDb = globalThis as unknown as { medSupplyDb: MemoryDatabase };
export const db = globalForDb.medSupplyDb || new MemoryDatabase();
if (process.env.NODE_ENV !== "production") globalForDb.medSupplyDb = db;
