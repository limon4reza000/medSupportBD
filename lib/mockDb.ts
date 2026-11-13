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
  ReturnStatus,
  IReturnRequest,
  IReturnItem,
  IOrderStatusHistory,
  IInvoice,
  IPharmacyStock,
  IStockMovement,
  INotification,
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


export const initialOrders: any[] = [
  // 1. Beximco Dispatched Order (Current month)
  {
    id: "ORD-20261111-BEX-7967",
    orderNumber: "ORD-20261111-BEX-7967",
    challanNumber: "CH-20261111-BEX-9102",
    companyId: "comp-bex",
    companyName: "Beximco Pharmaceuticals Ltd.",
    pharmacyId: "pharm-01",
    depotId: "depot-dhk-01",
    placedById: "user-sr-01",
    status: OrderStatus.DISPATCHED,
    grossAmount: 49000.00,
    tradeDiscountAmount: 1470.00,
    vatAmount: 720.00,
    netPayableAmount: 48250.00,
    totalLoosePieces: 2000,
    totalBonusPieces: 200,
    deliveryNotes: "Direct cold-chain delivery from Beximco Tejgaon Depot",
    assignedMPO: { name: "Tanvir Ahmed", phone: "+880 1711-223344", territory: "Dhanmondi North" },
    vanPlate: "DHK-METRO-CHA-11-2094",
    driverPhone: "+880 1711-223344",
    dispatchedAt: "2026-11-11T16:30:00.000Z",
    createdAt: "2026-11-11T15:20:00.000Z",
    items: [
      { medicineId: "med-01", medicineName: "Napa Extra 500mg+65mg", genericName: "Paracetamol + Caffeine", orderedBoxes: 100, unitTradePrice: 490.00, subtotal: 48250.00 }
    ],
  },
  // 2. Square Dispatched Order (Current month)
  {
    id: "ORD-20261110-SQU-8812",
    orderNumber: "ORD-20261110-SQU-8812",
    challanNumber: "CH-20261110-SQU-4401",
    companyId: "comp-squ",
    companyName: "Square Pharmaceuticals PLC",
    pharmacyId: "pharm-01",
    depotId: "depot-dhk-01",
    placedById: "user-sr-01",
    status: OrderStatus.DISPATCHED,
    grossAmount: 38000.00,
    tradeDiscountAmount: 1140.00,
    vatAmount: 340.00,
    netPayableAmount: 37200.00,
    totalLoosePieces: 1500,
    totalBonusPieces: 150,
    deliveryNotes: "Urgent morning delivery",
    assignedMPO: { name: "Mahmudul Hasan", phone: "+880 1712-334455", territory: "Dhanmondi Central" },
    vanPlate: "DHK-METRO-CHA-12-8819",
    driverPhone: "+880 1712-334455",
    dispatchedAt: "2026-11-10T11:00:00.000Z",
    createdAt: "2026-11-10T09:15:00.000Z",
    items: [
      { medicineId: "med-02", medicineName: "Seclo 20mg", genericName: "Omeprazole", orderedBoxes: 60, unitTradePrice: 500.00, subtotal: 30000.00 },
      { medicineId: "med-05", medicineName: "Monas 10mg", genericName: "Montelukast", orderedBoxes: 12, unitTradePrice: 600.00, subtotal: 7200.00 }
    ],
  },
  // 3. Square Packed Order (Current month)
  {
    id: "ORD-20261108-SQU-6621",
    orderNumber: "ORD-20261108-SQU-6621",
    challanNumber: "CH-20261108-SQU-1205",
    companyId: "comp-squ",
    companyName: "Square Pharmaceuticals PLC",
    pharmacyId: "pharm-01",
    depotId: "depot-dhk-01",
    placedById: "user-sr-01",
    status: OrderStatus.PACKED,
    grossAmount: 24500.00,
    tradeDiscountAmount: 735.00,
    vatAmount: 235.00,
    netPayableAmount: 24000.00,
    totalLoosePieces: 800,
    totalBonusPieces: 80,
    deliveryNotes: "Standard replenishment",
    assignedMPO: { name: "Mahmudul Hasan", phone: "+880 1712-334455", territory: "Dhanmondi Central" },
    createdAt: "2026-11-08T14:45:00.000Z",
    items: [
      { medicineId: "med-02", medicineName: "Seclo 20mg", genericName: "Omeprazole", orderedBoxes: 25, unitTradePrice: 500.00, subtotal: 12500.00 },
      { medicineId: "med-05", medicineName: "Monas 10mg", genericName: "Montelukast", orderedBoxes: 28, unitTradePrice: 600.00, subtotal: 11500.00 }
    ],
  },
  // 4. Incepta Allocated Order (Current month)
  {
    id: "ORD-20261106-INC-4419",
    orderNumber: "ORD-20261106-INC-4419",
    challanNumber: "CH-20261106-INC-8890",
    companyId: "comp-inc",
    companyName: "Incepta Pharmaceuticals Ltd.",
    pharmacyId: "pharm-01",
    depotId: "depot-dhk-01",
    placedById: "user-sr-01",
    status: OrderStatus.ALLOCATED,
    grossAmount: 25800.00,
    tradeDiscountAmount: 774.00,
    vatAmount: 24.00,
    netPayableAmount: 25050.00,
    totalLoosePieces: 1000,
    totalBonusPieces: 100,
    deliveryNotes: "Batch verification required",
    assignedMPO: { name: "Zubair Rahman", phone: "+880 1819-556677", territory: "Dhanmondi South" },
    createdAt: "2026-11-06T10:30:00.000Z",
    items: [
      { medicineId: "med-03", medicineName: "Pantobex 20mg", genericName: "Pantoprazole", orderedBoxes: 50, unitTradePrice: 501.00, subtotal: 25050.00 }
    ],
  },
  // 5. Renata Submitted Order (Current month)
  {
    id: "ORD-20261104-REN-3301",
    orderNumber: "ORD-20261104-REN-3301",
    challanNumber: "CH-20261104-REN-5512",
    companyId: "comp-ren",
    companyName: "Renata Limited",
    pharmacyId: "pharm-01",
    depotId: "depot-dhk-01",
    placedById: "user-sr-01",
    status: OrderStatus.SUBMITTED,
    grossAmount: 14400.00,
    tradeDiscountAmount: 432.00,
    vatAmount: 32.00,
    netPayableAmount: 14000.00,
    totalLoosePieces: 600,
    totalBonusPieces: 60,
    deliveryNotes: "Afternoon delivery slot",
    assignedMPO: { name: "Anisur Rahman", phone: "+880 1911-778899", territory: "Dhanmondi West" },
    createdAt: "2026-11-04T12:00:00.000Z",
    items: [
      { medicineId: "med-04", medicineName: "Sergel 20mg", genericName: "Esomeprazole", orderedBoxes: 28, unitTradePrice: 500.00, subtotal: 14000.00 }
    ],
  },
  // 6. October 2026 Delivered Orders (Total = 132,100.00)
  {
    id: "ORD-20261025-SQU-9901",
    orderNumber: "ORD-20261025-SQU-9901",
    challanNumber: "CH-20261025-SQU-3312",
    companyId: "comp-squ",
    companyName: "Square Pharmaceuticals PLC",
    pharmacyId: "pharm-01",
    depotId: "depot-dhk-01",
    placedById: "user-sr-01",
    status: OrderStatus.DELIVERED,
    grossAmount: 55000.00,
    tradeDiscountAmount: 1650.00,
    vatAmount: 150.00,
    netPayableAmount: 53500.00,
    totalLoosePieces: 2200,
    totalBonusPieces: 220,
    createdAt: "2026-10-25T11:20:00.000Z",
    items: [
      { medicineId: "med-02", medicineName: "Seclo 20mg", genericName: "Omeprazole", orderedBoxes: 107, unitTradePrice: 500.00, subtotal: 53500.00 }
    ],
  },
  {
    id: "ORD-20261018-BEX-7712",
    orderNumber: "ORD-20261018-BEX-7712",
    challanNumber: "CH-20261018-BEX-9014",
    companyId: "comp-bex",
    companyName: "Beximco Pharmaceuticals Ltd.",
    pharmacyId: "pharm-01",
    depotId: "depot-dhk-01",
    placedById: "user-sr-01",
    status: OrderStatus.DELIVERED,
    grossAmount: 48000.00,
    tradeDiscountAmount: 1440.00,
    vatAmount: 40.00,
    netPayableAmount: 46600.00,
    totalLoosePieces: 1900,
    totalBonusPieces: 190,
    createdAt: "2026-10-18T14:10:00.000Z",
    items: [
      { medicineId: "med-01", medicineName: "Napa Extra 500mg+65mg", genericName: "Paracetamol + Caffeine", orderedBoxes: 95, unitTradePrice: 490.52, subtotal: 46600.00 }
    ],
  },
  {
    id: "ORD-20261008-INC-5510",
    orderNumber: "ORD-20261008-INC-5510",
    challanNumber: "CH-20261008-INC-2201",
    companyId: "comp-inc",
    companyName: "Incepta Pharmaceuticals Ltd.",
    pharmacyId: "pharm-01",
    depotId: "depot-dhk-01",
    placedById: "user-sr-01",
    status: OrderStatus.DELIVERED,
    grossAmount: 33000.00,
    tradeDiscountAmount: 1000.00,
    vatAmount: 0.00,
    netPayableAmount: 32000.00,
    totalLoosePieces: 1200,
    totalBonusPieces: 120,
    createdAt: "2026-10-08T09:40:00.000Z",
    items: [
      { medicineId: "med-03", medicineName: "Pantobex 20mg", genericName: "Pantoprazole", orderedBoxes: 64, unitTradePrice: 500.00, subtotal: 32000.00 }
    ],
  },
  // 7. September 2026 Delivered Orders (Total = 139,000.00)
  {
    id: "ORD-20260920-SQU-4412",
    orderNumber: "ORD-20260920-SQU-4412",
    challanNumber: "CH-20260920-SQU-1109",
    companyId: "comp-squ",
    companyName: "Square Pharmaceuticals PLC",
    pharmacyId: "pharm-01",
    depotId: "depot-dhk-01",
    placedById: "user-sr-01",
    status: OrderStatus.DELIVERED,
    grossAmount: 72000.00,
    tradeDiscountAmount: 2160.00,
    vatAmount: 160.00,
    netPayableAmount: 70000.00,
    createdAt: "2026-09-20T10:00:00.000Z",
    items: [
      { medicineId: "med-02", medicineName: "Seclo 20mg", genericName: "Omeprazole", orderedBoxes: 140, unitTradePrice: 500.00, subtotal: 70000.00 }
    ],
  },
  {
    id: "ORD-20260910-BEX-3319",
    orderNumber: "ORD-20260910-BEX-3319",
    challanNumber: "CH-20260910-BEX-8812",
    companyId: "comp-bex",
    companyName: "Beximco Pharmaceuticals Ltd.",
    pharmacyId: "pharm-01",
    depotId: "depot-dhk-01",
    placedById: "user-sr-01",
    status: OrderStatus.DELIVERED,
    grossAmount: 71000.00,
    tradeDiscountAmount: 2000.00,
    vatAmount: 0.00,
    netPayableAmount: 69000.00,
    createdAt: "2026-09-10T15:30:00.000Z",
    items: [
      { medicineId: "med-01", medicineName: "Napa Extra 500mg+65mg", genericName: "Paracetamol + Caffeine", orderedBoxes: 140, unitTradePrice: 492.85, subtotal: 69000.00 }
    ],
  },
  // 8. August 2026 Delivered Orders (Total = 118,200.00)
  {
    id: "ORD-20260815-INC-8812",
    orderNumber: "ORD-20260815-INC-8812",
    challanNumber: "CH-20260815-INC-3341",
    companyId: "comp-inc",
    companyName: "Incepta Pharmaceuticals Ltd.",
    pharmacyId: "pharm-01",
    depotId: "depot-dhk-01",
    placedById: "user-sr-01",
    status: OrderStatus.DELIVERED,
    grossAmount: 122000.00,
    tradeDiscountAmount: 3800.00,
    vatAmount: 0.00,
    netPayableAmount: 118200.00,
    createdAt: "2026-08-15T11:00:00.000Z",
    items: [
      { medicineId: "med-03", medicineName: "Pantobex 20mg", genericName: "Pantoprazole", orderedBoxes: 236, unitTradePrice: 500.84, subtotal: 118200.00 }
    ],
  },
  // 9. July 2026 Delivered Orders (Total = 125,400.00)
  {
    id: "ORD-20260714-SQU-1102",
    orderNumber: "ORD-20260714-SQU-1102",
    challanNumber: "CH-20260714-SQU-7788",
    companyId: "comp-squ",
    companyName: "Square Pharmaceuticals PLC",
    pharmacyId: "pharm-01",
    depotId: "depot-dhk-01",
    placedById: "user-sr-01",
    status: OrderStatus.DELIVERED,
    grossAmount: 129000.00,
    tradeDiscountAmount: 3600.00,
    vatAmount: 0.00,
    netPayableAmount: 125400.00,
    createdAt: "2026-07-14T10:15:00.000Z",
    items: [
      { medicineId: "med-02", medicineName: "Seclo 20mg", genericName: "Omeprazole", orderedBoxes: 250, unitTradePrice: 501.60, subtotal: 125400.00 }
    ],
  },
  // 10. June 2026 Delivered Orders (Total = 112,000.00)
  {
    id: "ORD-20260620-BEX-2201",
    orderNumber: "ORD-20260620-BEX-2201",
    challanNumber: "CH-20260620-BEX-6611",
    companyId: "comp-bex",
    companyName: "Beximco Pharmaceuticals Ltd.",
    pharmacyId: "pharm-01",
    depotId: "depot-dhk-01",
    placedById: "user-sr-01",
    status: OrderStatus.DELIVERED,
    grossAmount: 115000.00,
    tradeDiscountAmount: 3000.00,
    vatAmount: 0.00,
    netPayableAmount: 112000.00,
    createdAt: "2026-06-20T16:00:00.000Z",
    items: [
      { medicineId: "med-01", medicineName: "Napa Extra 500mg+65mg", genericName: "Paracetamol + Caffeine", orderedBoxes: 228, unitTradePrice: 491.22, subtotal: 112000.00 }
    ],
  },
  // 11. Early 2026 Consolidated Orders (Jan - May 2026: Total = 645,600.00)
  {
    id: "ORD-20260115-EARLY-001",
    orderNumber: "ORD-20260115-EARLY-001",
    challanNumber: "CH-20260115-EARLY-001",
    companyId: "comp-squ",
    companyName: "Square Pharmaceuticals PLC",
    pharmacyId: "pharm-01",
    depotId: "depot-dhk-01",
    placedById: "user-sr-01",
    status: OrderStatus.DELIVERED,
    grossAmount: 112000.00,
    tradeDiscountAmount: 2000.00,
    vatAmount: 0.00,
    netPayableAmount: 110000.00,
    createdAt: "2026-01-15T12:00:00.000Z",
    items: [
      { medicineId: "med-02", medicineName: "Seclo 20mg", genericName: "Omeprazole", orderedBoxes: 220, unitTradePrice: 500.00, subtotal: 110000.00 }
    ],
  },
  {
    id: "ORD-20260218-EARLY-002",
    orderNumber: "ORD-20260218-EARLY-002",
    challanNumber: "CH-20260218-EARLY-002",
    companyId: "comp-bex",
    companyName: "Beximco Pharmaceuticals Ltd.",
    pharmacyId: "pharm-01",
    depotId: "depot-dhk-01",
    placedById: "user-sr-01",
    status: OrderStatus.DELIVERED,
    grossAmount: 118000.00,
    tradeDiscountAmount: 3000.00,
    vatAmount: 0.00,
    netPayableAmount: 115000.00,
    createdAt: "2026-02-18T10:30:00.000Z",
    items: [
      { medicineId: "med-01", medicineName: "Napa Extra 500mg+65mg", genericName: "Paracetamol + Caffeine", orderedBoxes: 234, unitTradePrice: 491.45, subtotal: 115000.00 }
    ],
  },
  {
    id: "ORD-20260310-EARLY-003",
    orderNumber: "ORD-20260310-EARLY-003",
    challanNumber: "CH-20260310-EARLY-003",
    companyId: "comp-squ",
    companyName: "Square Pharmaceuticals PLC",
    pharmacyId: "pharm-01",
    depotId: "depot-dhk-01",
    placedById: "user-sr-01",
    status: OrderStatus.DELIVERED,
    grossAmount: 139000.00,
    tradeDiscountAmount: 4000.00,
    vatAmount: 0.00,
    netPayableAmount: 135000.00,
    createdAt: "2026-03-10T12:00:00.000Z",
    items: [
      { medicineId: "med-02", medicineName: "Seclo 20mg", genericName: "Omeprazole", orderedBoxes: 270, unitTradePrice: 500.00, subtotal: 135000.00 }
    ],
  },
  {
    id: "ORD-20260412-EARLY-004",
    orderNumber: "ORD-20260412-EARLY-004",
    challanNumber: "CH-20260412-EARLY-004",
    companyId: "comp-inc",
    companyName: "Incepta Pharmaceuticals Ltd.",
    pharmacyId: "pharm-01",
    depotId: "depot-dhk-01",
    placedById: "user-sr-01",
    status: OrderStatus.DELIVERED,
    grossAmount: 144000.00,
    tradeDiscountAmount: 4000.00,
    vatAmount: 0.00,
    netPayableAmount: 140000.00,
    createdAt: "2026-04-12T11:15:00.000Z",
    items: [
      { medicineId: "med-03", medicineName: "Pantobex 20mg", genericName: "Pantoprazole", orderedBoxes: 280, unitTradePrice: 500.00, subtotal: 140000.00 }
    ],
  },
  {
    id: "ORD-20260515-EARLY-005",
    orderNumber: "ORD-20260515-EARLY-005",
    challanNumber: "CH-20260515-EARLY-005",
    companyId: "comp-squ",
    companyName: "Square Pharmaceuticals PLC",
    pharmacyId: "pharm-01",
    depotId: "depot-dhk-01",
    placedById: "user-sr-01",
    status: OrderStatus.DELIVERED,
    grossAmount: 150000.00,
    tradeDiscountAmount: 4400.00,
    vatAmount: 0.00,
    netPayableAmount: 145600.00,
    createdAt: "2026-05-15T14:00:00.000Z",
    items: [
      { medicineId: "med-02", medicineName: "Seclo 20mg", genericName: "Omeprazole", orderedBoxes: 291, unitTradePrice: 500.34, subtotal: 145600.00 }
    ],
  },
  // 11b. December 2026 Projected Delivered Order (Completing 12-Month Calendar Cycle)
  {
    id: "ORD-20261215-DEC-001",
    orderNumber: "ORD-20261215-DEC-001",
    challanNumber: "CH-20261215-DEC-001",
    companyId: "comp-squ",
    companyName: "Square Pharmaceuticals PLC",
    pharmacyId: "pharm-01",
    depotId: "depot-dhk-01",
    placedById: "user-sr-01",
    status: OrderStatus.DELIVERED,
    grossAmount: 128000.00,
    tradeDiscountAmount: 3000.00,
    vatAmount: 0.00,
    netPayableAmount: 125000.00,
    createdAt: "2026-12-15T12:00:00.000Z",
    items: [
      { medicineId: "med-02", medicineName: "Seclo 20mg", genericName: "Omeprazole", orderedBoxes: 250, unitTradePrice: 500.00, subtotal: 125000.00 }
    ],
  },
  // 12. Dispatched van order for Beximco
  {
    id: "ORD-20261111-BEX-002",
    orderNumber: "ORD-20261111-BEX-002",
    challanNumber: "CH-BEX-20261111-002",
    companyId: "comp-beximco",
    companyName: "Beximco Pharmaceuticals Ltd.",
    pharmacyId: "pharm-01",
    depotId: "depot-dhk-01",
    placedById: "user-sr-01",
    status: OrderStatus.DISPATCHED,
    grossAmount: 4350.00,
    tradeDiscountAmount: 0.00,
    vatAmount: 0.00,
    netPayableAmount: 4350.00,
    createdAt: "2026-11-11T12:00:00.000Z",
    items: [
      { medicineId: "med-01", medicineName: "Napa Extra", genericName: "Paracetamol", orderedBoxes: 10, unitTradePrice: 435.00, subtotal: 4350.00 }
    ],
  },
  // 13. Square Allocated order
  {
    id: "ORD-20261111-SQU-001",
    orderNumber: "ORD-20261111-SQU-001",
    challanNumber: "CH-SQU-20261111-001",
    companyId: "comp-square",
    companyName: "Square Pharmaceuticals PLC",
    pharmacyId: "pharm-01",
    depotId: "depot-dhk-01",
    placedById: "user-sr-01",
    status: OrderStatus.ALLOCATED,
    grossAmount: 5400.00,
    tradeDiscountAmount: 0.00,
    vatAmount: 0.00,
    netPayableAmount: 5400.00,
    createdAt: "2026-11-11T11:00:00.000Z",
    items: [
      { medicineId: "med-02", medicineName: "Seclo 20", genericName: "Omeprazole", orderedBoxes: 10, unitTradePrice: 540.00, subtotal: 5400.00 }
    ],
  },
  // 14. Second submitted order
  {
    id: "ORD-20261111-REN-009",
    orderNumber: "ORD-20261111-REN-009",
    challanNumber: "CH-REN-20261111-009",
    companyId: "comp-ren",
    companyName: "Renata Limited",
    pharmacyId: "pharm-01",
    depotId: "depot-dhk-01",
    placedById: "user-sr-01",
    status: OrderStatus.SUBMITTED,
    grossAmount: 6000.00,
    tradeDiscountAmount: 0.00,
    vatAmount: 0.00,
    netPayableAmount: 6000.00,
    createdAt: "2026-11-11T10:00:00.000Z",
    items: [
      { medicineId: "med-04", medicineName: "Sergel 20mg", genericName: "Esomeprazole", orderedBoxes: 12, unitTradePrice: 500.00, subtotal: 6000.00 }
    ],
  }
];

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

