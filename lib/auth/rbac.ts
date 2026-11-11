import { UserRole } from "@/types/domain";
export { UserRole };

export enum Permission {
  VIEW_CATALOG = "VIEW_CATALOG",
  PLACE_ORDER = "PLACE_ORDER",
  CHECKOUT_ORDERS = "CHECKOUT_ORDERS",
  REQUEST_BORROW = "REQUEST_BORROW",
  APPROVE_BORROW = "APPROVE_BORROW",
  MANAGE_INVENTORY = "MANAGE_INVENTORY",
  VIEW_FINANCES = "VIEW_FINANCES",
  MANAGE_PRICING = "MANAGE_PRICING",
  MANAGE_OFFERS = "MANAGE_OFFERS",
  ACCEPT_ORDERS = "ACCEPT_ORDERS",
  DISPATCH_DELIVERY = "DISPATCH_DELIVERY",
  VERIFY_PHARMACIES = "VERIFY_PHARMACIES",
  MANAGE_STAFF = "MANAGE_STAFF",
  MANAGE_CREDIT_LIMITS = "MANAGE_CREDIT_LIMITS",
  AUDIT_COMPLIANCE = "AUDIT_COMPLIANCE",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Pharmacy Owner: Full commercial & clinical authority
  [UserRole.PHARMACY_OWNER]: [
    Permission.VIEW_CATALOG,
    Permission.PLACE_ORDER,
    Permission.CHECKOUT_ORDERS,
    Permission.REQUEST_BORROW,
    Permission.APPROVE_BORROW,
    Permission.MANAGE_INVENTORY,
    Permission.VIEW_FINANCES,
    Permission.MANAGE_STAFF,
    Permission.AUDIT_COMPLIANCE,
  ],
  // Retail Pharmacy Staff / Dispenser: Operational ordering & scanning only (NO finances or credit)
  [UserRole.RETAIL_PHARMACY]: [
    Permission.VIEW_CATALOG,
    Permission.PLACE_ORDER,
    Permission.CHECKOUT_ORDERS,
    Permission.REQUEST_BORROW,
    Permission.APPROVE_BORROW,
    Permission.MANAGE_INVENTORY,
  ],
  // Medical Promotion Officer (MPO): Field rep managing assigned territory chemists
  [UserRole.SALES_REP]: [
    Permission.VIEW_CATALOG,
    Permission.ACCEPT_ORDERS,
  ],
  // Pharmaceutical Manufacturer HQ: Pricing, trade schemes, credit limits
  [UserRole.PHARMA_COMPANY]: [
    Permission.VIEW_CATALOG,
    Permission.MANAGE_PRICING,
    Permission.MANAGE_OFFERS,
    Permission.ACCEPT_ORDERS,
    Permission.VIEW_FINANCES,
    Permission.MANAGE_CREDIT_LIMITS,
    Permission.AUDIT_COMPLIANCE,
  ],
  // Regional Warehouse Depot Manager: Pick & pack, FEFO staging, fleet delivery dispatch
  [UserRole.DISTRIBUTOR]: [
    Permission.VIEW_CATALOG,
    Permission.MANAGE_INVENTORY,
    Permission.DISPATCH_DELIVERY,
    Permission.ACCEPT_ORDERS,
  ],
  [UserRole.DEPOT_MANAGER]: [
    Permission.VIEW_CATALOG,
    Permission.MANAGE_INVENTORY,
    Permission.DISPATCH_DELIVERY,
    Permission.ACCEPT_ORDERS,
  ],
  // MedGo Super Administrator / DGDA Regulatory Inspector: Master platform authority
  [UserRole.ADMIN]: [
    Permission.VIEW_CATALOG,
    Permission.PLACE_ORDER,
    Permission.CHECKOUT_ORDERS,
    Permission.REQUEST_BORROW,
    Permission.APPROVE_BORROW,
    Permission.MANAGE_INVENTORY,
    Permission.VIEW_FINANCES,
    Permission.MANAGE_PRICING,
    Permission.MANAGE_OFFERS,
    Permission.ACCEPT_ORDERS,
    Permission.DISPATCH_DELIVERY,
    Permission.VERIFY_PHARMACIES,
    Permission.MANAGE_STAFF,
    Permission.MANAGE_CREDIT_LIMITS,
    Permission.AUDIT_COMPLIANCE,
    Permission.SUPER_ADMIN,
  ],
  [UserRole.SUPER_ADMIN]: [
    Permission.VIEW_CATALOG,
    Permission.PLACE_ORDER,
    Permission.CHECKOUT_ORDERS,
    Permission.REQUEST_BORROW,
    Permission.APPROVE_BORROW,
    Permission.MANAGE_INVENTORY,
    Permission.VIEW_FINANCES,
    Permission.MANAGE_PRICING,
    Permission.MANAGE_OFFERS,
    Permission.ACCEPT_ORDERS,
    Permission.DISPATCH_DELIVERY,
    Permission.VERIFY_PHARMACIES,
    Permission.MANAGE_STAFF,
    Permission.MANAGE_CREDIT_LIMITS,
    Permission.AUDIT_COMPLIANCE,
    Permission.SUPER_ADMIN,
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission) || permissions.includes(Permission.SUPER_ADMIN);
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case UserRole.PHARMACY_OWNER:
      return "Pharmacy Owner";
    case UserRole.RETAIL_PHARMACY:
      return "Retail Chemist (Staff)";
    case UserRole.SALES_REP:
      return "Medical Promotion Officer (MPO)";
    case UserRole.PHARMA_COMPANY:
      return "Pharma Company HQ";
    case UserRole.DISTRIBUTOR:
    case UserRole.DEPOT_MANAGER:
      return "Regional Distribution Depot Manager";
    case UserRole.ADMIN:
    case UserRole.SUPER_ADMIN:
      return "DGDA / Super Administrator";
    default:
      return role;
  }
}

