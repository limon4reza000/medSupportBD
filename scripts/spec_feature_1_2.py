# -*- coding: utf-8 -*-
"""
Feature 1.2: User Roles & RBAC (6-Role Architecture)
"""

def build_feature_1_2():
    return """## 4. Feature 1.2: User Roles & RBAC (6-Role Architecture)

### 1. Purpose and Expected Functionality
Feature 1.2 establishes strict Role-Based Access Control (RBAC) and multi-tenant data isolation across the 6 core MedGo user archetypes:
1. `PHARMACY_OWNER`: Full commercial and clinical authority over pharmacy profile, purchases, credit limits, invoices, and staff.
2. `RETAIL_PHARMACY` (Pharmacy Dispenser / Staff): Operational authority for browsing catalog, preparing cart, scanning inventory, and requesting emergency stock; blocked from ledger balances and financial credit limits.
3. `SALES_REP` (Medical Promotion Officer / MPO): Pharmaceutical field agent managing retailer relationships, tracking assigned territory orders, logging doctor sample distribution, and resolving delivery escalations.
4. `PHARMA_COMPANY` (Manufacturer HQ / Commercial Manager): Corporate brand authority managing trade price lists, promotional bonus schemes, territory quotas, and macro analytics.
5. `DEPOT_MANAGER` (Distributor / Regional Warehouse Depot): Physical fulfillment authority managing batch pick-and-pack, FEFO staging, driver fleet dispatch, and DGDA delivery challan generation.
6. `ADMIN` (MedGo Platform Super Admin): Master system supervisor managing company onboarding, drug license audits, dispute resolution, and system health.

### 2. Complete End-to-End User Workflow
1. User logs in (via Feature 1.1). The JWT token payload encodes their specific `role`, `pharmacyId`, `companyId`, or `depotId`.
2. As the client loads, the RBAC middleware and `usePermissions()` hook inspect the active role.
3. UI elements dynamically reconfigure:
   - For `PHARMACY_OWNER`: Financial cards (Outstanding Balance, Credit Limit, Invoices) are fully visible and clickable.
   - For `RETAIL_PHARMACY`: Financial cards are concealed or replaced with "Stock Audit" and "Quick Dispense" tiles.
   - For `SALES_REP`: App redirects or switches view to "Territory Orders", "Doctor Call Log", and "Target Progress".
   - For `DEPOT_MANAGER`: View prioritizes "Pending Dispatches", "Van Routing", and "Batch Expiry Staging".
4. If a user attempts to manually navigate to an unauthorized route (e.g. Staff navigating to `/finances` or MPO navigating to another company's depot queue), the Next.js edge middleware intercepts the request and issues a 403 Forbidden redirect to an informative access-denied screen.
5. Every backend API endpoint queries the session context through `requireRole(allowedRoles)` and applies tenant-level database filters (`where: { companyId: session.companyId }`).

### 3. Every User Interaction, Button, Action, and Screen Behavior
- **Role Switcher Dropdown (Admin / Demo Mode):** Allows authorized system supervisors to preview the interface through the lens of each role for verification.
- **Financial Balance Card:** Visible to `PHARMACY_OWNER` and `ADMIN`. Displays "Hidden for Staff" badge with a tooltip for `RETAIL_PHARMACY`.
- **"Place Company Order" Button:** Active for `PHARMACY_OWNER` and `RETAIL_PHARMACY`. Disabled for `SALES_REP` (who can only submit orders on behalf of an authenticated chemist).
- **"Approve Credit Extension" Action:** Restricted strictly to `PHARMA_COMPANY` and `ADMIN`.
- **"Generate DGDA Delivery Challan" Button:** Restricted strictly to `DEPOT_MANAGER` and `ADMIN`.

### 4. Frontend Functional Requirements
- **Permission Guard Component (`<PermissionGate permission="..." fallback={...}>`):** Declarative component wrapping UI elements to conditionally render or disable buttons based on user permissions.
- **Dynamic Navigation Bar:** Bottom navigation bar and side drawer adapt to role capabilities.
- **Unauthorized Screen (`/unauthorized`):** Professional explanation with "Request Elevated Permissions from Pharmacy Owner" button.

### 5. Backend Business Logic & Permissions Matrix
The backend enforces the following authoritative permissions matrix:

| Permission Key | `PHARMACY_OWNER` | `RETAIL_PHARMACY` | `SALES_REP` | `PHARMA_COMPANY` | `DEPOT_MANAGER` | `ADMIN` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `VIEW_CATALOG` | Yes | Yes | Yes | Yes | Yes | Yes |
| `PLACE_ORDER` | Yes | Yes | On-Behalf | No | No | Yes |
| `VIEW_FINANCES` | Yes | No | No | Yes (Own) | No | Yes |
| `MANAGE_STAFF` | Yes | No | No | Yes (Own) | Yes (Own) | Yes |
| `MANAGE_CREDIT_LIMITS`| No | No | No | Yes (Own) | No | Yes |
| `DISPATCH_ORDERS` | No | No | No | No | Yes | Yes |
| `AUDIT_COMPLIANCE` | Own | No | No | Own | Own | All |

- **Multi-Tenant Filter Enforcement:** Every SQL query executed on behalf of a non-admin user must inject the relevant foreign key condition:
  - Pharmacy queries: `WHERE pharmacyId = @userPharmacyId`
  - Pharma queries: `WHERE companyId = @userCompanyId`
  - Depot queries: `WHERE depotId = @userDepotId`

### 6. Required API Endpoints with Request and Response Structures

#### `GET /api/auth/permissions`
- **Headers:** `Authorization: Bearer mgtok_...`
- **Response (200 OK):**
```json
{
  "success": true,
  "role": "PHARMACY_OWNER",
  "permissions": [
    "VIEW_CATALOG",
    "PLACE_ORDER",
    "VIEW_FINANCES",
    "MANAGE_STAFF",
    "AUDIT_COMPLIANCE"
  ],
  "tenant": {
    "type": "PHARMACY",
    "id": "pharm-01",
    "name": "Green Care Pharmacy & Med Store"
  }
}
```

#### `GET /api/admin/users?role=SALES_REP&companyId=comp-beximco`
- **Headers:** `Authorization: Bearer mgtok_admin...`
- **Response (200 OK):**
```json
{
  "success": true,
  "total": 14,
  "users": [
    {
      "id": "usr-mpo-101",
      "fullName": "Tanvir Hasan",
      "phone": "01819001122",
      "role": "SALES_REP",
      "territory": "Dhanmondi-Tejgaon",
      "company": "Beximco Pharmaceuticals Ltd.",
      "activeChemistCount": 84
    }
  ]
}
```

### 7. Database Tables, Fields, Relationships, and Constraints
```prisma
model RolePermission {
  id          String   @id @default(cuid())
  role        UserRole
  permission  String   @db.VarChar(60)

  @@unique([role, permission])
  @@index([role])
}

model TerritoryAssignment {
  id          String   @id @default(cuid())
  userId      String
  companyId   String
  thana       String   @db.VarChar(50)
  district    String   @db.VarChar(50)
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
  company     Company  @relation(fields: [companyId], references: [id])

  @@unique([userId, thana, companyId])
  @@index([thana, companyId])
}
```

### 8. Authentication, Authorization, and Security Requirements
- Role claims in JWT tokens must be cryptographically verified on every server action or API call.
- Any attempt to access data belonging to another tenant (`pharmacyId` mismatch) triggers an immediate security warning log with automated IP rate-limiting.
- Elevation of privilege protection: Staff cannot promote themselves to Owner; Company Admins cannot modify Platform Admin accounts.

### 9. Input Validation, Edge Cases, and Error Handling
- **Role Desynchronization:** If an Owner revokes a Staff member's account while they are logged in, the next authenticated API request detects the revocation and returns `401 Unauthorized` with instruction to sign in again.
- **MPO Territory Boundary:** If an MPO searches for a pharmacy outside their assigned Thana, the search returns empty or displays "Pharmacy outside assigned territory".

### 10. Dependencies on Other Features
- Depends on: Feature 1.1 (Auth & Session).
- Depended on by: All Phase 1 and subsequent Phase modules.

### 11. Detailed Acceptance Criteria
- [x] Every user role correctly inherits only its designated permissions matrix.
- [x] Staff account cannot view credit limits, outstanding balances, or ledger entries.
- [x] MPO can only view orders and chemists belonging to their designated company and territory.
- [x] Depot Manager can only view orders assigned to their physical distribution hub.
- [x] Unauthenticated or unauthorized API queries receive structured 401/403 responses.

### 12. Positive, Negative, and Edge-Case Testing Scenarios
- **Positive Test 1.2.1:** Log in as `PHARMACY_OWNER`. Query `/api/pharmacies/credit`. Verify 200 OK with accurate financial balance.
- **Negative Test 1.2.2:** Log in as `RETAIL_PHARMACY` (Staff). Query `/api/pharmacies/credit`. Verify 403 Forbidden with error `INSUFFICIENT_PERMISSIONS`.
- **Negative Test 1.2.3:** Log in as Beximco MPO. Attempt to query Square Pharmaceuticals order `/api/orders/ORD-20261111-SQU-001`. Verify 404/403 Tenant Isolation failure.
- **Edge Case 1.2.4:** User role updated in database while session active. Next request must refresh claims or reject stale token.
"""