// Initial Invoices with Mushak-6.3 tax attributes
export const initialInvoices: IInvoice[] = [
  {
    id: "inv-001",
    invoiceNumber: "INV-20261111-BEX-7967",
    orderId: "ORD-20261111-BEX-7967",
    orderNumber: "ORD-20261111-BEX-7967",
    challanNumber: "CH-20261111-BEX-9102",
    pharmacyId: "pharm-01",
    pharmacyName: "Green Care Pharmacy & Med Store",
    companyName: "Beximco Pharmaceuticals Ltd.",
    totalGross: 49000.00,
    discountTotal: 1470.00,
    vatTotal: 720.00,
    netPayable: 48250.00,
    paidAmount: 0.00,
    dueAmount: 48250.00,
    status: PaymentStatus.UNPAID,
    dueDate: "2026-12-11T15:20:00.000Z",
    issuedAt: "2026-11-11T15:20:00.000Z",
    items: [
      {
        medicineId: "med-01",
        brandName: "Napa Extra 500mg+65mg",
        packSize: "20 Strips/Box (200 Tablets)",
        batchNumber: "BEX-NP-2024-88",
        expiryDate: "2027-04-30",
        orderedQty: 100,
        unitTradePrice: 490.00,
        grossAmount: 49000.00,
        bonusQty: 10,
        vatAmount: 720.00,
        netItemTotal: 48250.00,
      }
    ]
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-20261110-SQU-8812",
    orderId: "ORD-20261110-SQU-8812",
    orderNumber: "ORD-20261110-SQU-8812",
    challanNumber: "CH-20261110-SQU-4401",
    pharmacyId: "pharm-01",
    pharmacyName: "Green Care Pharmacy & Med Store",
    companyName: "Square Pharmaceuticals PLC",
    totalGross: 38000.00,
    discountTotal: 1140.00,
    vatTotal: 340.00,
    netPayable: 37200.00,
    paidAmount: 37200.00,
    dueAmount: 0.00,
    status: PaymentStatus.PAID,
    dueDate: "2026-12-10T11:00:00.000Z",
    issuedAt: "2026-11-10T11:00:00.000Z",
    items: [
      {
        medicineId: "med-02",
        brandName: "Ace Plus 500mg+65mg",
        packSize: "20 Strips/Box (200 Tablets)",
        batchNumber: "SQU-AC-2024-05",
        expiryDate: "2027-01-30",
        orderedQty: 50,
        unitTradePrice: 490.00,
        grossAmount: 24500.00,
        bonusQty: 5,
        vatAmount: 200.00,
        netItemTotal: 23900.00,
      },
      {
        medicineId: "med-03",
        brandName: "Seclo 20mg Capsule",
        packSize: "30 Strips/Box (300 Capsules)",
        batchNumber: "SQU-SC-2024-12",
        expiryDate: "2027-02-15",
        orderedQty: 8,
        unitTradePrice: 1750.00,
        grossAmount: 14000.00,
        bonusQty: 0,
        vatAmount: 140.00,
        netItemTotal: 13300.00,
      }
    ]
  },
  {
    id: "inv-003",
    invoiceNumber: "INV-20261108-REN-1102",
    orderId: "ORD-20261108-REN-1102",
    orderNumber: "ORD-20261108-REN-1102",
    challanNumber: "CH-20261108-REN-3301",
    pharmacyId: "pharm-01",
    pharmacyName: "Green Care Pharmacy & Med Store",
    companyName: "Renata Limited",
    totalGross: 14500.00,
    discountTotal: 0.00,
    vatTotal: 0.00,
    netPayable: 14500.00,
    paidAmount: 5000.00,
    dueAmount: 9500.00,
    status: PaymentStatus.PARTIALLY_PAID,
    dueDate: "2026-12-08T14:00:00.000Z",
    issuedAt: "2026-11-08T14:00:00.000Z",
    items: [
      {
        medicineId: "med-06",
        brandName: "Zimax 500mg Tablet",
        packSize: "10 Strips/Box (60 Tablets)",
        batchNumber: "REN-ZX-2024-19",
        expiryDate: "2027-05-30",
        orderedQty: 10,
        unitTradePrice: 1450.00,
        grossAmount: 14500.00,
        bonusQty: 0,
        vatAmount: 0.00,
        netItemTotal: 14500.00,
      }
    ]
  }
];