export interface IAuthUser {
  id: string;
  phone: string;
  email: string;
  fullName: string;
  role: UserRole;
  pharmacyId?: string;
  pharmacyName?: string;
  companyId?: string;
  companyName?: string;
  depotId?: string;
  territory?: string;
  isVerified: boolean;
  token?: string;
}

export const SEED_USERS: IAuthUser[] = [
  {
    id: "user-po-01",
    phone: "01711409821",
    email: "greencare.pharm@gmail.com",
    fullName: "Dr. Rafiqul Islam",
    role: UserRole.PHARMACY_OWNER,
    pharmacyId: "pharm-01",
    pharmacyName: "Green Care Pharmacy & Med Store",
    isVerified: true,
  },
  {
    id: "user-st-01",
    phone: "01711409822",
    email: "staff.greencare@gmail.com",
    fullName: "Md. Nazmul Karim (Staff)",
    role: UserRole.RETAIL_PHARMACY,
    pharmacyId: "pharm-01",
    pharmacyName: "Green Care Pharmacy & Med Store",
    isVerified: true,
  },
  {
    id: "user-po-02",
    phone: "01822901844",
    email: "popularmedico@yahoo.com",
    fullName: "Al-Amin Hossain",
    role: UserRole.PHARMACY_OWNER,
    pharmacyId: "pharm-02",
    pharmacyName: "Popular Medico & Surgical",
    isVerified: true,
  },
  {
    id: "user-sr-01",
    phone: "01912884910",
    email: "tariq.mpo@squarepharma.com.bd",
    fullName: "Tariq Aziz",
    role: UserRole.SALES_REP,
    companyId: "comp-square",
    companyName: "Square Pharmaceuticals PLC",
    territory: "Dhanmondi-Tejgaon",
    isVerified: true,
  },
  {
    id: "user-sr-02",
    phone: "01819001122",
    email: "tanvir.mpo@beximco.net",
    fullName: "Tanvir Hasan",
    role: UserRole.SALES_REP,
    companyId: "comp-beximco",
    companyName: "Beximco Pharmaceuticals Ltd.",
    territory: "Dhanmondi-Tejgaon",
    isVerified: true,
  },
  {
    id: "user-ca-01",
    phone: "01713000001",
    email: "admin@squarepharma.com.bd",
    fullName: "Farhan Tanveer",
    role: UserRole.PHARMA_COMPANY,
    companyId: "comp-square",
    companyName: "Square Pharmaceuticals PLC",
    isVerified: true,
  },
  {
    id: "user-dm-01",
    phone: "01822481920",
    email: "manager.tejgaon@squarepharma.com.bd",
    fullName: "Jalal Uddin",
    role: UserRole.DISTRIBUTOR,
    companyId: "comp-square",
    depotId: "depot-dhk-01",
    isVerified: true,
  },
  {
    id: "user-sa-01",
    phone: "01700000000",
    email: "admin@medgo.com.bd",
    fullName: "DGDA Platform Supervisor",
    role: UserRole.ADMIN,
    isVerified: true,
  },
];
