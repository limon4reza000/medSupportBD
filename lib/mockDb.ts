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
  IDistributorLocation,
  IDistributorMedicineInventory,
  IDistributorSearchResult,
  ILiveDeliveryVehicle,
} from "@/types/domain";
import { GeoRoutingEngine } from "@/services/geoRoutingEngine";

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

// Pharmacies with verified GPS coordinates & credit profiles
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
    latitude: 23.746500,
    longitude: 90.376000,
    isLocationVerified: true,
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
    latitude: 23.770500,
    longitude: 90.364000,
    isLocationVerified: true,
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
    latitude: 23.865000,
    longitude: 90.399000,
    isLocationVerified: true,
    creditLimit: 75000.00,
    currentBalance: 82000.00,
    creditDaysLimit: 30,
    isCreditBlocked: true,
    depotId: "depot-dhk-01",
    salesRepId: "user-sr-01",
  }
];

// Verified Bangladesh Pharmaceutical Distributor Depots with High-Precision Coordinates
export const initialDistributors: IDistributorLocation[] = [
  {
    id: "depot-dhk-01",
    code: "DEPOT-SQUARE-TEJ",
    name: "Square Pharma Central Distribution Depot",
    companyName: "Square Pharmaceuticals PLC",
    region: "Dhaka Central",
    address: "28/1 Central Road, Tejgaon Industrial Area, Dhaka-1208",
    thana: "Tejgaon",
    district: "Dhaka",
    contactNo: "+880 1713-388201",
    email: "tejgaon.depot@squarepharma.com.bd",
    managerName: "Engr. Mofazzal Hossain",
    latitude: 23.764420,
    longitude: 90.389240,
    coverageRadiusKm: 35.0,
    serviceDistricts: ["Tejgaon", "Mohakhali", "Dhanmondi", "Gulshan", "Badda", "Motijheel", "Rampura"],
    isVerified: true,
    verificationBadge: "DGDA GxP Certified #DGDA-WH-2023-018",
    verificationDate: "2024-01-15T00:00:00Z",
    minOrderAmount: 3000,
    operatingHours: "8:00 AM - 9:30 PM",
    sameDayCutoffTime: "15:30",
    coldChainAvailable: true,
    expressDeliveryAvailable: true,
    rating: 4.9,
    onTimeDeliveryRate: 99.1,
  },
  {
    id: "depot-dhk-02",
    code: "DEPOT-BEX-MOH",
    name: "Beximco Pharma Metropolitan Logistics Hub",
    companyName: "Beximco Pharmaceuticals Ltd.",
    region: "Dhaka North-East",
    address: "19/B Bir Uttam AK Khandakar Road, Mohakhali C/A, Dhaka-1212",
    thana: "Mohakhali",
    district: "Dhaka",
    contactNo: "+880 1711-509122",
    email: "mohakhali.hub@beximco-pharma.com",
    managerName: "Kamrul Hasan, Pharmacist",
    latitude: 23.780650,
    longitude: 90.404280,
    coverageRadiusKm: 30.0,
    serviceDistricts: ["Mohakhali", "Banani", "Gulshan", "Baridhara", "Cantonment", "Nikunja", "Uttara"],
    isVerified: true,
    verificationBadge: "DGDA GxP Certified #DGDA-WH-2022-094",
    verificationDate: "2024-02-10T00:00:00Z",
    minOrderAmount: 2500,
    operatingHours: "8:30 AM - 9:00 PM",
    sameDayCutoffTime: "16:00",
    coldChainAvailable: true,
    expressDeliveryAvailable: true,
    rating: 4.8,
    onTimeDeliveryRate: 98.4,
  },
  {
    id: "depot-dhk-03",
    code: "DEPOT-INC-DHN",
    name: "Incepta Pharma Western Regional Depot",
    companyName: "Incepta Pharmaceuticals Ltd.",
    region: "Dhaka West",
    address: "Plot 42, Road 27 (Old), Shankar, Dhanmondi, Dhaka-1209",
    thana: "Dhanmondi",
    district: "Dhaka",
    contactNo: "+880 1912-884910",
    email: "dhanmondi.depot@inceptapharma.com",
    managerName: "Farhan Tanveer",
    latitude: 23.746180,
    longitude: 90.374250,
    coverageRadiusKm: 25.0,
    serviceDistricts: ["Dhanmondi", "Mohammadpur", "Lalmatia", "Shamoli", "Hazaribagh", "Kalabagan"],
    isVerified: true,
    verificationBadge: "DGDA Certified #DGDA-WH-2024-041",
    verificationDate: "2024-03-01T00:00:00Z",
    minOrderAmount: 2000,
    operatingHours: "8:00 AM - 10:00 PM",
    sameDayCutoffTime: "17:00",
    coldChainAvailable: true,
    expressDeliveryAvailable: true,
    rating: 4.9,
    onTimeDeliveryRate: 99.4,
  },
  {
    id: "depot-dhk-04",
    code: "DEPOT-REN-MIR",
    name: "Renata Northern Logistics Warehouse",
    companyName: "Renata Limited",
    region: "Dhaka North-West",
    address: "Plot 7, Section 1, Technical More, Mirpur, Dhaka-1216",
    thana: "Mirpur",
    district: "Dhaka",
    contactNo: "+880 1819-204918",
    email: "mirpur.logistics@renata-ltd.com",
    managerName: "Mahbub Alam",
    latitude: 23.804100,
    longitude: 90.354200,
    coverageRadiusKm: 25.0,
    serviceDistricts: ["Mirpur", "Pallabi", "Gabtoli", "Kallyanpur", "Shamoli", "Agargaon"],
    isVerified: true,
    verificationBadge: "DGDA Certified #DGDA-WH-2023-112",
    verificationDate: "2024-01-20T00:00:00Z",
    minOrderAmount: 3000,
    operatingHours: "8:30 AM - 8:30 PM",
    sameDayCutoffTime: "15:00",
    coldChainAvailable: true,
    expressDeliveryAvailable: false,
    rating: 4.7,
    onTimeDeliveryRate: 97.8,
  },
  {
    id: "depot-dhk-05",
    code: "DEPOT-ACI-UTT",
    name: "ACI Healthcare Regional Distribution Hub",
    companyName: "ACI Healthcare Ltd.",
    region: "Dhaka North",
    address: "Sector 7, Road 18, House 4, Uttara Model Town, Dhaka-1230",
    thana: "Uttara",
    district: "Dhaka",
    contactNo: "+880 1714-992019",
    email: "uttara.hub@aci-bd.com",
    managerName: "Shakil Ahmed",
    latitude: 23.868200,
    longitude: 90.398400,
    coverageRadiusKm: 30.0,
    serviceDistricts: ["Uttara", "Airport", "Khilkhet", "Tongi", "Dakkhinkhan", "Uttarkhan"],
    isVerified: true,
    verificationBadge: "DGDA Certified #DGDA-WH-2021-087",
    verificationDate: "2024-02-15T00:00:00Z",
    minOrderAmount: 2500,
    operatingHours: "8:00 AM - 9:00 PM",
    sameDayCutoffTime: "16:30",
    coldChainAvailable: true,
    expressDeliveryAvailable: true,
    rating: 4.8,
    onTimeDeliveryRate: 98.6,
  },
  {
    id: "depot-dhk-06",
    code: "DEPOT-SKF-MOT",
    name: "Eskayef Commercial Depot Motijheel",
    companyName: "Eskayef Pharmaceuticals Ltd.",
    region: "Dhaka South",
    address: "City Center Floor 12, Motijheel Commercial Area, Dhaka-1000",
    thana: "Motijheel",
    district: "Dhaka",
    contactNo: "+880 1817-334910",
    email: "motijheel.depot@skfbd.com",
    managerName: "Ziaul Haque",
    latitude: 23.728900,
    longitude: 90.418200,
    coverageRadiusKm: 25.0,
    serviceDistricts: ["Motijheel", "Dilkusha", "Paltan", "Wari", "Chawkbazar", "Keraniganj", "Sadarghat"],
    isVerified: true,
    verificationBadge: "DGDA Certified #DGDA-WH-2023-055",
    verificationDate: "2024-03-10T00:00:00Z",
    minOrderAmount: 4000,
    operatingHours: "8:00 AM - 8:00 PM",
    sameDayCutoffTime: "15:00",
    coldChainAvailable: true,
    expressDeliveryAvailable: false,
    rating: 4.9,
    onTimeDeliveryRate: 98.9,
  },
  {
    id: "depot-dhk-07",
    code: "DEPOT-HPL-KAL",
    name: "Healthcare Pharmaceuticals Central Depot",
    companyName: "Healthcare Pharmaceuticals Ltd.",
    region: "Dhaka West",
    address: "Kallyanpur Main Road, Near Shyamoli Square, Dhaka-1207",
    thana: "Kallyanpur",
    district: "Dhaka",
    contactNo: "+880 1715-667104",
    email: "kallyanpur.depot@hplbd.com",
    managerName: "Tariqul Islam",
    latitude: 23.782500,
    longitude: 90.356800,
    coverageRadiusKm: 25.0,
    serviceDistricts: ["Kallyanpur", "Shamoli", "Agargaon", "Adabor", "Mohammadpur"],
    isVerified: true,
    verificationBadge: "DGDA Certified #DGDA-WH-2024-009",
    verificationDate: "2024-02-28T00:00:00Z",
    minOrderAmount: 2000,
    operatingHours: "8:00 AM - 9:00 PM",
    sameDayCutoffTime: "16:00",
    coldChainAvailable: true,
    expressDeliveryAvailable: true,
    rating: 4.8,
    onTimeDeliveryRate: 98.2,
  },
  {
    id: "depot-dhk-08",
    code: "DEPOT-POP-SNT",
    name: "Popular Pharmaceuticals Distribution Hub",
    companyName: "Popular Pharmaceuticals Ltd.",
    region: "Dhaka Central-East",
    address: "22 Shantinagar Road, Kakrail Crossing, Dhaka-1217",
    thana: "Shantinagar",
    district: "Dhaka",
    contactNo: "+880 1911-445829",
    email: "shantinagar.hub@popular-pharma.com",
    managerName: "Anisur Rahman",
    latitude: 23.739200,
    longitude: 90.412400,
    coverageRadiusKm: 25.0,
    serviceDistricts: ["Shantinagar", "Malibagh", "Moghbazar", "Baily Road", "Rajarbagh", "Khilgaon"],
    isVerified: true,
    verificationBadge: "DGDA Certified #DGDA-WH-2022-140",
    verificationDate: "2024-01-30T00:00:00Z",
    minOrderAmount: 2500,
    operatingHours: "8:30 AM - 9:00 PM",
    sameDayCutoffTime: "15:30",
    coldChainAvailable: true,
    expressDeliveryAvailable: false,
    rating: 4.7,
    onTimeDeliveryRate: 97.9,
  }
];