// Order Status Progression History
export const initialOrderStatusHistory: IOrderStatusHistory[] = [
  {
    id: "osh-001",
    orderId: "ORD-20261111-BEX-7967",
    status: OrderStatus.ALLOCATED,
    notes: "Order confirmed and FEFO batches allocated at Beximco Tejgaon Hub",
    changedBy: "Tanvir Ahmed (MPO)",
    createdAt: "2026-11-11T15:20:00.000Z",
  },
  {
    id: "osh-002",
    orderId: "ORD-20261111-BEX-7967",
    status: OrderStatus.DISPATCHED,
    notes: "Loaded into Delivery Vehicle DHK-METRO-CHA-11-2094 with cold-chain monitoring active",
    changedBy: "System Dispatcher",
    createdAt: "2026-11-11T16:30:00.000Z",
  },
  {
    id: "osh-003",
    orderId: "ORD-20261110-SQU-8812",
    status: OrderStatus.ALLOCATED,
    notes: "Order accepted by Square Pharma Dhanmondi Depot",
    changedBy: "Mahmudul Hasan (MPO)",
    createdAt: "2026-11-10T11:00:00.000Z",
  },
  {
    id: "osh-004",
    orderId: "ORD-20261110-SQU-8812",
    status: OrderStatus.DISPATCHED,
    notes: "En route to pharmacy via van DHK-METRO-CHA-12-8819",
    changedBy: "Depot Manager",
    createdAt: "2026-11-10T12:15:00.000Z",
  },
  {
    id: "osh-005",
    orderId: "ORD-20261110-SQU-8812",
    status: OrderStatus.DELIVERED,
    notes: "Delivered & verified by Dr. Rafiqul Islam (Pharmacy Owner)",
    changedBy: "Dr. Rafiqul Islam",
    createdAt: "2026-11-10T14:45:00.000Z",
  }
];

