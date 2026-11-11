import { UserRole } from "@/types/domain";

export enum Permission {
  MANAGE_INVENTORY = "MANAGE_INVENTORY",
  CHECKOUT_ORDERS = "CHECKOUT_ORDERS",
  REQUEST_BORROW = "REQUEST_BORROW",
  APPROVE_BORROW = "APPROVE_BORROW",
  VIEW_FINANCES = "VIEW_FINANCES",
  MANAGE_PRICING = "MANAGE_PRICING",
  MANAGE_OFFERS = "MANAGE_OFFERS",
  ACCEPT_ORDERS = "ACCEPT_ORDERS",
  DISPATCH_DELIVERY = "DISPATCH_DELIVERY",
  VERIFY_PHARMACIES = "VERIFY_PHARMACIES",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.PHARMACY_OWNER]: [
    Permission.MANAGE_INVENTORY,
    Permission.CHECKOUT_ORDERS,
    Permission.REQUEST_BORROW,
    Permission.APPROVE_BORROW,
    Permission.VIEW_FINANCES,
  ],
  [UserRole.RETAIL_PHARMACY]: [
    Permission.MANAGE_INVENTORY,
    Permission.CHECKOUT_ORDERS,
    Permission.REQUEST_BORROW,
    Permission.APPROVE_BORROW,
    Permission.VIEW_FINANCES,
  ],
  [UserRole.SALES_REP]: [
    Permission.ACCEPT_ORDERS,
    Permission.VIEW_FINANCES,
  ],
  [UserRole.PHARMA_COMPANY]: [
    Permission.MANAGE_PRICING,
    Permission.MANAGE_OFFERS,
    Permission.ACCEPT_ORDERS,
    Permission.VIEW_FINANCES,
  ],
  [UserRole.DISTRIBUTOR]: [
    Permission.MANAGE_INVENTORY,
    Permission.DISPATCH_DELIVERY,
    Permission.ACCEPT_ORDERS,
  ],
  [UserRole.DEPOT_MANAGER]: [
    Permission.MANAGE_INVENTORY,
    Permission.DISPATCH_DELIVERY,
    Permission.ACCEPT_ORDERS,
  ],
  [UserRole.ADMIN]: [
    Permission.MANAGE_INVENTORY,
    Permission.CHECKOUT_ORDERS,
    Permission.REQUEST_BORROW,
    Permission.APPROVE_BORROW,
    Permission.VIEW_FINANCES,
    Permission.MANAGE_PRICING,
    Permission.MANAGE_OFFERS,
    Permission.ACCEPT_ORDERS,
    Permission.DISPATCH_DELIVERY,
    Permission.VERIFY_PHARMACIES,
    Permission.SUPER_ADMIN,
  ],
  [UserRole.SUPER_ADMIN]: [
    Permission.MANAGE_INVENTORY,
    Permission.CHECKOUT_ORDERS,
    Permission.REQUEST_BORROW,
    Permission.APPROVE_BORROW,
    Permission.VIEW_FINANCES,
    Permission.MANAGE_PRICING,
    Permission.MANAGE_OFFERS,
    Permission.ACCEPT_ORDERS,
    Permission.DISPATCH_DELIVERY,
    Permission.VERIFY_PHARMACIES,
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
      return "Retail Chemist";
    case UserRole.SALES_REP:
      return "Medical Promotion Officer (MPO)";
    case UserRole.PHARMA_COMPANY:
      return "Pharma Company Admin";
    case UserRole.DISTRIBUTOR:
      return "Distribution Depot Manager";
    case UserRole.ADMIN:
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