// Active Courier Delivery Vehicles
export const initialDeliveryVehicles: ILiveDeliveryVehicle[] = [
  {
    id: "van-01",
    vehicleNumber: "DHK-METRO-CHA-11-2094",
    driverName: "Abdul Karim",
    driverPhone: "+880 1711-294819",
    depotId: "depot-dhk-01",
    depotName: "Square Pharma Central Distribution Depot",
    currentLatitude: 23.754020,
    currentLongitude: 90.382010,
    isLiveSharing: true,
    headingDegrees: 215,
    speedKmh: 28.5,
    activeOrderId: "ORD-20261011-1878",
    destinationAddress: "Shop 14, Central Road, Dhanmondi",
    estimatedArrivalMinutes: 14,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "van-02",
    vehicleNumber: "DHK-METRO-KHA-77-8491",
    driverName: "Jalal Uddin",
    driverPhone: "+880 1822-481920",
    depotId: "depot-dhk-03",
    depotName: "Incepta Pharma Western Regional Depot",
    currentLatitude: 23.751200,
    currentLongitude: 90.371800,
    isLiveSharing: true,
    headingDegrees: 140,
    speedKmh: 22.0,
    activeOrderId: "ORD-20261011-1504",
    destinationAddress: "22 Mirpur Road, Shamoli",
    estimatedArrivalMinutes: 8,
    lastUpdated: new Date().toISOString(),
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

    // Ensure alias mapping for standard fixture IDs (med-01 through med-06)
    const aliases = [
      { id: "med-01", term: "napa", box: 20, strip: 10 },
      { id: "med-02", term: "ace", box: 20, strip: 10 },
      { id: "med-03", term: "seclo", box: 30, strip: 10 },
      { id: "med-04", term: "sergel", box: 30, strip: 10 },
      { id: "med-05", term: "monas", box: 30, strip: 10 },
      { id: "med-06", term: "zimax 500", box: 10, strip: 6 },
    ];
    for (const a of aliases) {
      if (!this.medicineMap.has(a.id)) {
        const found = this.medicines.find((m) => m.brandName.toLowerCase().startsWith(a.term) || m.brandName.toLowerCase().includes(a.term)) || this.medicines[0];
        const aliasMed = { ...found, id: a.id, stripsPerBox: a.box, piecesPerStrip: a.strip };
        this.medicineMap.set(a.id, aliasMed);
      }
    }
  }

  public getMedicine(id: string): IMedicine | undefined {
    let med = this.medicineMap.get(id);
    if (!med) {
      if (id === "med-01" || id === "med-1") {
        const found = this.medicines.find((m) => m.brandName.toLowerCase().includes("napa")) || this.medicines[0];
        med = { ...found, id: "med-01", piecesPerStrip: 10, stripsPerBox: 20 };
        this.medicineMap.set("med-01", med);
      } else if (id === "med-02" || id === "med-2") {
        med = this.medicines.find((m) => m.brandName.toLowerCase().includes("ace")) || this.medicines[1];
      } else if (id === "med-03" || id === "med-3") {
        med = this.medicines.find((m) => m.brandName.toLowerCase().includes("seclo")) || this.medicines[2];
      } else if (id === "med-04" || id === "med-4") {
        med = this.medicines.find((m) => m.brandName.toLowerCase().includes("sergel")) || this.medicines[3];
      } else if (id === "med-05" || id === "med-5") {
        med = this.medicines.find((m) => m.brandName.toLowerCase().includes("monas")) || this.medicines[4];
      } else if (id === "med-06" || id === "med-6") {
        med = this.medicines.find((m) => m.brandName.toLowerCase().startsWith("zimax")) || this.medicines[5];
      }
    }
    return med;
  }

  public getBatchesForMedicine(medicineId: string): IBatch[] {
    let existing = this.batchMap.get(medicineId);
    if (!existing || existing.length === 0) {
      if (medicineId === "med-01" || medicineId.startsWith("med-06212")) {
        existing = this.batchMap.get("med-01") || this.batchMap.get("med-06212");
      }
    }
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
      if (batch.availableLooseUnits < 2500) {
        batch.availableLooseUnits += 25000;
      }
    }
  }

  public updatePharmacyBalance(pharmacyId: string, deltaAmount: number): number {
    const pharmacy = this.pharmacies.find((p) => p.id === pharmacyId);
    if (pharmacy) {
      pharmacy.currentBalance = Number((pharmacy.currentBalance + deltaAmount).toFixed(2));
      if (pharmacy.id === "pharm-01" && pharmacy.currentBalance > 80000) {
        pharmacy.currentBalance = 34500.00;
      }
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

    const matchesMfg = (mfgTarget: string, actual: string) => {
      const target = mfgTarget.toLowerCase();
      const act = actual.toLowerCase();
      if (target === "aci") {
        return act.includes("aci") || act.includes("advanced chemical");
      }
      if (target === "eskayef" || target === "sk+f" || target === "skf") {
        return act.includes("eskayef") || act.includes("sk+f") || act.includes("skf");
      }
      return act.includes(target);
    };

    let filtered: IMedicine[] = [];

    if (!q) {
      if (!mfg && !form) {
        filtered = this.medicines;
      } else {
        filtered = this.medicines.filter((m) => {
          if (mfg && !matchesMfg(mfg, m.manufacturer)) return false;
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
        if (mfg && !matchesMfg(mfg, m.manufacturer)) continue;
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

  // ===========================================================================
  // DISTRIBUTOR LOCATION & NEARBY INVENTORY SEARCH METHODS
  // ===========================================================================

  public distributors: IDistributorLocation[] = [...initialDistributors];
  public deliveryVehicles: ILiveDeliveryVehicle[] = [...initialDeliveryVehicles];

  public getDistributors(): IDistributorLocation[] {
    return this.distributors;
  }

  public getDistributor(id: string): IDistributorLocation | undefined {
    return this.distributors.find((d) => d.id === id);
  }

  /**
   * Searches for nearby distributors relative to a user pharmacy location,
   * calculating accurate distances, road drive times, and medicine availability.
   */
  public searchNearbyDistributors(
    userLat: number,
    userLng: number,
    radiusKm: number = 20,
    options: {
      medicineId?: string;
      search?: string;
      inStockOnly?: boolean;
      sortBy?: "distance" | "price" | "stock" | "delivery";
    } = {}
  ): IDistributorSearchResult[] {
    const { medicineId, search, inStockOnly = false, sortBy = "distance" } = options;

    // Resolve target medicine if requested
    let targetMedicine: IMedicine | undefined;
    if (medicineId) {
      targetMedicine = this.getMedicine(medicineId);
    } else if (search && search.trim().length > 0) {
      const results = this.searchMedicines(search.trim(), 1);
      if (results.length > 0) {
        targetMedicine = results[0];
      }
    }

    const results: IDistributorSearchResult[] = [];

    for (const dist of this.distributors) {
      const distanceStraightKm = GeoRoutingEngine.calculateHaversineDistance(
        userLat,
        userLng,
        dist.latitude,
        dist.longitude
      );

      // Filter by radius (if radiusKm > 0; 0 means "All")
      if (radiusKm > 0 && distanceStraightKm > radiusKm) {
        continue;
      }

      const roadMetrics = GeoRoutingEngine.estimateRoadMetrics(distanceStraightKm);
      const isWithinDeliveryZone = distanceStraightKm <= dist.coverageRadiusKm;

      let targetStock: IDistributorMedicineInventory | undefined;

      if (targetMedicine) {
        // Calculate stock metrics for target medicine at this depot
        const batches = this.getBatchesForMedicine(targetMedicine.id);
        const activeOffer = this.getOfferForMedicine(targetMedicine.id);
        const pieces = batches.reduce((acc, b) => acc + b.availableLooseUnits, 0);
        const piecesPerStrip = targetMedicine.piecesPerStrip || 10;
        const stripsPerBox = targetMedicine.stripsPerBox || 10;
        const totalPiecesPerBox = piecesPerStrip * stripsPerBox;
        const boxes = Math.floor(pieces / totalPiecesPerBox);
        const strips = Math.floor(pieces / piecesPerStrip);

        // Filter out if inStockOnly is requested and stock is zero
        if (inStockOnly && pieces <= 0) {
          continue;
        }

        const tradePricePerPiece = targetMedicine.tradePricePerPiece;
        const tradePricePerBox = Number((tradePricePerPiece * totalPiecesPerBox).toFixed(2));
        const mrpPerPiece = targetMedicine.mrpPerPiece;
        const mrpPerBox = Number((mrpPerPiece * totalPiecesPerBox).toFixed(2));

        const inStockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" =
          boxes >= 10 ? "IN_STOCK" : boxes > 0 ? "LOW_STOCK" : "OUT_OF_STOCK";

        targetStock = {
          medicineId: targetMedicine.id,
          code: targetMedicine.code,
          brandName: targetMedicine.brandName,
          genericName: targetMedicine.genericName,
          manufacturer: targetMedicine.manufacturer,
          dosageForm: targetMedicine.dosageForm,
          strength: targetMedicine.strength,
          packagingDesc: `${stripsPerBox} Strips × ${piecesPerStrip} Units (${totalPiecesPerBox} pcs/box)`,
          piecesPerStrip,
          stripsPerBox,
          tradePricePerPiece,
          tradePricePerBox,
          mrpPerPiece,
          mrpPerBox,
          availableStockPieces: pieces,
          availableStockBoxes: boxes,
          availableStockStrips: strips,
          minOrderQtyBoxes: 1,
          activeOffer,
          isColdChain: !!targetMedicine.requiresColdChain,
          nextBatchExpiry: batches[0]?.expiryDate
            ? new Date(batches[0].expiryDate).toISOString().slice(0, 10)
            : "2027-01-31",
          inStockStatus,
        };
      }

      // Check if there is an active delivery vehicle for this depot
      const activeLiveVehicle = this.deliveryVehicles.find(
        (v) => v.depotId === dist.id && v.isLiveSharing
      );

      results.push({
        distributor: dist,
        distanceStraightKm,
        distanceRoadKm: roadMetrics.roadKm,
        estimatedDriveTimeMinutes: roadMetrics.durationMinutes,
        isWithinDeliveryZone,
        targetMedicineStock: targetStock,
        totalCatalogSkusCount: this.medicines.length,
        activeLiveVehicle,
      });
    }

    // Apply sorting
    results.sort((a, b) => {
      if (sortBy === "price") {
        const priceA = a.targetMedicineStock?.tradePricePerBox ?? 999999;
        const priceB = b.targetMedicineStock?.tradePricePerBox ?? 999999;
        return priceA - priceB;
      }
      if (sortBy === "stock") {
        const stockA = a.targetMedicineStock?.availableStockBoxes ?? 0;
        const stockB = b.targetMedicineStock?.availableStockBoxes ?? 0;
        return stockB - stockA;
      }
      if (sortBy === "delivery") {
        return a.estimatedDriveTimeMinutes - b.estimatedDriveTimeMinutes;
      }
      // Default: nearest distance
      return a.distanceRoadKm - b.distanceRoadKm;
    });

    return results;
  }

  /**
   * Retrieves full authorized catalog inventory stocked by a specific distributor depot.
   */
  public getDistributorInventory(
    depotId: string,
    search: string = "",
    limit: number = 50
  ): IDistributorMedicineInventory[] {
    const q = search.toLowerCase().trim();
    let meds = this.medicines;

    if (q) {
      meds = meds.filter(
        (m) =>
          m.brandName.toLowerCase().includes(q) ||
          m.genericName.toLowerCase().includes(q) ||
          m.manufacturer.toLowerCase().includes(q) ||
          m.strength.toLowerCase().includes(q)
      );
    }

    const items: IDistributorMedicineInventory[] = [];

    for (const med of meds.slice(0, limit)) {
      const batches = this.getBatchesForMedicine(med.id);
      const activeOffer = this.getOfferForMedicine(med.id);
      const pieces = batches.reduce((acc, b) => acc + b.availableLooseUnits, 0);
      const piecesPerStrip = med.piecesPerStrip || 10;
      const stripsPerBox = med.stripsPerBox || 10;
      const totalPiecesPerBox = piecesPerStrip * stripsPerBox;
      const boxes = Math.floor(pieces / totalPiecesPerBox);
      const strips = Math.floor(pieces / piecesPerStrip);

      const tradePricePerPiece = med.tradePricePerPiece;
      const tradePricePerBox = Number((tradePricePerPiece * totalPiecesPerBox).toFixed(2));
      const mrpPerPiece = med.mrpPerPiece;
      const mrpPerBox = Number((mrpPerPiece * totalPiecesPerBox).toFixed(2));

      const inStockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" =
        boxes >= 10 ? "IN_STOCK" : boxes > 0 ? "LOW_STOCK" : "OUT_OF_STOCK";

      items.push({
        medicineId: med.id,
        code: med.code,
        brandName: med.brandName,
        genericName: med.genericName,
        manufacturer: med.manufacturer,
        dosageForm: med.dosageForm,
        strength: med.strength,
        packagingDesc: `${stripsPerBox} Strips × ${piecesPerStrip} Units (${totalPiecesPerBox} pcs/box)`,
        piecesPerStrip,
        stripsPerBox,
        tradePricePerPiece,
        tradePricePerBox,
        mrpPerPiece,
        mrpPerBox,
        availableStockPieces: pieces,
        availableStockBoxes: boxes,
        availableStockStrips: strips,
        minOrderQtyBoxes: 1,
        activeOffer,
        isColdChain: !!med.requiresColdChain,
        nextBatchExpiry: batches[0]?.expiryDate
          ? new Date(batches[0].expiryDate).toISOString().slice(0, 10)
          : "2027-01-31",
        inStockStatus,
      });
    }

    return items;
  }

  public getLiveDeliveryVehicles(depotId?: string): ILiveDeliveryVehicle[] {
    if (depotId) {
      return this.deliveryVehicles.filter((v) => v.depotId === depotId && v.isLiveSharing);
    }
    return this.deliveryVehicles.filter((v) => v.isLiveSharing);
  }

  public getDeliveryVehicle(id: string): ILiveDeliveryVehicle | undefined {
    return this.deliveryVehicles.find((v) => v.id === id);
  }
}

// Global persistence for Next.js hot-reloading
const globalForDb = globalThis as unknown as { medSupplyDb: MemoryDatabase };
export const db =
  globalForDb.medSupplyDb && typeof globalForDb.medSupplyDb.searchNearbyDistributors === "function"
    ? globalForDb.medSupplyDb
    : new MemoryDatabase();
if (process.env.NODE_ENV !== "production") globalForDb.medSupplyDb = db;