// Initial Pharmacy Physical Stockroom Inventory
export const initialPharmacyStocks: IPharmacyStock[] = [
  {
    id: "pstk-01",
    pharmacyId: "pharm-01",
    medicineId: "med-01",
    brandName: "Napa Extra 500mg+65mg",
    genericName: "Paracetamol + Caffeine",
    manufacturer: "Beximco Pharmaceuticals Ltd.",
    dosageForm: "Tablet",
    strength: "500mg + 65mg",
    batchNumber: "BEX-NP-2024-88",
    expiryDate: "2027-04-30",
    quantity: 45, // 45 boxes in stock
    packagingUnit: PackagingUnit.BOX,
    mrp: 600.00,
    costPrice: 490.00,
    isLowStock: false,
    isNearExpiry: false,
    updatedAt: "2026-11-11T17:00:00Z",
  },
  {
    id: "pstk-02",
    pharmacyId: "pharm-01",
    medicineId: "med-03",
    brandName: "Seclo 20mg Capsule",
    genericName: "Omeprazole",
    manufacturer: "Square Pharmaceuticals PLC",
    dosageForm: "Capsule",
    strength: "20mg",
    batchNumber: "SQU-SC-2024-12",
    expiryDate: "2027-02-15",
    quantity: 28,
    packagingUnit: PackagingUnit.BOX,
    mrp: 2100.00,
    costPrice: 1750.00,
    isLowStock: false,
    isNearExpiry: false,
    updatedAt: "2026-11-10T15:00:00Z",
  },
  {
    id: "pstk-03",
    pharmacyId: "pharm-01",
    medicineId: "med-02",
    brandName: "Ace Plus 500mg+65mg",
    genericName: "Paracetamol + Caffeine",
    manufacturer: "Square Pharmaceuticals PLC",
    dosageForm: "Tablet",
    strength: "500mg + 65mg",
    batchNumber: "SQU-AC-2024-05",
    expiryDate: "2026-12-30", // Near expiry (approx 45 days)
    quantity: 8, // Low Stock alert (< 10)
    packagingUnit: PackagingUnit.BOX,
    mrp: 600.00,
    costPrice: 490.00,
    isLowStock: true,
    isNearExpiry: true,
    updatedAt: "2026-11-09T11:00:00Z",
  },
  {
    id: "pstk-04",
    pharmacyId: "pharm-01",
    medicineId: "med-04",
    brandName: "Sergel 20mg",
    genericName: "Esomeprazole",
    manufacturer: "Healthcare Pharmaceuticals Ltd.",
    dosageForm: "Capsule",
    strength: "20mg",
    batchNumber: "HEALTH-SG-2024-91",
    expiryDate: "2027-08-20",
    quantity: 35,
    packagingUnit: PackagingUnit.BOX,
    mrp: 2400.00,
    costPrice: 2000.00,
    isLowStock: false,
    isNearExpiry: false,
    updatedAt: "2026-11-08T09:30:00Z",
  },
  {
    id: "pstk-05",
    pharmacyId: "pharm-01",
    medicineId: "med-05",
    brandName: "Monas 10mg",
    genericName: "Montelukast",
    manufacturer: "The ACME Laboratories Ltd.",
    dosageForm: "Tablet",
    strength: "10mg",
    batchNumber: "ACME-MN-2024-34",
    expiryDate: "2027-06-10",
    quantity: 18,
    packagingUnit: PackagingUnit.BOX,
    mrp: 900.00,
    costPrice: 750.00,
    isLowStock: false,
    isNearExpiry: false,
    updatedAt: "2026-11-07T14:00:00Z",
  },
  {
    id: "pstk-06",
    pharmacyId: "pharm-01",
    medicineId: "med-06",
    brandName: "Ciprocin 500mg",
    genericName: "Ciprofloxacin",
    manufacturer: "Square Pharmaceuticals PLC",
    dosageForm: "Tablet",
    strength: "500mg",
    batchNumber: "SQU-CP-2024-77",
    expiryDate: "2027-01-10",
    quantity: 4, // Low Stock Alert!
    packagingUnit: PackagingUnit.BOX,
    mrp: 1400.00,
    costPrice: 1150.00,
    isLowStock: true,
    isNearExpiry: false,
    updatedAt: "2026-11-06T18:00:00Z",
  }
];

