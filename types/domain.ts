import { z } from "zod";

// ============================================================================
// DOMAIN ENUMS
// ============================================================================

export enum UserRole {
  ADMIN = "ADMIN",
  DEPOT_MANAGER = "DEPOT_MANAGER",
  SALES_REP = "SALES_REP", // MPO
  PHARMACY_OWNER = "PHARMACY_OWNER",
}

export enum PackagingUnit {
  BOX = "BOX",
  STRIP = "STRIP",
  PIECE = "PIECE", // Loose Unit (Tablet/Capsule)
}

export enum OrderStatus {
  DRAFT = "DRAFT",
  PENDING_CREDIT_APPROVAL = "PENDING_CREDIT_APPROVAL",
  PROCESSING = "PROCESSING",
  ALLOCATED = "ALLOCATED",
  DISPATCHED = "DISPATCHED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  UNPAID = "UNPAID",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
}

export enum TradeSchemeType {
  BUY_X_GET_Y_FREE = "BUY_X_GET_Y_FREE", // e.g. 10 + 1
  SLAB_DISCOUNT = "SLAB_DISCOUNT",       // e.g. 5% off over 50 strips
  BONUS_RATIO = "BONUS_RATIO",           // e.g. 5 bonus pieces per 100
  FLAT_CASH_DISCOUNT = "FLAT_CASH_DISCOUNT",
}

export enum TransactionType {
  INVOICE_DEBIT = "INVOICE_DEBIT",
  PAYMENT_CREDIT = "PAYMENT_CREDIT",
  RETURN_CREDIT = "RETURN_CREDIT",
  ADJUSTMENT = "ADJUSTMENT",
}

export enum DosageForm {
  TABLET = "TABLET",
  CAPSULE = "CAPSULE",
  SYRUP = "SYRUP",
  INJECTION = "INJECTION",
  CREAM_OINTMENT = "CREAM_OINTMENT",
  EYE_DROPS = "EYE_DROPS",
  INHALER = "INHALER",
  INFUSION = "INFUSION",
}

// ============================================================================
// CORE ENTITY INTERFACES
// ============================================================================

export interface IMedicine {
  id: string;
  code: string;
  brandName: string;
  genericName: string;
  dosageForm: DosageForm;
  strength: string;
  manufacturer: string;
  description?: string;
  
  // Packaging Hierarchy: Box -> Strip -> Piece
  piecesPerStrip: number; // e.g. 10
  stripsPerBox: number;   // e.g. 10 (1 Box = 100 Pieces)
  
  // Pricing
  mrpPerPiece: number;
  tradePricePerPiece: number;
  vatPercentage: number;
  
  isActive: boolean;
  requiresColdChain?: boolean;
  darNo?: string;
  dgdaApproved?: boolean;
}

export interface IBatch {
  id: string;
  batchNumber: string;
  medicineId: string;
  depotId: string;
  manufacturingDate: string | Date;
  expiryDate: string | Date;
  initialLooseUnits: number;
  availableLooseUnits: number; // current available pieces
  reservedLooseUnits: number;
  costPricePerPiece: number;
  mrpPerPiece: number;
  isQuarantined?: boolean;
}

export interface ITradeOffer {
  id: string;
  title: string;
  medicineId: string;
  schemeType: TradeSchemeType;
  qualifyingUnit: PackagingUnit;
  minQualifyingQty: number; // e.g. 10
  bonusQty: number;         // e.g. 1
  bonusUnit: PackagingUnit;  // e.g. BOX
  discountPercent?: number; // e.g. 5.0
  flatDiscountAmount?: number;
  startDate: string | Date;
  endDate: string | Date;
  isActive: boolean;
}

export interface IPharmacy {
  id: string;
  code: string;
  tradeName: string;
  ownerName: string;
  drugLicenseNo: string;
  taxId?: string;
  phone: string;
  email?: string;
  address: string;
  thana: string;
  district: string;
  creditLimit: number;
  currentBalance: number;
  creditDaysLimit: number;
  isCreditBlocked: boolean;
  depotId: string;
  salesRepId?: string;
}

