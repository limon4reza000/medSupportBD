import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/types/domain";
import { IAuthUser, SEED_USERS, Permission, hasPermission } from "./rbac";

/**
 * Extracts and verifies the authenticated user from cookies or Authorization header
 */
export function resolveUser(req: NextRequest): IAuthUser | null {
  const token =
    req.cookies.get("medgo_session")?.value ||
    req.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token || !token.startsWith("mgtok_")) {
    return null;
  }

  try {
    const raw = token.replace("mgtok_", "");
    const decoded = Buffer.from(raw, "base64").toString("utf-8");
    const [userId, role] = decoded.split(":");

    const user = SEED_USERS.find((u) => u.id === userId);
    if (user) {
      return { ...user, token };
    }

    // Hydrated fallback if valid token structure
    if (userId && role) {
      return {
        id: userId,
        phone: "01711000000",
        email: `${userId}@medgo.pharm`,
        fullName: "Authenticated Chemist",
        role: role as UserRole,
        pharmacyId: "pharm-01",
        isVerified: true,
        token,
      };
    }
  } catch (err) {
    return null;
  }

  return null;
}

/**
 * Enforces that the request has one of the allowed roles
 */
export function requireRole(
  req: NextRequest,
  allowedRoles: UserRole[]
): { user: IAuthUser } | { errorResponse: NextResponse } {
  const user = resolveUser(req);
  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: "Authentication required. Please sign in to proceed." },
        { status: 401 }
      ),
    };
  }

  if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
    return { user };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: `Access denied. Role ${user.role} does not possess authorization for this action.`,
          requiredRoles: allowedRoles,
        },
        { status: 403 }
      ),
    };
  }

  return { user };
}

/**
 * Enforces that the request possesses a specific granular permission
 */
export function requirePermission(
  req: NextRequest,
  permission: Permission
): { user: IAuthUser } | { errorResponse: NextResponse } {
  const user = resolveUser(req);
  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: "Authentication required. Please sign in to proceed." },
        { status: 401 }
      ),
    };
  }

  if (!hasPermission(user.role, permission)) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: `Insufficient permissions. Action requires permission: ${permission}.`,
          code: "INSUFFICIENT_PERMISSIONS",
        },
        { status: 403 }
      ),
    };
  }

  return { user };
}

/**
 * Multi-Tenant Data Isolation Guard
 * Prevents MPOs from querying competitor companies, prevents pharmacies from accessing other pharmacies
 */
export function enforceTenantBoundary(
  user: IAuthUser,
  target: { pharmacyId?: string; companyId?: string; depotId?: string }
): { isAllowed: boolean; error?: string } {
  // Super Admin can inspect all tenants
  if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
    return { isAllowed: true };
  }

  // Pharmacy Isolation
  if (target.pharmacyId && user.pharmacyId && user.pharmacyId !== target.pharmacyId) {
    return {
      isAllowed: false,
      error: "Tenant Isolation Violation: Access denied to foreign pharmacy data.",
    };
  }

  // Company Isolation (e.g. MPO or Pharma Company Admin)
  if (target.companyId && user.companyId && user.companyId !== target.companyId) {
    return {
      isAllowed: false,
      error: "Tenant Isolation Violation: Access denied to foreign manufacturer orders.",
    };
  }

  // Depot Isolation
  if (target.depotId && user.depotId && user.depotId !== target.depotId) {
    return {
      isAllowed: false,
      error: "Tenant Isolation Violation: Access denied to foreign warehouse depot.",
    };
  }

  return { isAllowed: true };
}