// Initial Stock Movements Audit History
export const initialStockMovements: IStockMovement[] = [
  {
    id: "smov-001",
    pharmacyId: "pharm-01",
    stockId: "pstk-01",
    medicineName: "Napa Extra 500mg+65mg",
    batchNumber: "BEX-NP-2024-88",
    movementType: "INTAKE_DELIVERY",
    quantityDelta: 50,
    balanceAfter: 50,
    reason: "Delivered wholesale order ORD-20261105-BEX-001 from Beximco",
    referenceId: "ORD-20261105-BEX-001",
    createdAt: "2026-11-06T10:00:00Z",
  },
  {
    id: "smov-002",
    pharmacyId: "pharm-01",
    stockId: "pstk-01",
    medicineName: "Napa Extra 500mg+65mg",
    batchNumber: "BEX-NP-2024-88",
    movementType: "POS_SALE",
    quantityDelta: -5,
    balanceAfter: 45,
    reason: "Retail counter sales dispatch",
    referenceId: "POS-20261110-091",
    createdAt: "2026-11-10T16:30:00Z",
  },
  {
    id: "smov-003",
    pharmacyId: "pharm-01",
    stockId: "pstk-03",
    medicineName: "Ace Plus 500mg+65mg",
    batchNumber: "SQU-AC-2024-05",
    movementType: "POS_SALE",
    quantityDelta: -12,
    balanceAfter: 8,
    reason: "Prescription fulfillment batch sale",
    referenceId: "POS-20261111-014",
    createdAt: "2026-11-11T12:00:00Z",
  }
];