// ============================================================================
// PACKAGING & BONUS CALCULATION TYPES
// ============================================================================

export interface PackagingBreakdown {
  boxes: number;
  strips: number;
  pieces: number;
  totalLoosePieces: number;
}

export interface TradeCalculationResult {
  medicineId: string;
  orderedUnit: PackagingUnit;
  orderedQty: number;
  looseUnitsBilled: number;
  bonusLooseUnits: number;
  bonusSummary: string;
  unitTradePrice: number;
  grossPrice: number;
  discountPercentage: number;
  discountAmount: number;
  vatAmount: number;
  netItemTotal: number;
}

// ============================================================================
// FIFO BATCH ALLOCATION TYPES
// ============================================================================

export interface BatchAllocationDetail {
  batchId: string;
  batchNumber: string;
  expiryDate: string | Date;
  piecesAllocated: number;
  daysUntilExpiry: number;
  isNearExpiry: boolean; // < 90 days
  costBasis: number;
}

export interface FifoAllocationResult {
  medicineId: string;
  brandName: string;
  requestedLooseUnits: number;
  allocatedLooseUnits: number;
  isFullyAllocated: boolean;
  shortageUnits: number;
  allocations: BatchAllocationDetail[];
}

// ============================================================================
// CREDIT & LEDGER AUDIT TYPES
// ============================================================================

export interface CreditAuditResult {
  pharmacyId: string;
  tradeName: string;
  creditLimit: number;
  currentOutstandingBalance: number;
  newOrderAmount: number;
  projectedBalance: number;
  availableCredit: number;
  isApproved: boolean;
  isBlockedByLimit: boolean;
  isBlockedByOverdue: boolean;
  overdueDays?: number;
  rejectionReason?: string;
}

// ============================================================================
// CHECKOUT PAYLOAD & RESPONSE TYPES
// ============================================================================

export interface CheckoutItemInput {
  medicineId: string;
  orderedUnit: PackagingUnit;
  orderedQty: number;
}

export interface CheckoutPayload {
  pharmacyId: string;
  depotId: string;
  salesRepId: string;
  items: CheckoutItemInput[];
  deliveryNotes?: string;
}

export interface CheckoutResponseData {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  pharmacyId: string;
  pharmacyName: string;
  totalItems: number;
  totalLoosePieces: number;
  totalBonusPieces: number;
  grossAmount: number;
  tradeDiscountAmount: number;
  vatAmount: number;
  netPayableAmount: number;
  allocatedItems: {
    medicineId: string;
    brandName: string;
    orderedQty: number;
    orderedUnit: PackagingUnit;
    looseUnitsBilled: number;
    bonusLooseUnits: number;
    netItemTotal: number;
    batchBreakdown: BatchAllocationDetail[];
  }[];
  creditSnapshot: {
    creditLimit: number;
    previousBalance: number;
    newBalance: number;
    availableCreditRemaining: number;
  };
  ledgerTxId: string;
}

// ============================================================================
// AI SCHEMAS (ZOD VALIDATION)
// ============================================================================

// 1. AI Slip Parser Output Schema
export const SlipParserItemSchema = z.object({
  brand_name: z.string().describe("Identified medicine brand name or prescription text"),
  generic: z.string().optional().describe("Chemical generic if mentioned or inferred"),
  qty: z.number().int().positive().describe("Extracted quantity prescribed or requested"),
  packaging_type: z.nativeEnum(PackagingUnit).default(PackagingUnit.BOX).describe("Packaging unit hierarchy (BOX, STRIP, PIECE)"),
  confidence_score: z.number().min(0).max(1).describe("OCR and entity matching confidence score (0.00 to 1.00)"),
  matched_medicine_id: z.string().nullable().optional().describe("Exact or closest database medicine ID"),
  matched_brand_name: z.string().nullable().optional().describe("Matched catalog brand name"),
  unit_price: z.number().optional().describe("Catalog trade price"),
  notes: z.string().optional().describe("Dosage instructions or slip annotations"),
});

export const SlipParserResponseSchema = z.object({
  success: z.boolean(),
  raw_extracted_text: z.string(),
  parsed_items: z.array(SlipParserItemSchema),
  overall_confidence: z.number().min(0).max(1),
  unmatched_items_count: z.number().int().nonnegative(),
  processing_time_ms: z.number(),
});

export type ISlipParserItem = z.infer<typeof SlipParserItemSchema>;
export type ISlipParserResponse = z.infer<typeof SlipParserResponseSchema>;

// 2. AI Generic Alternative Schema
export const GenericAlternativeItemSchema = z.object({
  medicine_id: z.string(),
  brand_name: z.string(),
  generic_name: z.string(),
  dosage_form: z.string(),
  strength: z.string(),
  manufacturer: z.string(),
  available_loose_units: z.number(),
  trade_price_per_piece: z.number(),
  price_difference_percent: z.number(),
  bioequivalence_rating: z.string().default("A-Rated Therapeutic Equivalent"),
  in_stock: z.boolean(),
});

export const GenericAlternativesResponseSchema = z.object({
  requested_medicine_id: z.string(),
  requested_brand_name: z.string(),
  generic_name: z.string(),
  strength: z.string(),
  requested_out_of_stock: z.boolean(),
  alternatives: z.array(GenericAlternativeItemSchema),
});

export type IGenericAlternative = z.infer<typeof GenericAlternativeItemSchema>;
export type IGenericAlternativesResponse = z.infer<typeof GenericAlternativesResponseSchema>;

// 3. AI Demand Forecast Schema
export const DemandForecastItemSchema = z.object({
  medicine_id: z.string(),
  brand_name: z.string(),
  generic_name: z.string(),
  dosage_form: z.string(),
  historical_30_day_consumption: z.number(),
  current_stock_units: z.number(),
  predicted_30_day_demand: z.number(),
  safety_stock_units: z.number(),
  reorder_point: z.number(),
  recommended_order_boxes: z.number(),
  seasonal_multiplier: z.number().default(1.0),
  risk_level: z.enum(["CRITICAL_STOCKOUT", "LOW_STOCK", "OPTIMAL", "OVERSTOCKED"]),
  seasonal_spike_factors: z.array(z.string()),
  ai_rationale: z.string(),
});

export const DemandForecastResponseSchema = z.object({
  pharmacy_id: z.string(),
  generated_at: z.string(),
  forecast_horizon_days: z.number().default(30),
  recommendations: z.array(DemandForecastItemSchema),
  total_recommended_investment: z.number(),
});

export type IDemandForecastItem = z.infer<typeof DemandForecastItemSchema>;
export type IDemandForecastResponse = z.infer<typeof DemandForecastResponseSchema>;

// ============================================================================
// 1. DAILY SALES (POS) DOMAIN TYPES
// ============================================================================

export type PaymentMethod = "CASH" | "BKASH" | "NAGAD" | "DUE" | "SPLIT";

export interface IPosSaleItem {
  medicineId: string;
  brandName: string;
  genericName: string;
  dosageForm: DosageForm;
  strength: string;
  unit: PackagingUnit;
  qty: number;
  looseUnits: number;
  unitPrice: number;
  costPricePerPiece: number;
  discountPercent: number;
  total: number;
  batchNumber?: string;
}

export interface IPosSale {
  id: string;
  invoiceNo: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: IPosSaleItem[];
  subtotal: number;
  discountAmount: number;
  vatAmount: number;
  netTotal: number;
  paymentMethod: PaymentMethod;
  cashPaid: number;
  digitalPaid: number;
  digitalTxnId?: string;
  dueAmount: number;
  changeGiven: number;
  servedBy: string;
}