// Initial Return Claims
export const initialReturnRequests: IReturnRequest[] = [
  {
    id: "ret-001",
    returnNumber: "RET-2026-0041",
    pharmacyId: "pharm-01",
    orderId: "ORD-20261110-SQU-8812",
    orderNumber: "ORD-20261110-SQU-8812",
    companyName: "Square Pharmaceuticals PLC",
    reason: "DAMAGED_PACKAGING",
    notes: "Carton arrived wet with 3 crushed blister boxes. Not fit for retail dispense.",
    status: ReturnStatus.APPROVED,
    totalAmount: 1470.00,
    reviewedById: "Mahmudul Hasan (Square MPO)",
    createdAt: "2026-11-10T16:00:00Z",
    updatedAt: "2026-11-11T09:30:00Z",
    items: [
      {
        id: "ritm-01",
        returnId: "ret-001",
        medicineId: "med-02",
        brandName: "Ace Plus 500mg+65mg",
        batchNumber: "SQU-AC-2024-05",
        quantity: 3,
        unitPrice: 490.00,
        totalRefund: 1470.00,
      }
    ]
  },
  {
    id: "ret-002",
    returnNumber: "RET-2026-0042",
    pharmacyId: "pharm-01",
    orderId: "ORD-20261108-REN-1102",
    orderNumber: "ORD-20261108-REN-1102",
    companyName: "Renata Limited",
    reason: "NEAR_EXPIRY",
    notes: "Batch expiry within 60 days per company trade return policy.",
    status: ReturnStatus.SUBMITTED,
    totalAmount: 2900.00,
    createdAt: "2026-11-12T11:00:00Z",
    updatedAt: "2026-11-12T11:00:00Z",
    items: [
      {
        id: "ritm-02",
        returnId: "ret-002",
        medicineId: "med-06",
        brandName: "Zimax 500mg Tablet",
        batchNumber: "REN-ZX-2024-19",
        quantity: 2,
        unitPrice: 1450.00,
        totalRefund: 2900.00,
      }
    ]
  }
];

// Initial System & Business Notifications
export const initialNotifications: INotification[] = [
  {
    id: "notif-001",
    pharmacyId: "pharm-01",
    title: "Order Dispatched — Beximco Hub",
    message: "Order ORD-20261111-BEX-7967 is en route with live temperature control.",
    type: "STATUS_CHANGE",
    metadata: { orderId: "ORD-20261111-BEX-7967" },
    isRead: false,
    createdAt: "2026-11-11T16:30:00Z",
  },
  {
    id: "notif-002",
    pharmacyId: "pharm-01",
    title: "Return Claim Approved",
    message: "Square Pharma approved RET-2026-0041 (৳1,470.00). Ledger credited.",
    type: "RETURN_APPROVED",
    metadata: { returnId: "ret-001" },
    isRead: false,
    createdAt: "2026-11-11T09:30:00Z",
  },
  {
    id: "notif-003",
    pharmacyId: "pharm-01",
    title: "Stock Alert — Low Inventory",
    message: "Ace Plus and Ciprocin 500mg have reached reorder thresholds.",
    type: "STOCK_ALERT",
    isRead: true,
    createdAt: "2026-11-10T08:00:00Z",
  }
];


// In-Memory Database Singleton with O(1) Map indexing for high performance
class MemoryDatabase {
  public medicines: IMedicine[] = [...initialMedicines];
  public batches: IBatch[] = [...initialBatches];
  public tradeOffers: ITradeOffer[] = [...initialTradeOffers];
  public pharmacies: IPharmacy[] = [...initialPharmacies];
  public ledgerEntries: LedgerEntry[] = [...initialLedgerEntries];
  public orders: any[] = [...initialOrders];
  public invoices: IInvoice[] = [...initialInvoices];
  public orderStatusHistory: IOrderStatusHistory[] = [...initialOrderStatusHistory];
  public pharmacyStocks: IPharmacyStock[] = [...initialPharmacyStocks];
  public stockMovements: IStockMovement[] = [...initialStockMovements];
  public returnRequests: IReturnRequest[] = [...initialReturnRequests];
  public notifications: INotification[] = [...initialNotifications];

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
      const piecesPerStrip = med.piecesPerStrip || 10;
      const stripsPerBox = med.stripsPerBox || 10;
      const totalPiecesPerBox = piecesPerStrip * stripsPerBox;
      const pieces = batches.reduce((acc, b) => acc + b.availableLooseUnits, 0);
      const boxes = Math.floor(pieces / (totalPiecesPerBox || 100));
      const strips = Math.floor((pieces % (totalPiecesPerBox || 100)) / (piecesPerStrip || 10));
      const sortedBatches = batches.slice().sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
      const nextBatchExpiry = sortedBatches[0]?.expiryDate
        ? new Date(sortedBatches[0].expiryDate).toISOString().slice(0, 10)
        : "2027-01-31";