export interface IDailyClosing {
  id: string;
  date: string;
  totalBills: number;
  grossSales: number;
  totalDiscount: number;
  totalVat: number;
  netRevenue: number;
  cashSales: number;
  bkashSales: number;
  nagadSales: number;
  dueSales: number;
  totalCostOfGoods: number;
  grossProfit: number;
  openingCash: number;
  expectedDrawerCash: number;
  actualDrawerCash: number;
  cashDifference: number;
  notes?: string;
  closedAt: string;
}

// ============================================================================
// 2. CUSTOMER DUE LEDGER TYPES
// ============================================================================

export interface ICustomer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  totalCreditPurchases: number;
  totalPaid: number;
  currentDue: number;
  lastPurchaseDate: string;
  createdAt: string;
}

export interface ICustomerPayment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  paymentMethod: "CASH" | "BKASH" | "NAGAD" | "BANK";
  referenceNo: string;
  date: string;
  notes?: string;
}

// ============================================================================
// 3. COMPANY / DISTRIBUTOR ORDERS TYPES
// ============================================================================

export interface ICompany {
  id: string;
  name: string;
  shortCode: string;
  mrName: string;
  mrPhone: string;
  email?: string;
  territory: string;
  dueBalance: number;
  logoColor?: string;
}

export interface IDistributorOrderItem {
  medicineId: string;
  brandName: string;
  strength: string;
  unit: PackagingUnit;
  orderedQty: number;
  bonusUnits?: number;
  tradePricePerUnit: number;
  total: number;
}

export interface IDistributorOrder {
  id: string;
  poNumber: string;
  companyId: string;
  companyName: string;
  mrName: string;
  mrPhone: string;
  orderDate: string;
  status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "UNPAID" | "PARTIALLY_PAID" | "PAID";
  items: IDistributorOrderItem[];
  totalAmount: number;
  paidAmount: number;
  notes?: string;
  deliveredDate?: string;
}

export interface ICompanyPayment {
  id: string;
  companyId: string;
  companyName: string;
  amount: number;
  paymentMethod: "CASH" | "CHEQUE" | "BANK_TRANSFER" | "BKASH";
  referenceNo: string;
  date: string;
  notes?: string;
}

// ============================================================================
// 4. EMPLOYEE MANAGEMENT TYPES
// ============================================================================

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LEAVE" | "HALF_DAY";

export interface IEmployee {
  id: string;
  name: string;
  designation: string;
  phone: string;
  nid: string;
  address: string;
  joiningDate: string;
  baseSalary: number;
  photo: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface IAttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface ISalaryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string; // YYYY-MM
  baseSalary: number;
  bonus: number;
  advanceDeduction: number;
  absenceDeduction: number;
  absentDays: number;
  otherDeduction: number;
  netSalary: number;
  status: "PAID" | "PENDING";
  paymentDate?: string;
}

export interface ILeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: "SICK" | "CASUAL" | "ANNUAL";
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedDate: string;
  reviewedDate?: string;
  reviewerNotes?: string;
}

// ============================================================================
// 5. EXPENSE TRACKING TYPES
// ============================================================================

export type ExpenseCategory =
  | "RENT"
  | "ELECTRICITY"
  | "SALARY"
  | "TRANSPORT"
  | "MAINTENANCE"
  | "TEA_SNACKS"
  | "OTHER";

export interface IExpense {
  id: string;
  date: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  paymentMethod: "CASH" | "BKASH" | "NAGAD" | "BANK";
  payee: string;
  notes?: string;
  voucherNo?: string;
}

// ============================================================================
// 6. MR / MARKETING MANAGER PANEL (PRIVATE) TYPES
// ============================================================================

export interface IMrVisit {
  id: string;
  pharmacyName: string;
  pharmacyAddress: string;
  contactPerson: string;
  contactPhone: string;
  visitDate: string;
  purpose: string;
  notes: string;
  ordersCollectedAmount: number;
  status: "COMPLETED" | "SCHEDULED";
}

export interface IMrTarget {
  month: string;
  targetAmount: number;
  achievedAmount: number;
  incentiveRatePercent: number;
}