      return {
        ...med,
        availableStockPieces: pieces,
        availableStockBoxes: boxes,
        availableBoxes: boxes,
        availableStockStrips: strips,
        nextBatchExpiry,
        expiryDate: nextBatchExpiry,
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

  // --------------------------------------------------------------------------
  // INVOICES & CHALLANS
  // --------------------------------------------------------------------------
  public getInvoices(pharmacyId?: string): IInvoice[] {
    if (pharmacyId) {
      return this.invoices.filter((inv) => inv.pharmacyId === pharmacyId);
    }
    return this.invoices;
  }

  public getInvoice(id: string): IInvoice | undefined {
    return this.invoices.find((inv) => inv.id === id || inv.invoiceNumber === id || inv.orderId === id || inv.orderNumber === id);
  }

  public addInvoice(invoice: IInvoice): void {
    this.invoices.unshift(invoice);
  }

  public payInvoice(invoiceId: string, amount: number): boolean {
    const inv = this.invoices.find((i) => i.id === invoiceId || i.invoiceNumber === invoiceId);
    if (!inv) return false;
    inv.paidAmount = Number((inv.paidAmount + amount).toFixed(2));
    inv.dueAmount = Math.max(0, Number((inv.netPayable - inv.paidAmount).toFixed(2)));
    if (inv.dueAmount <= 0) {
      inv.status = PaymentStatus.PAID;
    } else {
      inv.status = PaymentStatus.PARTIALLY_PAID;
    }
    return true;
  }

  // --------------------------------------------------------------------------
  // ORDER STATUS HISTORY & PROGRESSION
  // --------------------------------------------------------------------------
  public getOrderStatusHistory(orderId: string): IOrderStatusHistory[] {
    return this.orderStatusHistory.filter((h) => h.orderId === orderId);
  }

  public addOrderStatusHistory(entry: IOrderStatusHistory): void {
    this.orderStatusHistory.push(entry);
  }

  public updateOrderStatus(orderId: string, status: OrderStatus, notes?: string, changedBy?: string): boolean {
    const order = this.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return false;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    
    // Add history log
    this.addOrderStatusHistory({
      id: `osh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderId: order.id,
      status,
      notes: notes || `Status changed to ${status}`,
      changedBy: changedBy || "System",
      createdAt: new Date().toISOString(),
    });

    // Auto-intake to pharmacy stockroom if marked DELIVERED
    if (status === OrderStatus.DELIVERED) {
      order.deliveredDate = new Date().toISOString();
      this.addDeliveredOrderToPharmacyStock(order);
    }

    return true;
  }

  // --------------------------------------------------------------------------
  // PHARMACY STOCKROOM INVENTORY & MOVEMENTS
  // --------------------------------------------------------------------------
  public getPharmacyStock(pharmacyId: string = "pharm-01"): IPharmacyStock[] {
    return this.pharmacyStocks.filter((s) => s.pharmacyId === pharmacyId);
  }

  public adjustPharmacyStock(
    pharmacyId: string,
    stockId: string,
    quantityDelta: number,
    movementType: "INTAKE_DELIVERY" | "MANUAL_IN" | "POS_SALE" | "RETURN_OUT" | "SPOILAGE_DISPOSAL" | "AUDIT_ADJUSTMENT",
    reason?: string,
    referenceId?: string
  ): { success: boolean; error?: string; stock?: IPharmacyStock } {
    const stock = this.pharmacyStocks.find((s) => s.id === stockId && s.pharmacyId === pharmacyId);
    if (!stock) {
      return { success: false, error: "Stock item not found in pharmacy inventory." };
    }

    const newQty = stock.quantity + quantityDelta;
    if (newQty < 0) {
      return { success: false, error: `Insufficient stock quantity. Current stock: ${stock.quantity}, requested deduction: ${Math.abs(quantityDelta)}.` };
    }

    stock.quantity = newQty;
    stock.isLowStock = stock.quantity <= 10;
    stock.updatedAt = new Date().toISOString();

    const movement: IStockMovement = {
      id: `smov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      pharmacyId,
      stockId: stock.id,
      medicineName: stock.brandName,
      batchNumber: stock.batchNumber,
      movementType,
      quantityDelta,
      balanceAfter: stock.quantity,
      reason: reason || `Manual stock adjustment: ${movementType}`,
      referenceId,
      createdAt: new Date().toISOString(),
    };

    this.stockMovements.unshift(movement);
    return { success: true, stock };
  }

  public addDeliveredOrderToPharmacyStock(order: any): void {
    const pharmacyId = order.pharmacyId || "pharm-01";
    if (!order.items || !Array.isArray(order.items)) return;

    for (const it of order.items) {
      const medId = it.medicineId || "med-01";
      const med = this.getMedicine(medId);
      const brandName = it.brandName || it.medicineName || med?.brandName || "Medicine";
      const genericName = it.genericName || med?.genericName || "Generic";
      const manufacturer = order.companyName || med?.manufacturer || "Manufacturer";
      const qty = it.orderedBoxes || it.orderedQty || 10;
      const batchNo = it.batchBreakdown?.[0]?.batchNumber || `DEL-BATCH-${Date.now().toString().slice(-4)}`;
      const expiry = it.batchBreakdown?.[0]?.expiryDate
        ? new Date(it.batchBreakdown[0].expiryDate).toISOString().slice(0, 10)
        : "2027-06-30";

      // Check if item batch already exists in pharmacy stock
      const existing = this.pharmacyStocks.find(
        (s) => s.pharmacyId === pharmacyId && s.medicineId === medId && s.batchNumber === batchNo
      );

      if (existing) {
        existing.quantity += qty;
        existing.updatedAt = new Date().toISOString();
        this.stockMovements.unshift({
          id: `smov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          pharmacyId,
          stockId: existing.id,
          medicineName: existing.brandName,
          batchNumber: existing.batchNumber,
          movementType: "INTAKE_DELIVERY",
          quantityDelta: qty,
          balanceAfter: existing.quantity,
          reason: `Auto intake from delivered order ${order.orderNumber || order.id}`,
          referenceId: order.orderNumber || order.id,
          createdAt: new Date().toISOString(),
        });
      } else {
        const newStock: IPharmacyStock = {
          id: `pstk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          pharmacyId,
          medicineId: medId,
          brandName,
          genericName,
          manufacturer,
          dosageForm: med?.dosageForm || "Tablet",
          strength: med?.strength || "Standard",
          batchNumber: batchNo,
          expiryDate: expiry,
          quantity: qty,
          packagingUnit: PackagingUnit.BOX,
          mrp: med ? Number(med.mrpPerPiece) * (med.piecesPerStrip * med.stripsPerBox) : 600,
          costPrice: med ? Number(med.tradePricePerPiece) * (med.piecesPerStrip * med.stripsPerBox) : 490,
          isLowStock: false,
          isNearExpiry: false,
          updatedAt: new Date().toISOString(),
        };
        this.pharmacyStocks.unshift(newStock);
        this.stockMovements.unshift({
          id: `smov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          pharmacyId,
          stockId: newStock.id,
          medicineName: newStock.brandName,
          batchNumber: newStock.batchNumber,
          movementType: "INTAKE_DELIVERY",
          quantityDelta: qty,
          balanceAfter: qty,
          reason: `Auto intake from delivered order ${order.orderNumber || order.id}`,
          referenceId: order.orderNumber || order.id,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // RETURN CLAIMS & REFUND ADJUSTMENTS
  // --------------------------------------------------------------------------
  public getReturnRequests(pharmacyId?: string): IReturnRequest[] {
    if (pharmacyId) {
      return this.returnRequests.filter((r) => r.pharmacyId === pharmacyId);
    }
    return this.returnRequests;
  }

  public getReturnRequest(id: string): IReturnRequest | undefined {
    return this.returnRequests.find((r) => r.id === id || r.returnNumber === id);
  }

  public addReturnRequest(req: IReturnRequest): void {
    this.returnRequests.unshift(req);
  }

  public reviewReturnRequest(
    returnId: string,
    status: ReturnStatus,
    rejectionNote?: string,
    reviewerId?: string
  ): boolean {
    const claim = this.returnRequests.find((r) => r.id === returnId || r.returnNumber === returnId);
    if (!claim) return false;

    claim.status = status;
    claim.reviewedById = reviewerId || "Authorized MPO Representative";
    claim.rejectionNote = rejectionNote;
    claim.updatedAt = new Date().toISOString();

    if (status === ReturnStatus.APPROVED) {
      // 1. Post RETURN_CREDIT to financial ledger
      const pharmacy = this.getPharmacy(claim.pharmacyId);
      if (pharmacy) {
        const prevBal = pharmacy.currentBalance;
        const newBal = this.updatePharmacyBalance(pharmacy.id, -claim.totalAmount);
        this.addLedgerEntry({
          id: `ledg-ret-${Date.now()}`,
          pharmacyId: pharmacy.id,
          orderId: claim.orderId,
          transactionType: TransactionType.RETURN_CREDIT,
          amount: claim.totalAmount,
          previousBalance: prevBal,
          newBalance: newBal,
          referenceNumber: `CREDIT-NOTE-${claim.returnNumber}`,
          notes: `Return claim approved for ${claim.companyName}: ${claim.reason}`,
          createdAt: new Date().toISOString(),
        });
      }

      // 2. Adjust local inventory
      for (const item of claim.items) {
        const stock = this.pharmacyStocks.find(
          (s) => s.pharmacyId === claim.pharmacyId && s.medicineId === item.medicineId && s.batchNumber === item.batchNumber
        );
        if (stock) {
          this.adjustPharmacyStock(
            claim.pharmacyId,
            stock.id,
            -item.quantity,
            "RETURN_OUT",
            `Return approved: ${claim.returnNumber}`,
            claim.returnNumber
          );
        }
      }

      // 3. Dispatch notification
      this.addNotification({
        id: `notif-${Date.now()}`,
        pharmacyId: claim.pharmacyId,
        title: "Return Claim Approved",
        message: `Claim ${claim.returnNumber} (৳${claim.totalAmount.toLocaleString()}) approved. Ledger credit note issued.`,
        type: "RETURN_APPROVED",
        metadata: { returnId: claim.id },
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    return true;
  }

  // --------------------------------------------------------------------------
  // NOTIFICATIONS
  // --------------------------------------------------------------------------
  public getNotifications(userId?: string, pharmacyId: string = "pharm-01"): INotification[] {
    return this.notifications.filter((n) => (!n.pharmacyId || n.pharmacyId === pharmacyId) && (!userId || !n.userId || n.userId === userId));
  }

  public addNotification(notification: INotification): void {
    this.notifications.unshift(notification);
  }

  public markNotificationRead(id: string): boolean {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // LIVE DASHBOARD KPI AGGREGATION
  // --------------------------------------------------------------------------
  public getDashboardKpiMetrics(pharmacyId: string = "pharm-01") {
    const pharmacy = this.getPharmacy(pharmacyId);
    const pharmacyOrders = this.orders.filter((o) => o.pharmacyId === pharmacyId);
    const totalPurchase = pharmacyOrders.reduce((sum, o) => sum + (Number(o.netPayableAmount) || 0), 0);
    const pendingOrdersCount = pharmacyOrders.filter(
      (o) => o.status === OrderStatus.PROCESSING || o.status === OrderStatus.ALLOCATED || o.status === OrderStatus.SUBMITTED
    ).length;
    const outstandingCredit = pharmacy ? Number(pharmacy.currentBalance) : 34500.00;
    const creditLimit = pharmacy ? Number(pharmacy.creditLimit) : 120000.00;
    const availableCredit = Math.max(0, creditLimit - outstandingCredit);

    return {
      totalPurchase,
      totalOrders: pharmacyOrders.length,
      pendingOrders: pendingOrdersCount,
      outstandingCredit,
      creditLimit,
      availableCredit,
      pharmacyName: pharmacy?.tradeName || "Green Care Pharmacy & Med Store",
    };
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
  globalForDb.medSupplyDb &&
  typeof (globalForDb.medSupplyDb as any).addInvoice === "function" &&
  (globalForDb.medSupplyDb as any).getEnrichedCatalog?.()?.[0]?.availableStockBoxes !== undefined
    ? globalForDb.medSupplyDb
    : new MemoryDatabase();
if (process.env.NODE_ENV !== "production") globalForDb.medSupplyDb = db;
