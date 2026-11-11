# MEDGO — Phase 1: Core Foundation
## Complete Workflow & Functional Requirements Specification (FRS)

**Document Version:** 2.1.0-PROD-SPEC  
**Status:** Under Architectural Review (Awaiting User Sign-Off)  
**Target Platform:** Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma ORM, In-Memory & PostgreSQL Engine  
**Author:** Antigravity Engineering (Google DeepMind Advanced Agentic Coding)  

---

## Table of Contents
1. [Architectural Overview & Global Tenets](#1-architectural-overview--global-tenets)
2. [Multi-Company Checkout & Order Decomposition Architectural Review](#2-multi-company-checkout--order-decomposition-architectural-review)
   - 2.1 The Architectural & Regulatory Mandate
   - 2.2 End-to-End Decomposition Protocol & Sequence Flow
   - 2.3 Stock Reservation Protocol & Optimistic Lock Lifecycle (TTL 180s)
   - 2.4 FEFO Batch Allocation Algorithm
   - 2.5 Multi-Company Credit Validation & Ledger Isolation
   - 2.6 Distributed Transaction Atomicity (Two-Phase Commit & Compensating Rollback)
   - 2.7 Architectural Inconsistencies & Conflicting Business Rules Resolved
   - 2.8 Company-Specific Notification Dispatch Protocol
3. [Feature 1.1: Authentication & Session Management](#3-feature-11-authentication--session-management)
4. [Feature 1.2: User Roles & RBAC (6-Role Architecture)](#4-feature-12-user-roles--rbac-6-role-architecture)
5. [Feature 1.3: Pharmacy Profiles & Compliance](#5-feature-13-pharmacy-profiles--compliance)
6. [Feature 1.4: Pharmaceutical Company & Depot Directory](#6-feature-14-pharmaceutical-company--depot-directory)
7. [Feature 1.5: Medicine Catalog & Clinical Taxonomy](#7-feature-15-medicine-catalog--clinical-taxonomy)
8. [Feature 1.6: Multi-Attribute Medicine Search & Discovery Engine](#8-feature-16-multi-attribute-medicine-search--discovery-engine)
9. [Feature 1.7: Brands & Manufacturer Showcase](#9-feature-17-brands--manufacturer-showcase)
10. [Feature 1.8: Company-Wise Cart Engine](#10-feature-18-company-wise-cart-engine)
11. [Feature 1.9: Multi-Company Unified Checkout](#11-feature-19-multi-company-unified-checkout)
12. [Feature 1.10: Atomic Order Decomposition & FEFO Stock Reservation Engine](#12-feature-110-atomic-order-decomposition--fefo-stock-reservation-engine)
13. [Feature 1.11: Dashboard — Business Analytics & Real-Time Intelligence](#13-feature-111-dashboard--business-analytics--real-time-intelligence)
14. [Detailed Phase 1 Implementation Roadmap & Git Commit Plan](#14-detailed-phase-1-implementation-roadmap--git-commit-plan)
15. [Sign-Off & Verification Process](#15-sign-off--verification-process)

---

## 1. Architectural Overview & Global Tenets

MedGo is a mission-critical, enterprise B2B pharmaceutical marketplace and supply chain platform in Bangladesh. It connects licensed retail pharmacies directly with pharmaceutical manufacturers (e.g. Beximco, Square, Incepta, Renata, Opsonin), their authorized distribution depots, and field Medical Promotion Officers (MPOs).

### Global Engineering Tenets:
1. **Zero Decorative / Non-Functional Elements:** Every button, toggle, dropdown, card, modal, and link must be backed by real business logic, database state, and API contracts.
2. **Absolute Data Integrity:** No simulated, random, or hardcoded mock records in production workflows. Every inventory unit, batch number, expiry date, DGDA license, and ledger transaction must exist in persistent storage.
3. **Regulatory Strictness (DGDA Compliance):** Directorate General of Drug Administration (DGDA) rules must be enforced at every layer:
   - Valid DGDA Drug License required before any wholesale medicine purchase.
   - Statutory Chemist Discount (3% on eligible wholesale pharmaceuticals) strictly calculated.
   - Separate official Delivery Challans per manufacturer (a single chemist cannot receive Beximco and Square medicines on the same legal challan).
   - FEFO (First-Expiry, First-Out) physical batch allocation to prevent distribution of expired or near-expiry medicines.
4. **Resilient Transaction Atomicity:** Multi-company checkouts must either succeed completely across all company orders or roll back cleanly without leaving orphaned stock reservations or un-reconciled credit debits.
5. **Mobile-First Ergonomics & Performance:** Sub-100ms UI interactions, debounced search under 50ms, touch-friendly hit targets (minimum 44x44px), and adherence to the MedGo visual design identity (Teal `#0D9488`, Emerald, Light Blue background `#F8FAFC`, and Google Open Sans typography).

---

## 2. Multi-Company Checkout & Order Decomposition Architectural Review

### 2.1 The Architectural & Regulatory Mandate
In standard consumer e-commerce (B2C), a multi-vendor cart is fulfilled through a single invoice or dropshipping slip. In the pharmaceutical supply chain of Bangladesh, this is **legally and operationally prohibited**:
1. **DGDA Legal Challans:** Under the Drugs Act 1940 and National Drug Policy, every drug consignment moving on highways and urban roads must be accompanied by an official manufacturer-specific Delivery Challan bearing the manufacturer's DGDA drug license number.
2. **Depot Logistics:** Beximco operates its central regional depot in Tejgaon; Square dispatches from Tongi; Incepta dispatches from Savar. Deliveries arrive on separate dedicated temperature-controlled vans at different times of the day.
3. **MPO Commissions & Territory Ownership:** MPOs represent single pharmaceutical manufacturers. An order containing Beximco Napa and Square Seclo must route commission, order approval, and pharmacy doctor call-records strictly to their respective MPO without data leakage across competitor companies.
4. **Credit Facilities:** Chemist credit lines are granted individually by each pharmaceutical manufacturer or authorized distributor. A pharmacy may have ৳100,000 credit with Beximco but ৳0 credit (Cash on Delivery only) with Square.

### 2.2 End-to-End Decomposition Protocol & Sequence Flow
```
[ Pharmacy Chemist ]
         |
         | (1) Submits Unified Multi-Company Cart (e.g., Beximco + Square items)
         v
[ /api/orders/checkout Engine ]
         |
         | (2) Validate Idempotency & Check DGDA Pharmacy License Status
         | (3) Segregate Cart into Company Clusters: C_1, C_2, ... C_N
         |
         +---> FOR EACH Company Cluster C_i:
         |         |
         |         |-- (a) Check Minimum Order Value (MOV)
         |         |-- (b) Acquire Optimistic Stock Locks (180s TTL)
         |         |-- (c) Allocate Earliest Batches (FEFO Sorting)
         |         |-- (d) Validate Credit Balance / Payment Terms
         |
         | (4) Evaluate All Clusters:
         |     * IF ANY cluster preparation fails:
         |           -> Trigger Automated Rollback (Release all locks, cancel pre-auth)
         |           -> Return structured error report with exact offending SKU / reason
         |     * IF ALL clusters succeed:
         |           -> Begin Atomic Commit Transaction
         |
         +---> ATOMIC COMMIT:
         |         |-- Insert Order Record for C_1 (ORD-...-BEX) + Challan Number
         |         |-- Insert Order Record for C_2 (ORD-...-SQU) + Challan Number
         |         |-- Deduct Batch Quantities (Physical Inventory)
         |         |-- Record Debit Entries in Company Credit Ledgers
         |         |-- Clear Purchased Items from Chemist Cart
         |
         +---> ASYNC EVENT DISPATCH:
                   |-- Push Notification & SMS to Beximco MPO & Tejgaon Depot
                   |-- Push Notification & SMS to Square MPO & Tongi Depot
                   |-- Send Consolidated SMS Confirmation to Pharmacy Owner
```

### 2.3 Stock Reservation Protocol & Optimistic Lock Lifecycle (TTL 180s)
1. **Lock Key Generation:** `stock_lock:{depotId}:{medicineId}:{batchId}`.
2. **Atomic Lock Acquisition:** The engine checks available physical stock minus existing unexpired locks. If available, it registers a lock with an expiration timestamp $T_{now} + 180\text{s}$.
3. **Lock Auto-Expiry:** If checkout confirmation is not received within 180 seconds, background cleanup worker (`reclaimExpiredStockLocks()`) auto-releases reservations, preventing orphaned stock holds during abandoned checkouts.

### 2.4 FEFO Batch Allocation Algorithm
To prevent near-expiry medicines from accumulating, the allocation algorithm selects batches in strict order of earliest expiration:
1. Query active batches for Medicine $M$ at Depot $D$ where $\text{expiryDate} > T_{now} + 90\text{ days}$ (regulatory minimum shelf-life threshold).
2. Sort ascending by `expiryDate ASC`.
3. Sequentially allocate required quantity across batches until satisfied.
4. Record exact batch ID, batch number, and expiry date on `OrderItemAllocation`.

### 2.5 Multi-Company Credit Validation & Ledger Isolation
Each company operates an independent credit ledger:
- Beximco Credit Account: $\text{Available} = \text{Limit} - \text{Used}$.
- Square Credit Account: $\text{Available} = \text{Limit} - \text{Used}$.
- If Company A order is ৳4,000 and available credit is ৳5,000, credit validation passes.
- If Company B order is ৳3,000 and available credit is ৳1,000, the user must select Cash on Delivery (COD) or bKash for Company B, or reduce quantity.

### 2.6 Distributed Transaction Atomicity (Two-Phase Commit & Compensating Rollback)
If the database engine experiences a partial failure during insertion:
1. The transaction coordinator catches the exception.
2. Executes compensating rollback:
   - Releases all acquired `StockLockEngine` reservations.
   - Deletes any partially committed `Order` rows created within the current idempotency session.
   - Emits an alert to the platform monitoring log.
3. Responds to the client with `500 Transaction Aborted: Rolled back cleanly. No funds or stock deducted.`

### 2.7 Architectural Inconsistencies & Conflicting Business Rules Resolved
During architectural review, four critical edge cases were identified and resolved:
1. **Conflict: Partial Stock Failure Across Companies:**
   - *Issue:* If Beximco items are fully in stock, but Square has 1 out-of-stock item, should the whole checkout fail?
   - *Resolution:* **Atomic Protection with User Choice.** By default, the atomic checkout fails with a detailed report: "Square item [X] is short by 2 units. Would you like to place only the Beximco order, or adjust Square quantity and retry all?" The chemist's money and credit are never committed without their explicit consent.
2. **Conflict: Cross-Company MOV Discrepancy:**
   - *Issue:* A chemist adds ৳5,000 of Beximco (MOV ৳2,000 met) and ৳500 of Incepta (MOV ৳1,500 not met).
   - *Resolution:* The UI prevents proceeding to unified checkout until every represented company cluster meets its individual MOV, with live progress meters guiding the user.
3. **Conflict: Depot Delivery Schedule Asynchrony:**
   - *Issue:* Beximco depot order cutoff is 2:00 PM (same-day delivery); Square depot cutoff is 11:00 AM (next-day delivery).
   - *Resolution:* The checkout summary clearly annotates distinct delivery windows per company card ("Beximco: Expected today by 6:00 PM", "Square: Expected tomorrow by 11:00 AM").
4. **Conflict: Chemist License Status Check:**
   - *Issue:* Chemist drug license expires mid-month.
   - *Resolution:* Real-time check at checkout submission blocks the entire order if license is expired, displaying a direct link to the DGDA license renewal portal.

### 2.8 Company-Specific Notification Dispatch Protocol
- **Beximco Order:** Dispatches to Beximco MPO queue and Beximco Tejgaon Depot. MPO view contains only Beximco SKUs.
- **Square Order:** Dispatches to Square MPO queue and Square Tongi Depot. MPO view contains only Square SKUs.
- **Chemist Confirmation:** Receives consolidated SMS detailing all created orders with direct tracking links:
  `"MedGo: Your orders ORD-BEX-1291 (৳4,219.50) & ORD-SQU-8042 (৳2,764.50) confirmed. Total: ৳6,984.00. Track: medgo.bd/orders"`

---


## 3. Feature 1.1: Authentication & Session Management

### 1. Purpose and Expected Functionality
Feature 1.1 provides secure, tamper-proof, multi-channel identity verification and session lifecycle management for all MedGo actors. It allows pharmacy owners, staff, pharmaceutical representatives, and administrators to securely sign in using mobile phone numbers with 6-digit One-Time Passwords (OTP) or corporate email/password credentials, sustaining seamless authenticated sessions with cryptographic tokens stored in `httpOnly` secure cookies.

### 2. Complete End-to-End User Workflow
1. User opens MedGo on mobile browser or desktop and is greeted on the Home Screen.
2. Clicking any restricted action (e.g., "Place Order", "Cart", "Profile", "Dashboard") or the user avatar triggers the `AuthModal` bottom sheet.
3. User selects their role (default: `PHARMACY_OWNER`) and enters their 11-digit Bangladeshi mobile number (`01XXXXXXXXX`) or corporate email.
4. User clicks **"Send OTP Verification Code"**.
5. The backend validates formatting, applies IP/phone rate limiting, generates a cryptographic 6-digit OTP, stores it in cache with a 300-second (5 min) TTL, and dispatches via SMS gateway (with fallback demo bypass code for testing).
6. Frontend switches smoothly to the OTP verification screen with an auto-advancing 6-box PIN input and a 60-second countdown timer.
7. User inputs the 6-digit OTP. On the 6th digit, the frontend automatically dispatches the verification payload to `/api/auth/login`.
8. Backend validates the code, resolves the user profile, creates a signed JWT session token (`mgtok_...`), sets an `httpOnly` secure cookie, and returns the profile payload.
9. Frontend closes the modal, updates `useAuth` reactive state, displays a success toast ("Welcome back, [User Name]!"), and proceeds with the requested action.

### 3. Every User Interaction, Button, Action, and Screen Behavior
- **"Sign In / Register" Avatar Pill:** Opens the `AuthModal` with a smooth spring transition and background dimming (backdrop blur).
- **"Phone Number" Input Field:** Features a fixed `+880` prefix badge, restricts input to numbers only, formats as `01711-409821`, and highlights red on invalid carrier prefixes.
- **"Send OTP" Button:** Shows animated spinner during request, disables on click to prevent double submission, transitions to OTP step upon 200 OK.
- **6-Digit OTP Box Grid:** Auto-focuses on the first box; auto-advances to the next box upon digit input; pressing Backspace focuses the previous box; pasting a 6-digit string populates all 6 boxes automatically.
- **"Resend OTP" Link:** Disabled with a countdown timer (`Resend code in 48s`); turns teal and interactive once countdown reaches zero.
- **"Switch to Password Login" Toggle:** Replaces OTP flow with password field featuring a toggleable eye icon ("Show/Hide Password").
- **"Sign Out" Button in Profile:** Displays confirmation dialog ("Are you sure you want to sign out?"), calls `POST /api/auth/logout`, purges client storage, clears session cookie, and redirects to Home.

### 4. Frontend Functional Requirements
- **Modal Component (`AuthModal.tsx`):** Responsive bottom sheet on mobile (<768px) and centered dialog on tablet/desktop (>=768px). Accessible keyboard navigation (Escape closes, Enter submits).
- **Reactive Auth Context (`AuthContext.tsx` & `useAuth.ts`):** Exposes `user`, `role`, `token`, `isAuthenticated`, `isLoading`, `login()`, `logout()`, `sendOtp()`, and `refreshSession()`.
- **Session Auto-Revalidation:** Listens to focus and online events; re-queries `/api/auth/me` to ensure session validity without disruptive page reloads.
- **Network Resilience:** Shows offline alert banner if user attempts login while disconnected from the internet.

### 5. Backend Business Logic and Processing Rules
- **Phone Normalization:** Strips non-digits, strips leading `+880` or `88`, ensures exactly 11 digits starting with `013`, `014`, `015`, `016`, `017`, `018`, or `019`.
- **OTP Cryptography & Cache:** Generated using `crypto.randomInt(100000, 999999)`. Stored in Redis or persistent memory store with key `otp:{phone}` and TTL of 300 seconds.
- **Rate Limiting & Lockout:** Maximum 3 OTP send requests per phone number per hour. 5 consecutive incorrect OTP entries lock the phone number for 15 minutes.
- **Session Token Issuance:** Signs JWT payload containing `userId`, `role`, `pharmacyId`, `companyId`, `depotId` with secret key using `HS256`, 7-day expiration.
- **Cookie Security Configuration:** `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, `sameSite: 'lax'`, `path: '/'`, `maxAge: 604800`.

### 6. Required API Endpoints with Request and Response Structures

#### `POST /api/auth/otp`
- **Request Body:**
```json
{
  "action": "send",
  "target": "01711409821",
  "type": "phone"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP verification code dispatched to 01711409821. Valid for 5 minutes.",
  "target": "01711409821",
  "cooldownSeconds": 60,
  "demoCode": "412736"
}
```
- **Response (429 Too Many Requests):**
```json
{
  "success": false,
  "error": "Rate limit exceeded. Too many OTP requests for this number. Try again in 15 minutes."
}
```

#### `POST /api/auth/login`
- **Request Body (OTP Verification):**
```json
{
  "identifier": "01711409821",
  "otp": "412736",
  "role": "PHARMACY_OWNER"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "user-po-01",
    "phone": "01711409821",
    "email": "greencare.pharm@gmail.com",
    "fullName": "Dr. Rafiqul Islam",
    "role": "PHARMACY_OWNER",
    "pharmacyId": "pharm-01",
    "pharmacyName": "Green Care Pharmacy & Med Store",
    "isVerified": true
  },
  "token": "mgtok_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Response (401 Unauthorized - Invalid OTP):**
```json
{
  "success": false,
  "error": "Invalid verification code. 4 attempts remaining before temporary lockout."
}
```

#### `GET /api/auth/me`
- **Headers:** `Cookie: medgo_session=...` or `Authorization: Bearer mgtok_...`
- **Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "user-po-01",
    "phone": "01711409821",
    "fullName": "Dr. Rafiqul Islam",
    "role": "PHARMACY_OWNER",
    "pharmacyId": "pharm-01",
    "pharmacyName": "Green Care Pharmacy & Med Store",
    "creditBalance": 85500.00,
    "creditLimit": 100000.00
  }
}
```

#### `POST /api/auth/logout`
- **Response (200 OK):** Sets cookie `medgo_session=deleted; Max-Age=0; Path=/` and returns `{"success": true, "message": "Successfully signed out"}`.

### 7. Database Tables, Fields, Relationships, and Constraints
```prisma
model User {
  id              String         @id @default(cuid())
  phone           String         @unique @db.VarChar(15)
  email           String?        @unique @db.VarChar(100)
  passwordHash    String?        @db.VarChar(255)
  fullName        String         @db.VarChar(100)
  role            UserRole       @default(PHARMACY_OWNER)
  pharmacyId      String?
  companyId       String?
  depotId         String?
  isVerified      Boolean        @default(false)
  failedAttempts  Int            @default(0)
  lockoutUntil    DateTime?
  lastLoginAt     DateTime?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  pharmacy        Pharmacy?      @relation(fields: [pharmacyId], references: [id])
  company         Company?       @relation(fields: [companyId], references: [id])
  sessions        Session[]

  @@index([phone])
  @@index([role])
}

model Session {
  id           String    @id @default(cuid())
  userId       String
  tokenHash    String    @unique
  userAgent    String?
  ipAddress    String?   @db.VarChar(45)
  expiresAt    DateTime
  createdAt    DateTime  @default(now())

  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([tokenHash])
}

enum UserRole {
  PHARMACY_OWNER
  RETAIL_PHARMACY
  SALES_REP
  PHARMA_COMPANY
  DEPOT_MANAGER
  ADMIN
}
```

### 8. Authentication, Authorization, and Security Requirements
- Passwords must be hashed using `bcrypt` (work factor 12) or Argon2id.
- JWT session tokens must be signed with 256-bit secret key; secret rotation supported via key IDs (`kid`).
- Session cookies must enforce `HttpOnly`, `SameSite=Lax`, and `Secure` flags.
- Cross-Site Request Forgery (CSRF) mitigation via custom `x-medgo-client` request header validation.
- All failed authentication attempts must be logged to an audit security stream with IP and User-Agent.

### 9. Input Validation, Edge Cases, and Error Handling
- **Non-BD Carrier Prefix:** If user enters `011XXXXXXXX` or `012XXXXXXXX`, reject with "Please enter a valid Bangladeshi mobile operator number".
- **Short or Long Digits:** Enforce exact 11-digit regex `^01[3-9]\d{8}$`.
- **Expired OTP:** If OTP submitted after 300 seconds, return 410 Gone: "Verification code has expired. Request a new one."
- **Network Drop during Verification:** Client retries up to 2 times with exponential backoff before displaying "Connection interrupted. Check your internet connection."

### 10. Dependencies on Other Features
- Depends on: None (Foundation module).
- Depended on by: Features 1.2 (RBAC), 1.3 (Pharmacy Profiles), 1.8 (Cart), 1.9 (Checkout), 1.10 (Order Decomposition).

### 11. Detailed Acceptance Criteria
- [x] Entering valid phone number sends 6-digit OTP and returns 60-second cooldown.
- [x] Auto-advancing OTP input works seamlessly across desktop and mobile keyboards.
- [x] Pasting 6-digit OTP into first box fills all 6 inputs and triggers submission.
- [x] Valid OTP sets `medgo_session` cookie and updates client state in <200ms.
- [x] Invalid OTP highlights inputs in red with remaining attempt count.
- [x] 5 incorrect attempts locks account for 15 minutes.
- [x] Refreshing page maintains logged-in state without flicker.
- [x] Sign Out completely clears cookies, cache, and state.

### 12. Positive, Negative, and Edge-Case Testing Scenarios
- **Positive Test 1.1.1:** Sign in with valid number `01711409821` and demo code `412736`. Verify 200 OK, cookie set, and `useAuth().isAuthenticated === true`.
- **Negative Test 1.1.2:** Submit invalid OTP `000000`. Verify 401 Unauthorized, error toast displayed, and attempt count decremented.
- **Negative Test 1.1.3:** Attempt to request OTP 4 times within 2 minutes. Verify 4th request returns 429 Too Many Requests.
- **Edge Case 1.1.4:** Fast-paste 6 digits while on mobile. Verify all fields populate accurately without truncation.
- **Edge Case 1.1.5:** Clock drift test: Submit OTP at 299 seconds. Verify acceptance; submit at 301 seconds, verify rejection.


## 4. Feature 1.2: User Roles & RBAC (6-Role Architecture)

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


## 5. Feature 1.3: Pharmacy Profiles & Compliance

### 1. Purpose and Expected Functionality
Feature 1.3 establishes the authoritative Digital Twin and regulatory compliance record for retail pharmacies. Under Directorate General of Drug Administration (DGDA) regulations, medicine wholesale delivery is strictly prohibited to unlicensed or expired premises. Feature 1.3 captures and verifies the pharmacy's legal Trade License, DGDA Drug License (`DL-XXX/XXXX`), Tax Identification Number (TIN/BIN), Pharmacist-in-Charge credentials, verified GPS geolocation coordinates, and credit terms across manufacturer accounts.

### 2. Complete End-to-End User Workflow
1. Pharmacy Owner navigates to **Profile** or clicks on the pharmacy banner in the header.
2. System displays the verified digital profile: Pharmacy Legal Name, DGDA License number, Expiration Date, Verification Badge (Green Shield), Pharmacist Registration, and Geographic Location.
3. User clicks **"Edit Profile & Regulatory Info"**.
4. User updates store operating hours, emergency contact phone, or uploads an renewed DGDA license document PDF/JPG.
5. User clicks the **"Set Location on Map"** button. The browser prompts for HTML5 geolocation permission; upon acceptance, a pin drops at their current GPS coordinates. The user fine-tunes the pin on the interactive Leaflet map to their exact storefront door.
6. User clicks **"Save Profile & Compliance"**.
7. Backend validates the DGDA license format against regulatory standards, checks expiration date (> today), updates geographic coordinates, and resets the verification status to `PENDING_AUDIT` if the license number changed.
8. Frontend displays a confirmation toast and updates the store header with the latest verified data.

### 3. Every User Interaction, Button, Action, and Screen Behavior
- **"Pharmacy Verification Shield" Badge:** Displays "DGDA Verified" in emerald green when license is active; turns amber with "Expires in 28 Days" warning; turns crimson "Compliance Blocked" if license is expired.
- **"Edit Profile" Button:** Opens the Profile Editor modal with tabbed sections: General Info, DGDA Compliance, and GPS Geolocation.
- **"Upload Drug License" File Dropzone:** Accepts PDF, JPG, and PNG files up to 5MB. Previews thumbnail with "Change" and "Remove" buttons.
- **"Pin My Storefront GPS" Button:** Queries `navigator.geolocation.getCurrentPosition()`. Automatically reverse-geocodes coordinates into Thana, District, and Division.
- **"Save Changes" Button:** Disabled if required fields are missing; displays loading spinner during upload and commit; triggers success alert on completion.

### 4. Frontend Functional Requirements
- **Interactive Map Picker Component (`StorefrontMapPicker.tsx`):** Leaflet/OpenStreetMap integration allowing dragging of a storefront marker with live latitude and longitude readouts.
- **License Expiry Alert Banner:** Surface non-intrusive warning when license expiration is within 30 days.
- **Document Viewer:** Modal enabling the owner to preview previously uploaded compliance certificates and challans.

### 5. Backend Business Logic and Processing Rules
- **DGDA License Regex Validation:** Enforces standard DGDA format `^DL-[A-Z]{2,4}-\d{4,8}$` or district formats (e.g. `DA-12345`).
- **License Expiry Check:** If `licenseExpiryDate < now()`, the pharmacy is automatically flagged with `isOrderBlocked: true`, preventing checkout in Feature 1.9.
- **Geo-Bounding Validation:** Checks that latitude is between `20.5` and `26.7` and longitude is between `88.0` and `92.7` (Bangladesh geographic boundary).
- **Audit Trail:** Any modification to license numbers or ownership details writes an immutable log to `ComplianceAuditLog`.

### 6. Required API Endpoints with Request and Response Structures

#### `GET /api/pharmacies?id=pharm-01`
- **Headers:** `Authorization: Bearer mgtok_...`
- **Response (200 OK):**
```json
{
  "success": true,
  "pharmacy": {
    "id": "pharm-01",
    "name": "Green Care Pharmacy & Med Store",
    "ownerName": "Dr. Rafiqul Islam",
    "phone": "01711409821",
    "email": "greencare.pharm@gmail.com",
    "dgdaLicenseNumber": "DL-DHK-2024-8841",
    "licenseExpiryDate": "2027-12-31T23:59:59.000Z",
    "isVerified": true,
    "isOrderBlocked": false,
    "pharmacistRegNumber": "PR-88219-BPC",
    "pharmacistName": "Md. Nazmul Karim, B.Pharm",
    "tinBinNumber": "9812-4019-22",
    "location": {
      "address": "House 14, Road 7, Dhanmondi",
      "thana": "Dhanmondi",
      "district": "Dhaka",
      "division": "Dhaka",
      "latitude": 23.7465,
      "longitude": 90.3760
    },
    "creditSummary": {
      "totalCreditLimit": 100000.00,
      "usedCredit": 14500.00,
      "availableCredit": 85500.00,
      "overdueBalance": 0.00
    }
  }
}
```

#### `PUT /api/pharmacies`
- **Request Body:**
```json
{
  "id": "pharm-01",
  "name": "Green Care Pharmacy & Healthcare Store",
  "phone": "01711409821",
  "pharmacistRegNumber": "PR-88219-BPC",
  "pharmacistName": "Md. Nazmul Karim, B.Pharm",
  "latitude": 23.74652,
  "longitude": 90.37605,
  "address": "House 14, Road 7, Dhanmondi, Dhaka"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Pharmacy profile and location updated successfully.",
  "updatedAt": "2026-11-11T16:45:00Z"
}
```

### 7. Database Tables, Fields, Relationships, and Constraints
```prisma
model Pharmacy {
  id                   String              @id @default(cuid())
  name                 String              @db.VarChar(150)
  ownerName            String              @db.VarChar(100)
  phone                String              @db.VarChar(15)
  email                String?             @db.VarChar(100)
  dgdaLicenseNumber    String              @unique @db.VarChar(50)
  licenseExpiryDate    DateTime
  isVerified           Boolean             @default(false)
  isOrderBlocked       Boolean             @default(false)
  pharmacistRegNumber  String?             @db.VarChar(50)
  pharmacistName       String?             @db.VarChar(100)
  tinBinNumber         String?             @db.VarChar(50)
  address              String              @db.VarChar(255)
  thana                String              @db.VarChar(50)
  district             String              @db.VarChar(50)
  division             String              @db.VarChar(50)
  latitude             Float
  longitude            Float
  createdAt            DateTime            @default(now())
  updatedAt            DateTime            @updatedAt

  users                User[]
  creditAccounts       CompanyCreditLine[]
  orders               Order[]
  auditLogs            ComplianceAuditLog[]

  @@index([dgdaLicenseNumber])
  @@index([thana, district])
  @@index([latitude, longitude])
}

model ComplianceAuditLog {
  id           String    @id @default(cuid())
  pharmacyId   String
  changedBy    String
  fieldName    String    @db.VarChar(50)
  oldValue     String?   @db.Text
  newValue     String?   @db.Text
  timestamp    DateTime  @default(now())

  pharmacy     Pharmacy  @relation(fields: [pharmacyId], references: [id])
  @@index([pharmacyId])
}
```

### 8. Authentication, Authorization, and Security Requirements
- Profile editing restricted to `PHARMACY_OWNER` and `ADMIN`.
- Read operations allowed for authenticated staff (`RETAIL_PHARMACY`) and assigned MPOs (`SALES_REP`).
- Sensitive financial metrics (used credit, credit limit) masked for unauthenticated public viewers.
- File uploads scanned for malicious executables; MIME types restricted strictly to `application/pdf`, `image/jpeg`, `image/png`.

### 9. Input Validation, Edge Cases, and Error Handling
- **License Renewal Expired:** If `licenseExpiryDate` entered is in the past, return 422 Unprocessable Entity with message: "Cannot register an expired DGDA drug license".
- **Duplicate License Registration:** If another pharmacy already registered the same DGDA license number, reject with 409 Conflict: "License already registered to another retail establishment. Contact DGDA compliance desk."
- **GPS Coordinates Out of Bounds:** Latitude outside [20.5, 26.7] or Longitude outside [88.0, 92.7] returns: "Location must be within Bangladesh territory".

### 10. Dependencies on Other Features
- Depends on: Feature 1.1 (Auth), Feature 1.2 (RBAC).
- Depended on by: Feature 1.4 (Depot routing by Thana), Feature 1.9 (Checkout validation), Feature 1.10 (Order generation).

### 11. Detailed Acceptance Criteria
- [x] Pharmacy profile accurately displays owner, address, license number, and verified status.
- [x] Interactive map picker allows fine-tuning latitude and longitude to 5 decimal places.
- [x] DGDA license format validated with strict regex.
- [x] Expired license disables checkout and shows prominent compliance warning banner.
- [x] Changes to compliance records generate immutable audit trail entries.

### 12. Positive, Negative, and Edge-Case Testing Scenarios
- **Positive Test 1.3.1:** Update store address and GPS coordinates. Verify 200 OK, database updated, and map pin reflects new position.
- **Negative Test 1.3.2:** Enter invalid DGDA license format `INVALID-123`. Verify 422 Unprocessable Entity with formatting guidance.
- **Negative Test 1.3.3:** Staff user (`RETAIL_PHARMACY`) attempts `PUT /api/pharmacies`. Verify 403 Forbidden.
- **Edge Case 1.3.4:** License expiring at 23:59:59 tonight. Verify warning banner appears; at 00:00:01 next day, verify `isOrderBlocked === true`.


## 6. Feature 1.4: Pharmaceutical Company & Depot Directory

### 1. Purpose and Expected Functionality
Feature 1.4 provides the verified master directory of Bangladesh's licensed pharmaceutical manufacturers (e.g., Beximco Pharmaceuticals, Square Pharmaceuticals, Incepta, Renata, Opsonin, Eskayef, Acme, ACI, Aristopharma, Healthcare, etc.) and their regional distribution depots / hubs. It maps each pharmacy's geographical location (Thana/District) to the designated authorized distributor depot, tracking operating hours, dispatch cutoff times, cold chain certification, and direct distributor contact channels.

### 2. Complete End-to-End User Workflow
1. User clicks **"Explore"** in the bottom navigation or **"All Hubs & Depots"** dropdown selector in the header.
2. System displays a directory of verified pharmaceutical companies with manufacturer logos, corporate headquarters, customer care hotlines, active SKU counts, and regional depot locations.
3. User selects a company (e.g., "Beximco Pharmaceuticals Ltd.") or selects a specific depot filter (e.g., "Tejgaon Regional Distribution Depot").
4. System displays the detailed company card: DGDA Manufacturer License Number, Central Order Desk Contact, Regional Sales Manager info, and the list of service depots covering the user's Thana.
5. For each depot, the user sees live fulfillment status: "Open (Next dispatch: 2:00 PM)", "Cold Chain Certified (2-8°C refrigerated vans)", and contact details for the depot dispatch manager.
6. User can click **"View Catalog"** to filter the marketplace catalog exclusively to medicines manufactured by this company, or click **"Call Depot Desk"** to trigger a direct phone call.

### 3. Every User Interaction, Button, Action, and Screen Behavior
- **"All Hubs & Depots" Selector Dropdown:** Opens interactive bottom-sheet on mobile; lists nearby distribution hubs sorted by road distance from the pharmacy's GPS coordinates.
- **Company Search Bar:** Real-time filter querying company name, headquarter city, and brand aliases.
- **"View Company Catalog" Action Button:** Navigates to `/explore?manufacturer=Beximco`, applying company filter to the medicine catalog.
- **"Call Depot Desk" Phone Icon:** Triggers `tel:+88029876543` for direct telephone communication with the warehouse dispatch officer.
- **Cold Chain Indicator Icon (Snowflake):** Blue snowflake badge with tooltip: "Equipped with temperature-monitored refrigerated transport (2°C - 8°C)".

### 4. Frontend Functional Requirements
- **Company Directory Screen & Grid (`CompanyDirectory.tsx`):** Responsive grid displaying company cards with verified DGDA badges, depot coverage indicators, and order cutoff badges.
- **Depot Modal Sheet (`DepotDetailModal.tsx`):** Displays depot GPS location on map, covered Thanas, daily delivery schedule, and depot manager contact info.
- **Nearest Depot Resolver:** Calculates Haversine distance between pharmacy latitude/longitude and depot coordinates to display "Nearest Depot: 3.2 km away".

### 5. Backend Business Logic and Processing Rules
- **Depot Territory Coverage Resolution:** When an order is placed in Thana $T$, the system queries the `DepotCoverage` table to find the authorized depot for Company $C$ covering Thana $T$.
- **Delivery Cutoff Calculations:** If current time is before the depot's `orderCutoffTime` (e.g., 14:00), estimated delivery is calculated as "Today, 5:00 PM - 8:00 PM"; if after cutoff, estimated delivery defaults to "Tomorrow, 10:00 AM - 1:00 PM".
- **Minimum Order Value (MOV) Rules:** Each company defines its own minimum order threshold (e.g., Beximco: ৳2,000, Square: ৳3,000, Incepta: ৳1,500).

### 6. Required API Endpoints with Request and Response Structures

#### `GET /api/companies`
- **Query Parameters:** `q` (optional search query), `thana` (optional location filter)
- **Response (200 OK):**
```json
{
  "success": true,
  "count": 42,
  "companies": [
    {
      "id": "comp-beximco",
      "name": "Beximco Pharmaceuticals Ltd.",
      "code": "BEX",
      "logoUrl": "/logos/beximco.png",
      "dgdaManufacturerNumber": "MFG-LIC-0012",
      "headquarters": "17 Dhanmondi R/A, Road 2, Dhaka-1205",
      "supportPhone": "+880258611001",
      "supportEmail": "orderdesk@bpl.net",
      "minimumOrderAmount": 2000.00,
      "totalMedicinesCount": 420,
      "depots": [
        {
          "id": "depot-bex-dhk-01",
          "name": "Beximco Central Depot - Tejgaon",
          "address": "282/C Tejgaon I/A, Dhaka-1208",
          "thana": "Tejgaon",
          "contactPhone": "01730012345",
          "isColdChainCertified": true,
          "orderCutoffTime": "14:00",
          "distanceKm": 4.1
        }
      ]
    }
  ]
}
```

#### `GET /api/companies/[companyId]/depots`
- **Response (200 OK):**
```json
{
  "success": true,
  "companyId": "comp-beximco",
  "companyName": "Beximco Pharmaceuticals Ltd.",
  "depots": [
    {
      "id": "depot-bex-dhk-01",
      "name": "Tejgaon Distribution Depot",
      "coveredThanas": ["Dhanmondi", "Tejgaon", "Mirpur", "Mohammadpur", "Gulshan"],
      "dispatchSchedules": ["11:00 AM", "03:00 PM"],
      "depotManager": "Md. Shahadat Hossain",
      "managerPhone": "01730012345"
    }
  ]
}
```

### 7. Database Tables, Fields, Relationships, and Constraints
```prisma
model Company {
  id                  String              @id @default(cuid())
  name                String              @unique @db.VarChar(150)
  code                String              @unique @db.VarChar(10)
  logoUrl             String?             @db.VarChar(255)
  dgdaManufacturerNo  String              @unique @db.VarChar(50)
  headquarters        String              @db.VarChar(255)
  supportPhone        String              @db.VarChar(20)
  supportEmail        String?             @db.VarChar(100)
  minimumOrderAmount  Decimal             @default(1000.00) @db.Decimal(10, 2)
  isActive            Boolean             @default(true)
  createdAt           DateTime            @default(now())

  medicines           Medicine[]
  depots              Depot[]
  creditLines         CompanyCreditLine[]
  orders              Order[]
  reps                User[]

  @@index([name])
  @@index([code])
}

model Depot {
  id                    String          @id @default(cuid())
  companyId             String
  name                  String          @db.VarChar(150)
  address               String          @db.VarChar(255)
  thana                 String          @db.VarChar(50)
  district              String          @db.VarChar(50)
  division              String          @db.VarChar(50)
  latitude              Float
  longitude             Float
  contactPhone          String          @db.VarChar(20)
  isColdChainCertified  Boolean         @default(true)
  orderCutoffTime       String          @db.VarChar(10)
  createdAt             DateTime        @default(now())

  company               Company         @relation(fields: [companyId], references: [id])
  coveredThanas         DepotCoverage[]
  batches               MedicineBatch[]
  orders                Order[]

  @@index([companyId])
  @@index([thana, district])
}

model DepotCoverage {
  id         String   @id @default(cuid())
  depotId    String
  thana      String   @db.VarChar(50)
  district   String   @db.VarChar(50)

  depot      Depot    @relation(fields: [depotId], references: [id])
  @@unique([depotId, thana, district])
  @@index([thana, district])
}
```

### 8. Authentication, Authorization, and Security Requirements
- Public directory browsing is unrestricted to permit market transparency.
- Modifying company parameters (e.g. `minimumOrderAmount`, contact info) restricted to `PHARMA_COMPANY` and `ADMIN`.
- Modifying depot coverage boundaries restricted to `DEPOT_MANAGER` and `ADMIN`.

### 9. Input Validation, Edge Cases, and Error Handling
- **Unassigned Thana Coverage:** If a pharmacy is located in a remote Thana without a direct depot mapping, fallback to the Central Divisional Depot with an extended delivery ETA notice.
- **Deactivated Company:** If a manufacturer's license is suspended by DGDA, set `isActive: false`, immediately hiding its catalog from search results and rejecting new orders.

### 10. Dependencies on Other Features
- Depends on: Feature 1.3 (Pharmacy location for distance calculation).
- Depended on by: Feature 1.5 (Catalog grouping), Feature 1.8 (Cart grouping), Feature 1.10 (Depot order routing).

### 11. Detailed Acceptance Criteria
- [x] Company directory lists all 40+ major manufacturers with accurate logo and DGDA credentials.
- [x] Selecting a company provides direct filtered access to its medicine catalog.
- [x] Depots accurately display cold chain certification and order cutoff hours.
- [x] Haversine distance calculator computes distance from pharmacy to depot.

### 12. Positive, Negative, and Edge-Case Testing Scenarios
- **Positive Test 1.4.1:** Query `/api/companies?q=Square`. Verify 200 OK with Square Pharmaceuticals profile, logo, and active depots.
- **Negative Test 1.4.2:** Query `/api/companies/invalid-id/depots`. Verify 404 Not Found.
- **Negative Test 1.4.3:** Non-admin user attempts `POST /api/companies`. Verify 403 Forbidden.
- **Edge Case 1.4.4:** Order placed at 13:59 (before 14:00 cutoff) vs 14:01 (after cutoff). Verify delivery ETA shifts from same-day to next-day morning.


## 7. Feature 1.5: Medicine Catalog & Clinical Taxonomy

### 1. Purpose and Expected Functionality
Feature 1.5 manages MedGo's clinical medicine catalog and packaging taxonomy across 41,000+ registered pharmaceutical SKUs. It structures medicines hierarchically by Brand Name, Generic Molecule (INN), Strength, Dosage Form, Therapeutic Category, and Manufacturer. Crucially, it normalizes complex B2B pharmaceutical packaging units (`BOX`, `STRIP`, `PIECE`), enforcing mathematical conversion ratios, DGDA Maximum Retail Price (MRP), wholesale Trade Price (TP), statutory chemist margins (12-16%), Minimum Order Quantities (MOQ), and regulatory flags (Prescription Required, Cold Chain 2-8°C, Schedule Narcotics).

### 2. Complete End-to-End User Workflow
1. Pharmacy Owner or Staff navigates to the **Explore / Medicine Catalog** tab.
2. The user browses categories (e.g. "Antibiotics", "Cardiovascular", "Analgesics & Antipyretics") or scrolls through the medicine cards.
3. Each medicine card displays Brand Name (e.g. "Napa Extra"), Generic Molecule ("Paracetamol 500mg + Caffeine 65mg"), Dosage Form ("Tablet"), Manufacturer ("Beximco Pharmaceuticals Ltd."), Trade Price per Box, and MRP.
4. User taps on a medicine card to open the **Medicine Specification Detail Modal**.
5. The detail view displays full packaging breakdown: "Pack Size: 20 Strips / Box × 10 Tablets / Strip = 200 Tablets / Box".
6. User can select their ordering unit: "Order by Box" (Wholesale default) or "Order by Strip" (Supported for fast-moving items).
7. The user views real-time stock availability, minimum order quantity (MOQ: 1 Box), and applicable trade schemes ("Buy 10 Boxes, Get 1 Box Free").
8. User clicks **"Add to Cart"** or increases the quantity stepper.

### 3. Every User Interaction, Button, Action, and Screen Behavior
- **Unit Selector Toggle (`BOX` vs `STRIP`):** Switches active pricing and packaging multiplier. Updating unit automatically recalibrates the subtotal and MOQ counter.
- **Quantity Stepper (+ / - Buttons):** Increments or decrements count; holding button accelerates stepper; prevents stepping below MOQ.
- **Prescription Badge ("Rx"):** Displayed in coral red for prescription-only medicines with tooltip: "Requires valid registered physician prescription on delivery".
- **Cold Chain Badge ("2-8°C"):** Displayed in cyan with refrigeration icon; alerts user that cold storage facilities are required at delivery destination.
- **"Add to Cart" Primary Button:** Flashes green on click with haptic vibration; displays animated cart icon fly-to-cart effect; updates header cart badge count.

### 4. Frontend Functional Requirements
- **Medicine Card Component (`MedicineCatalogCard.tsx`):** Lightweight, virtualized card component rendering brand name, generic badge, strength, price comparison (MRP vs TP), and quick-add button.
- **Packaging Calculation Helper (`usePackaging.ts`):** Client-side hook resolving total tablets, total cost, and chemist profit margin percentage:
  $$\text{Chemist Margin (\%)} = \frac{\text{MRP} - \text{Trade Price}}{\text{MRP}} \times 100$$
- **High-Performance Virtualized List:** Seamless 60 FPS scrolling through 1,000+ medicines using windowing (react-window or tanstack virtual).

### 5. Backend Business Logic and Processing Rules
- **Mathematical Packaging Engine:** Enforces canonical packaging formulas:
  - $\text{Units per Box} = \text{stripsPerBox} \times \text{piecesPerStrip}$
  - $\text{Trade Price per Strip} = \frac{\text{tradePricePerBox}}{\text{stripsPerBox}}$
  - $\text{Trade Price per Piece} = \frac{\text{tradePricePerBox}}{\text{Units per Box}}$
- **DGDA Margin Rule:** Validates that wholesale Trade Price does not exceed legal statutory maximums relative to MRP.
- **MOQ Enforcement:** Orders submitted with quantities less than `minOrderQuantity` are rejected by validation layer.

### 6. Required API Endpoints with Request and Response Structures

#### `GET /api/medicines/[medicineId]`
- **Response (200 OK):**
```json
{
  "success": true,
  "medicine": {
    "id": "med-bex-napa-extra-500",
    "name": "Napa Extra",
    "genericName": "Paracetamol + Caffeine",
    "strength": "500 mg + 65 mg",
    "dosageForm": "Tablet",
    "therapeuticClass": "Analgesics & Antipyretics",
    "manufacturer": {
      "id": "comp-beximco",
      "name": "Beximco Pharmaceuticals Ltd.",
      "code": "BEX"
    },
    "packaging": {
      "stripsPerBox": 20,
      "piecesPerStrip": 10,
      "totalUnitsPerBox": 200,
      "unitType": "BOX",
      "packDescription": "20 x 10's blister pack in printed carton"
    },
    "pricing": {
      "mrpPerBox": 500.00,
      "mrpPerStrip": 25.00,
      "mrpPerPiece": 2.50,
      "tradePricePerBox": 435.00,
      "tradePricePerStrip": 21.75,
      "tradePricePerPiece": 2.175,
      "chemistMarginPercent": 13.0,
      "vatIncluded": true
    },
    "commercial": {
      "minOrderQuantity": 2,
      "availableStockBoxes": 1420,
      "isPrescriptionRequired": false,
      "requiresRefrigeration": false,
      "isNarcotic": false
    }
  }
}
```

### 7. Database Tables, Fields, Relationships, and Constraints
```prisma
model Medicine {
  id                     String              @id @default(cuid())
  companyId              String
  name                   String              @db.VarChar(150)
  genericName            String              @db.VarChar(150)
  strength               String              @db.VarChar(50)
  dosageForm             String              @db.VarChar(50)
  therapeuticClass       String              @db.VarChar(100)
  stripsPerBox           Int                 @default(10)
  piecesPerStrip         Int                 @default(10)
  mrp                    Decimal             @db.Decimal(10, 2)
  tradePrice             Decimal             @db.Decimal(10, 2)
  minOrderQuantity       Int                 @default(1)
  isPrescriptionRequired Boolean             @default(false)
  requiresRefrigeration  Boolean             @default(false)
  isNarcotic             Boolean             @default(false)
  imageUrl               String?             @db.VarChar(255)
  isActive               Boolean             @default(true)
  createdAt              DateTime            @default(now())

  company                Company             @relation(fields: [companyId], references: [id])
  batches                MedicineBatch[]
  orderItems             OrderItem[]
  cartItems              CartItem[]

  @@index([companyId])
  @@index([genericName])
  @@index([dosageForm])
  @@index([therapeuticClass])
}

model MedicineBatch {
  id              String      @id @default(cuid())
  medicineId      String
  depotId         String
  batchNumber     String      @db.VarChar(50)
  manufactureDate DateTime
  expiryDate      DateTime
  stockQuantity   Int         @default(0)
  allocatedStock  Int         @default(0)
  createdAt       DateTime    @default(now())

  medicine        Medicine    @relation(fields: [medicineId], references: [id])
  depot           Depot       @relation(fields: [depotId], references: [id])
  orderAllocations OrderItemAllocation[]

  @@unique([medicineId, depotId, batchNumber])
  @@index([expiryDate])
}
```

### 8. Authentication, Authorization, and Security Requirements
- Catalog browsing is public and optimized for caching at edge CDNs.
- Modifying medicine formulas, trade prices, or packaging specs restricted to `PHARMA_COMPANY` and `ADMIN`.
- Read operations for batch expiry dates and precise batch counts restricted to authenticated pharmacies.

### 9. Input Validation, Edge Cases, and Error Handling
- **Non-Positive Pack Multipliers:** `stripsPerBox` and `piecesPerStrip` must be positive integers $\ge 1$.
- **Inverted Pricing Violation:** `tradePrice` cannot be greater than or equal to `mrp`. If `tradePrice >= mrp`, throw 400 Bad Request: "Trade Price must be less than MRP to preserve statutory chemist margin."
- **Zero Quantity Order:** Stepper prevented from going to 0; minimum allowable value is `minOrderQuantity`.

### 10. Dependencies on Other Features
- Depends on: Feature 1.4 (Manufacturer mapping).
- Depended on by: Feature 1.6 (Search), Feature 1.8 (Cart), Feature 1.10 (Batch deduction).

### 11. Detailed Acceptance Criteria
- [x] Medicine catalog renders generic name, strength, dosage form, manufacturer, and pricing.
- [x] Packaging math accurately translates boxes to strips and tablets.
- [x] Chemist margin percentage accurately calculated and displayed.
- [x] Cold chain and prescription badges clearly displayed when applicable.
- [x] MOQ constraints strictly enforced by quantity stepper.

### 12. Positive, Negative, and Edge-Case Testing Scenarios
- **Positive Test 1.5.1:** Query `/api/medicines/med-bex-napa-extra-500`. Verify 200 OK with accurate packaging calculations (`200` total units).
- **Negative Test 1.5.2:** Attempt to create a medicine with Trade Price ৳100 and MRP ৳90. Verify 400 Bad Request rejection.
- **Negative Test 1.5.3:** Set quantity to 0 on cart stepper. Verify value clamps to MOQ of 1.
- **Edge Case 1.5.4:** Medicine with non-standard packaging (e.g. Syrup: 1 bottle per box, 0 strips). System must handle `stripsPerBox = 1` and `piecesPerStrip = 1` without division-by-zero errors.


## 8. Feature 1.6: Multi-Attribute Medicine Search & Discovery Engine

### 1. Purpose and Expected Functionality
Feature 1.6 provides a high-performance, multi-attribute pharmaceutical discovery engine capable of sub-50ms search and facet filtering across 41,000+ medicine records. Chemists and pharmacy staff frequently search using varied criteria: partial brand names (e.g. "Napa"), generic molecule names ("Paracetamol"), dosage strengths ("500mg"), therapeutic categories ("Antibiotics"), or specific pharmaceutical manufacturers ("Square"). The engine delivers instantaneous, debounced results with phonetic fault tolerance, Bengali transliteration matching (e.g. "নাপা"), and facet sorting by price, popularity, and stock availability.

### 2. Complete End-to-End User Workflow
1. User taps the search bar labeled **"Search medicines, generics, brands..."** on the Home Screen or Explore tab.
2. An interactive search overlay activates with immediate suggestions: "Recent Searches", "Trending Generics" (e.g. Omeprazole, Montelukast, Cefixime), and "Top Manufacturers".
3. User types a query (e.g., "seclo 20").
4. Frontend debounces keystrokes by 250ms and dispatches query to `GET /api/medicines?q=seclo+20`.
5. Backend parses tokens: identifies brand prefix "seclo" and strength token "20mg"; executes full-text index query; returns ranked results in <35ms.
6. User refines results using interactive filter chips:
   - Filter by Company: "Square Pharmaceuticals"
   - Filter by Form: "Capsule"
   - Filter by Stock: "In Stock Only"
7. Results re-render instantaneously. User clicks on a result to view details or clicks the quick "+" button to stage directly to cart.

### 3. Every User Interaction, Button, Action, and Screen Behavior
- **Search Input Field:** Features a left-aligned magnifying glass icon, a right-aligned clear "X" button when populated, and an active voice-search microphone toggle.
- **Filter Chips Horizontal Carousel:** Scrollable pills for "In Stock", "Tablet", "Capsule", "Syrup", "Injection", and "Prescription Required". Tapping a chip toggles its active teal highlight.
- **Sort Selector Dropdown:** Options for "Relevance (Default)", "Price: Low to High", "Price: High to Low", "Chemist Margin (%)", and "Alphabetical (A-Z)".
- **Empty State Display:** When no matches are found, renders a friendly empty-state illustration: "No medicines found matching '[Query]'. Check spelling or search by Generic name (e.g. 'Paracetamol')."
- **"Clear All Filters" Link:** Appears when one or more filters are active; resets all facets to defaults with one click.

### 4. Frontend Functional Requirements
- **Debounced Search Hook (`useDebounce.ts`):** 250ms debounce window preventing network saturation while keeping UI reactive.
- **Search History Manager (`useSearchHistory.ts`):** Stores last 10 successful search terms in browser `localStorage`, with individual remove and clear-all actions.
- **Highlight Matching Substrings:** Highlights the matched characters in yellow/teal bold within the brand and generic labels.

### 5. Backend Business Logic and Processing Rules
- **Multi-Token Query Parsing:** Splits query string into alphanumeric tokens, extracting dosage strengths (e.g., regex `\d+\s*(mg|ml|gm|mcg)`) into a dedicated strength filter parameter.
- **Full-Text & Trigram Matching:** Uses PostgreSQL `pg_trgm` or Prisma full-text search against `name`, `genericName`, and `therapeuticClass` with GIN indexing.
- **Bengali Transliteration Map:** Maps common Bengali phonetic inputs to English generic equivalents (e.g., "প্যারাসিটামল" -> "Paracetamol", "সার্জেল" -> "Sergel").
- **Stock Priority Ranking:** In-stock medicines at the nearest depot are boosted above out-of-stock items in the default relevance ranking.

### 6. Required API Endpoints with Request and Response Structures

#### `GET /api/medicines`
- **Query Parameters:**
  - `q`: Search keyword (e.g. `napa`)
  - `generic`: Specific generic filter
  - `manufacturer`: Company ID or name
  - `form`: Dosage form (e.g. `Tablet`)
  - `inStock`: Boolean flag (`true`/`false`)
  - `sortBy`: `relevance` | `price_asc` | `price_desc` | `margin`
  - `page`: Page index (default: `1`)
  - `limit`: Items per page (default: `20`, max: `100`)
- **Response (200 OK):**
```json
{
  "success": true,
  "query": "napa",
  "totalMatches": 18,
  "page": 1,
  "totalPages": 1,
  "filters": {
    "activeManufacturer": "all",
    "activeForm": "all",
    "inStockOnly": false
  },
  "medicines": [
    {
      "id": "med-bex-napa-500",
      "name": "Napa",
      "genericName": "Paracetamol",
      "strength": "500 mg",
      "dosageForm": "Tablet",
      "manufacturer": {
        "id": "comp-beximco",
        "name": "Beximco Pharmaceuticals Ltd.",
        "code": "BEX"
      },
      "tradePrice": 10.44,
      "mrp": 12.00,
      "stripsPerBox": 50,
      "piecesPerStrip": 10,
      "tradePricePerBox": 522.00,
      "availableStock": 4500,
      "isPrescriptionRequired": false
    },
    {
      "id": "med-bex-napa-extra-500",
      "name": "Napa Extra",
      "genericName": "Paracetamol + Caffeine",
      "strength": "500 mg + 65 mg",
      "dosageForm": "Tablet",
      "manufacturer": {
        "id": "comp-beximco",
        "name": "Beximco Pharmaceuticals Ltd.",
        "code": "BEX"
      },
      "tradePrice": 21.75,
      "mrp": 25.00,
      "stripsPerBox": 20,
      "piecesPerStrip": 10,
      "tradePricePerBox": 435.00,
      "availableStock": 1420,
      "isPrescriptionRequired": false
    }
  ]
}
```

### 7. Database Tables, Fields, Relationships, and Constraints
```prisma
// Extension to Medicine model for search indexes
// In PostgreSQL / Prisma:
// @@index([name(ops: raw("gin_trgm_ops"))], type: Gin)
// @@index([genericName(ops: raw("gin_trgm_ops"))], type: Gin)
// @@index([strength])
// @@index([tradePrice])
```

### 8. Authentication, Authorization, and Security Requirements
- Search API is public and unauthenticated to allow fast catalog discovery.
- Rate-limiting enforced at API Gateway: Maximum 60 search requests per IP per minute to prevent competitor price scraping.
- SQL injection prevention via parameterized queries and Prisma ORM sanitization.

### 9. Input Validation, Edge Cases, and Error Handling
- **Special Characters in Search:** Characters such as `%`, `_`, `'`, `"`, `<`, `>` are sanitized and escaped before query execution.
- **Extremely Long Queries:** Queries exceeding 100 characters are safely truncated to the first 100 characters.
- **Empty Query String:** Returns default popular medicines list sorted by highest transaction frequency.

### 10. Dependencies on Other Features
- Depends on: Feature 1.4 (Company directory), Feature 1.5 (Catalog & taxonomy).
- Depended on by: Feature 1.7 (Brand showcase filtering), Feature 1.8 (Cart addition).

### 11. Detailed Acceptance Criteria
- [x] Search input returns matching brand and generic results in under 50ms.
- [x] Searching by generic molecule (e.g. "Omeprazole") returns all matching brands across multiple manufacturers (Seclo, Losectil, Proceptin).
- [x] Debounce prevents intermediate keystrokes from spamming backend queries.
- [x] Filter chips (Form, Company, In Stock) correctly restrict result subsets.
- [x] Sorting by Trade Price ascending and descending works accurately.

### 12. Positive, Negative, and Edge-Case Testing Scenarios
- **Positive Test 1.6.1:** Search "Paracetamol". Verify results include Napa (Beximco), Ace (Square), Renova (Opso Saline), Fast (Acme).
- **Positive Test 1.6.2:** Apply filter `manufacturer = Beximco` and `form = Tablet`. Verify only Beximco tablet products are returned.
- **Negative Test 1.6.3:** Search non-existent string "xyz123randomnonexistent". Verify 200 OK with empty array `[]` and user-friendly empty state.
- **Edge Case 1.6.4:** Enter Bengali query "নাপা". Verify transliteration mapping resolves to Napa brand products.
- **Edge Case 1.6.5:** Rapid typing of 10 characters within 200ms. Verify only 1 network request is dispatched.


## 9. Feature 1.7: Brands & Manufacturer Showcase

### 1. Purpose and Expected Functionality
Feature 1.7 implements the visual Brands & Manufacturer Showcase. In the Bangladeshi pharmaceutical market, chemist procurement is heavily brand- and company-driven; pharmacy owners frequently order their weekly inventory in manufacturer-specific cycles (e.g., "Monday is Beximco delivery day, Tuesday is Square"). Feature 1.7 presents an interactive Brand Carousel on the Home Screen and a full-screen "View All Brands" modal showcasing manufacturer logos, corporate verification badges, available SKU counts, and instant filter actions linking directly to the product catalog.

### 2. Complete End-to-End User Workflow
1. User lands on the MedGo Home Screen or Explore tab.
2. Below the hero banner, user sees the **"Top Pharmaceutical Brands"** section featuring a horizontally scrollable carousel of circular brand badges with high-resolution company logos (Beximco, Square, Incepta, Renata, Opsonin, Acme, ACI, Eskayef).
3. Next to the section heading, user clicks the **"View All >"** link button.
4. A clean, responsive modal slides in from the bottom/right, displaying the full alphabetized directory of 40+ pharmaceutical manufacturers with search filtering and SKU counts.
5. User taps on a brand card (e.g. "Square Pharmaceuticals").
6. The modal closes smoothly, and the screen seamlessly transitions to the Explore view pre-filtered by the selected manufacturer.
7. An active filter pill is displayed ("Manufacturer: Square Pharmaceuticals (x)"), and the product catalog updates to display only Square's portfolio.

### 3. Every User Interaction, Button, Action, and Screen Behavior
- **Brand Avatar Circle:** Hovering or tapping scales the logo with a smooth CSS scale transition; shows the company short code below the circle.
- **"View All >" Action Link:** Opens the `BrandsDirectoryModal` with focus automatically shifted to the brand search input.
- **Brand Search Input within Modal:** Instant client-side filtering of the brand list as the user types; clears on clicking "X".
- **Alphabet Jump Bar (A-Z):** Vertical quick-scroll index along the right margin allowing users to instantly jump to brands starting with 'B', 'S', etc.
- **"Select Brand" Tap Action:** Sets active brand filter, persists selection in URL query parameters (`?brand=comp-beximco`), and scrolls catalog to top.

### 4. Frontend Functional Requirements
- **Brand Carousel Component (`BrandCarousel.tsx`):** Touch-optimized carousel supporting smooth inertial swiping on mobile devices and click-arrow controls on desktop.
- **Brand Directory Modal (`BrandsModal.tsx`):** Full-screen overlay on mobile, modal dialog on desktop with virtualization to render 40+ brand cards without layout lag.
- **Active Brand Pill Component:** Dismissible badge at the top of the search results allowing one-click removal of the brand restriction.

### 5. Backend Business Logic and Processing Rules
- **Brand Aggregation Query:** Computes live counts of active, in-stock medicines for each manufacturer using indexed SQL group-by queries.
- **Sorting Logic:** Ranks brands primarily by overall order volume / market share in Bangladesh (e.g., Square, Beximco, Incepta, Renata at top), followed by alphabetical order.
- **Logo Asset Optimization:** Serves optimized SVG and WebP logo formats with fallback initials avatar if an image URL fails to load.

### 6. Required API Endpoints with Request and Response Structures

#### `GET /api/brands`
- **Query Parameters:** `q` (search query), `limit` (max records)
- **Response (200 OK):**
```json
{
  "success": true,
  "totalBrands": 42,
  "brands": [
    {
      "id": "comp-square",
      "name": "Square Pharmaceuticals PLC",
      "code": "SQUARE",
      "logoUrl": "/logos/square.png",
      "skuCount": 580,
      "inStockCount": 542,
      "isVerified": true,
      "marketShareRank": 1,
      "popularBrands": ["Seclo", "Ace", "Tylace", "Filwel"]
    },
    {
      "id": "comp-beximco",
      "name": "Beximco Pharmaceuticals Ltd.",
      "code": "BEX",
      "logoUrl": "/logos/beximco.png",
      "skuCount": 420,
      "inStockCount": 398,
      "isVerified": true,
      "marketShareRank": 2,
      "popularBrands": ["Napa", "Napa Extra", "Azith", "Tofen"]
    },
    {
      "id": "comp-incepta",
      "name": "Incepta Pharmaceuticals Ltd.",
      "code": "INCEPTA",
      "logoUrl": "/logos/incepta.png",
      "skuCount": 490,
      "inStockCount": 465,
      "isVerified": true,
      "marketShareRank": 3,
      "popularBrands": ["Osartil", "Pantobex", "Monas"]
    }
  ]
}
```

### 7. Database Tables, Fields, Relationships, and Constraints
```prisma
// Brand attributes are managed via Company entity with performance indexes:
// @@index([name])
// @@index([isActive])
```

### 8. Authentication, Authorization, and Security Requirements
- Brand directory endpoint is public, cached at edge CDN for 3600 seconds (1 hour).
- Modifying brand ranking or uploading new brand logos restricted to `ADMIN`.

### 9. Input Validation, Edge Cases, and Error Handling
- **Missing Brand Logo:** If image fails to load or `logoUrl` is null, frontend gracefully falls back to a stylized two-letter monogram avatar with company theme colors.
- **Zero SKU Brand:** Companies with 0 active medicines are omitted from the public carousel to avoid displaying dead links.

### 10. Dependencies on Other Features
- Depends on: Feature 1.4 (Company directory).
- Depended on by: Feature 1.6 (Medicine search filtering).

### 11. Detailed Acceptance Criteria
- [x] Brand carousel displays top Bangladeshi manufacturers with crisp logos and company names.
- [x] "View All >" button opens brand directory modal with search bar and alphabet jump bar.
- [x] Tapping any brand instantly filters the medicine catalog to products of that manufacturer.
- [x] Filter pill appears in catalog and can be cleared with a single tap.
- [x] Responsive layout functions smoothly on both mobile touchscreens and desktop mice.

### 12. Positive, Negative, and Edge-Case Testing Scenarios
- **Positive Test 1.7.1:** Click "Square Pharmaceuticals" in carousel. Verify URL updates to `/explore?manufacturer=Square` and only Square products display.
- **Positive Test 1.7.2:** Open Brands Modal, search "Renata". Verify list narrows to Renata PLC within 50ms.
- **Negative Test 1.7.3:** Search non-existent company "Alien Pharma". Verify "No brands found" empty state.
- **Edge Case 1.7.4:** Test carousel swipe on low-end mobile touch device. Verify 60fps hardware-accelerated CSS transform without stutter.


## 10. Feature 1.8: Company-Wise Cart Engine

### 1. Purpose and Expected Functionality
Feature 1.8 powers MedGo's multi-company shopping cart engine. In retail pharmacy procurement, a chemist adds items from several competing pharmaceutical manufacturers into a single basket. However, due to legal, distribution, and regulatory separation, orders must be organized and tracked by manufacturer. Feature 1.8 dynamically segregates items into discrete **Company Clusters**, computes company-specific subtotals, verifies company Minimum Order Values (MOV), calculates pharmaceutical promotional schemes (e.g. "Buy 10 boxes get 1 strip bonus"), persists cart state across sessions, and prepares the cart for atomic checkout.

### 2. Complete End-to-End User Workflow
1. User adds items to cart from the Home Screen or Explore catalog (e.g. 3 items from Beximco, 2 items from Square, 4 items from Incepta).
2. The bottom navigation bar's **Cart** icon dynamically updates its badge to show the total distinct items (`9`).
3. User taps the **Cart** icon in the bottom navigation.
4. The Cart Screen opens, organizing items into distinct visual sections grouped by pharmaceutical manufacturer:
   - **Section 1: Beximco Pharmaceuticals Ltd.** (3 items | Subtotal: ৳4,350.00 | Status: MOV Met)
   - **Section 2: Square Pharmaceuticals PLC** (2 items | Subtotal: ৳2,850.00 | Status: MOV Met)
   - **Section 3: Incepta Pharmaceuticals Ltd.** (4 items | Subtotal: ৳1,200.00 | Warning: ৳300 below MOV of ৳1,500)
5. User adjusts quantities using the `+` / `-` steppers or removes an item by swiping or clicking the trash icon.
6. The subtotal and bonus calculations recompute in real-time. If an item qualifies for a trade scheme (e.g., ordering 10 boxes of Napa Extra triggers "Bonus: +1 Strip Free"), a green gift badge appears automatically.
7. User reviews the Grand Total Summary: Gross Trade Value, Statutory 3% DGDA Chemist Discount, Net Payable.
8. If all company clusters meet their individual MOV requirements, the **"Proceed to Unified Checkout"** button becomes active.

### 3. Every User Interaction, Button, Action, and Screen Behavior
- **Quantity Stepper (+ / - Buttons):** Increments or decrements item quantity; triggers optimistic UI update; recalculates company subtotal immediately.
- **Unit Selector Switch (`BOX` vs `STRIP`):** Allows chemist to toggle between ordering full wholesale cartons or individual blister strips.
- **"Remove Item" Trash Can Icon:** Prompts confirmation toast ("Removed [Medicine] from cart") with an "Undo" action available for 5 seconds.
- **Company Minimum Order Value (MOV) Progress Bar:** Displays "Add ৳300 more of Incepta products to reach minimum order value of ৳1,500". Changes from amber to emerald green when met.
- **"Clear Company Items" Link:** Allows purging all items from one specific company without deleting the rest of the cart.
- **"Proceed to Unified Checkout" Primary CTA:** Fixed at the bottom of the screen; displays grand total; disabled with descriptive tooltip if any company fails MOV.

### 4. Frontend Functional Requirements
- **Cart Context (`CartContext.tsx` & `useCart.ts`):** Global state engine managing cart items, grouping by `companyId`, optimistic updates, and debounced server synchronization.
- **Local Storage Synchronization:** Cart contents are saved to `localStorage` under key `medgo_cart_items`, ensuring cart persists across page refreshes and browser restarts.
- **Promotional Scheme Engine (`calculateTradeSchemes.ts`):** Client-side calculator applying quantity bonus rules (e.g. $Q \ge 10 \rightarrow +1$ bonus).

### 5. Backend Business Logic and Processing Rules
- **Server Cart Synchronization:** When an authenticated user updates their cart, the payload syncs with `POST /api/cart/sync`, persisting cart items to the database.
- **Pricing Verification:** The server re-validates current Trade Prices against the live database to prevent client-side price tampering.
- **MOV Enforcement:** Checks that for each company cluster in the cart:
  $$\sum (\text{tradePrice} \times \text{quantity}) \ge \text{company.minimumOrderAmount}$$
- **Statutory Chemist Wholesale Discount:** Applies standard DGDA 3% chemist cash discount across all eligible items:
  $$\text{Chemist Discount} = \text{Gross Trade Price} \times 0.03$$
  $$\text{Net Payable} = \text{Gross Trade Price} - \text{Chemist Discount}$$

### 6. Required API Endpoints with Request and Response Structures

#### `GET /api/cart`
- **Headers:** `Authorization: Bearer mgtok_...`
- **Response (200 OK):**
```json
{
  "success": true,
  "pharmacyId": "pharm-01",
  "totalItemsCount": 9,
  "totalUniqueMedicines": 3,
  "companyClusters": [
    {
      "companyId": "comp-beximco",
      "companyName": "Beximco Pharmaceuticals Ltd.",
      "companyCode": "BEX",
      "minimumOrderAmount": 2000.00,
      "clusterSubtotal": 4350.00,
      "isMovMet": true,
      "items": [
        {
          "medicineId": "med-bex-napa-extra-500",
          "name": "Napa Extra",
          "strength": "500 mg + 65 mg",
          "dosageForm": "Tablet",
          "unitType": "BOX",
          "quantity": 10,
          "tradePrice": 435.00,
          "lineTotal": 4350.00,
          "bonusQuantity": 1,
          "bonusUnit": "STRIP",
          "bonusDescription": "Scheme: Buy 10 Boxes Get 1 Strip Free"
        }
      ]
    },
    {
      "companyId": "comp-square",
      "companyName": "Square Pharmaceuticals PLC",
      "companyCode": "SQUARE",
      "minimumOrderAmount": 2000.00,
      "clusterSubtotal": 2850.00,
      "isMovMet": true,
      "items": [
        {
          "medicineId": "med-squ-seclo-20",
          "name": "Seclo 20",
          "strength": "20 mg",
          "dosageForm": "Capsule",
          "unitType": "BOX",
          "quantity": 5,
          "tradePrice": 570.00,
          "lineTotal": 2850.00,
          "bonusQuantity": 0
        }
      ]
    }
  ],
  "financialSummary": {
    "grossTradeTotal": 7200.00,
    "statutoryChemistDiscount": 216.00,
    "discountPercent": 3.0,
    "netGrandTotal": 6984.00
  }
}
```

#### `POST /api/cart/sync`
- **Request Body:**
```json
{
  "pharmacyId": "pharm-01",
  "items": [
    { "medicineId": "med-bex-napa-extra-500", "quantity": 10, "unitType": "BOX" },
    { "medicineId": "med-squ-seclo-20", "quantity": 5, "unitType": "BOX" }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Cart synchronized successfully",
  "syncedAt": "2026-11-11T16:47:00Z"
}
```

### 7. Database Tables, Fields, Relationships, and Constraints
```prisma
model CartItem {
  id          String    @id @default(cuid())
  pharmacyId  String
  medicineId  String
  quantity    Int       @default(1)
  unitType    String    @default("BOX") @db.VarChar(10)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  pharmacy    Pharmacy  @relation(fields: [pharmacyId], references: [id], onDelete: Cascade)
  medicine    Medicine  @relation(fields: [medicineId], references: [id])

  @@unique([pharmacyId, medicineId, unitType])
  @@index([pharmacyId])
}
```

### 8. Authentication, Authorization, and Security Requirements
- Cart can be built locally by guest users, but checkout requires an authenticated `PHARMACY_OWNER` or `RETAIL_PHARMACY` session.
- Price validation strictly executes against server database records, ignoring client-submitted price fields.
- Item quantities bounded to reasonable physical maximums (e.g. max 500 boxes per SKU per order).

### 9. Input Validation, Edge Cases, and Error Handling
- **Negative or Zero Quantity:** Quantity must be integer $\ge 1$. Stepper prevents dropping below 1 (prompts delete instead).
- **Out-of-Stock Item in Cart:** If an item is added but depot runs out of stock before checkout, cart highlights item in red: "Out of Stock at nearest depot. Remove to proceed."
- **Below Minimum Order Value:** "Proceed to Checkout" button is disabled with an explanatory tooltip if any company cluster subtotal $< \text{MOV}$.

### 10. Dependencies on Other Features
- Depends on: Feature 1.4 (Company directory), Feature 1.5 (Catalog & packaging units).
- Depended on by: Feature 1.9 (Unified Checkout), Feature 1.10 (Order Decomposition).

### 11. Detailed Acceptance Criteria
- [x] Cart displays items accurately segregated into company-wise cards.
- [x] Company subtotals, gross total, 3% chemist discount, and net grand total compute accurately.
- [x] Quantity steppers update prices and bonus quantities immediately.
- [x] Company Minimum Order Value (MOV) progress bars clearly indicate status.
- [x] Cart state persists across page refreshes and browser restarts.

### 12. Positive, Negative, and Edge-Case Testing Scenarios
- **Positive Test 1.8.1:** Add 10 boxes Napa Extra (Beximco) and 5 boxes Seclo 20 (Square). Verify cart renders two distinct company sections with accurate subtotals and 3% discount.
- **Negative Test 1.8.2:** Add 1 box of Napa Extra (৳435.00) where Beximco MOV is ৳2,000. Verify checkout button is disabled and MOV warning displays.
- **Negative Test 1.8.3:** Manually submit negative quantity `-5` to `/api/cart/sync`. Verify 422 Unprocessable Entity error.
- **Edge Case 1.8.4:** Fast multi-click on stepper `+` button (5 clicks in 100ms). Verify debounced server sync dispatches exactly 1 combined update with quantity +5.


## 11. Feature 1.9: Multi-Company Unified Checkout

### 1. Purpose and Expected Functionality
Feature 1.9 provides a seamless, unified checkout experience for multi-company pharmaceutical purchases. While the pharmacy owner sees a single consolidated checkout screen with one grand total, the underlying checkout architecture validates each company's commercial rules independently: company credit lines, available credit balances, delivery depot coverage, statutory chemist discounts (3%), and payment terms (Cash on Delivery, Company Credit, or Mobile Financial Services bKash/Nagad).

### 2. Complete End-to-End User Workflow
1. Pharmacy Owner clicks **"Proceed to Unified Checkout"** from the Cart Screen.
2. The Checkout Screen opens, displaying three structured sections:
   - **Section 1: Delivery Destination & Depot Assignment:** Pre-populates the verified pharmacy storefront address, Thana, District, and displays the assigned regional depot for each company.
   - **Section 2: Company-Wise Order Breakdown:** Displays expandable cards for each company showing items, line totals, MOV status, and trade bonus items.
   - **Section 3: Payment Terms Selection:** Allows selecting payment terms per company or across the order (e.g. "Company Credit Line" or "Cash on Delivery").
3. For companies where "Credit Line" is selected, the system displays live credit metrics: "Credit Limit: ৳100,000 | Used: ৳14,500 | Available: ৳85,500".
4. The user verifies the Consolidated Bill Summary:
   - Gross Trade Amount: ৳7,200.00
   - Statutory 3% DGDA Chemist Discount: -৳216.00
   - Net Order Payable: ৳6,984.00
5. User checks the mandatory compliance confirmation box: "I confirm that our DGDA drug license is active and all ordered items comply with our retail dispensing authorization."
6. User clicks **"Confirm & Place All Orders"**.
7. Backend initiates the atomic decomposition transaction (Feature 1.10).
8. The checkout screen transitions to an **Order Confirmation & Challan Summary Screen**, displaying individual company order tracking numbers (e.g. `ORD-20261111-BEX-1291` and `ORD-20261111-SQU-8042`), download links for DGDA pro-forma challans, and live dispatch timers.

### 3. Every User Interaction, Button, Action, and Screen Behavior
- **"Change Delivery Address" Link:** Opens address verification sheet; warns that changing Thana may change assigned fulfillment depots and delivery ETAs.
- **Payment Method Radio Cards:** Options for "Company Credit Line" (default if balance available), "Cash on Delivery (COD)", and "bKash / Nagad / Digital MFS".
- **Company Card Accordion Toggle:** Expands or collapses itemized product lists within each company card to keep checkout clean.
- **Compliance Checkbox:** Required checkbox; submitting without checking highlights the box with a red pulse animation and message: "You must confirm regulatory compliance to place pharmaceutical orders."
- **"Confirm & Place All Orders" CTA Button:** Displays total payable amount; transitions to loading spinner state ("Reserving physical stock & creating company challans..."); disables further clicks to prevent duplicate submissions.

### 4. Frontend Functional Requirements
- **Checkout View Component (`UnifiedCheckout.tsx`):** Multi-card layout designed for fast review and mobile ergonomics with sticky bottom action bar.
- **Credit Balance Validator Hook (`useCreditCheck.ts`):** Client-side validator preventing user from selecting "Company Credit" if the company subtotal exceeds available credit.
- **Challan Summary Dialog (`OrderSuccessModal.tsx`):** Confirms decomposed orders with individual company badges and status chips (`ALLOCATED`).

### 5. Backend Business Logic and Processing Rules
- **Pre-Submission Validation Pipeline:**
  1. Validates pharmacy's DGDA drug license is active and not expired (`isOrderBlocked === false`).
  2. Re-verifies real-time physical inventory across all items.
  3. Re-calculates exact Trade Prices from database records.
  4. Validates each company cluster meets or exceeds `minimumOrderAmount`.
  5. If payment method is `CREDIT`, checks `availableCredit >= companySubtotal` for each individual manufacturer.
- **Credit Debit Staging:** Calculates company credit impact and stages debit entries into `CreditLedgerTransaction`.

### 6. Required API Endpoints with Request and Response Structures

#### `POST /api/orders/checkout/validate`
- **Headers:** `Authorization: Bearer mgtok_...`
- **Request Body:**
```json
{
  "pharmacyId": "pharm-01",
  "items": [
    { "medicineId": "med-bex-napa-extra-500", "quantity": 10, "unitType": "BOX" },
    { "medicineId": "med-squ-seclo-20", "quantity": 5, "unitType": "BOX" }
  ],
  "paymentMethod": "CREDIT"
}
```
- **Response (200 OK - Validated):**
```json
{
  "isValid": true,
  "warnings": [],
  "companies": [
    {
      "companyId": "comp-beximco",
      "companyName": "Beximco Pharmaceuticals Ltd.",
      "subtotal": 4219.50,
      "creditAvailable": 85500.00,
      "isCreditSufficient": true,
      "assignedDepot": "Tejgaon Regional Distribution Depot",
      "estimatedDelivery": "Today by 6:00 PM"
    },
    {
      "companyId": "comp-square",
      "companyName": "Square Pharmaceuticals PLC",
      "subtotal": 2764.50,
      "creditAvailable": 45000.00,
      "isCreditSufficient": true,
      "assignedDepot": "Tongi Central Distribution Depot",
      "estimatedDelivery": "Tomorrow by 11:00 AM"
    }
  ],
  "grossTotal": 7200.00,
  "chemistDiscount": 216.00,
  "netPayable": 6984.00
}
```

### 7. Database Tables, Fields, Relationships, and Constraints
```prisma
model CompanyCreditLine {
  id              String      @id @default(cuid())
  pharmacyId      String
  companyId       String
  creditLimit     Decimal     @default(50000.00) @db.Decimal(10, 2)
  usedCredit      Decimal     @default(0.00) @db.Decimal(10, 2)
  status          CreditStatus @default(ACTIVE)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  pharmacy        Pharmacy    @relation(fields: [pharmacyId], references: [id])
  company         Company     @relation(fields: [companyId], references: [id])
  transactions    CreditLedgerTransaction[]

  @@unique([pharmacyId, companyId])
  @@index([pharmacyId])
  @@index([companyId])
}

enum CreditStatus {
  ACTIVE
  WARNING
  SUSPENDED
}

model CreditLedgerTransaction {
  id              String            @id @default(cuid())
  creditLineId    String
  orderId         String?
  transactionType LedgerTransactionType
  amount          Decimal           @db.Decimal(10, 2)
  balanceAfter    Decimal           @db.Decimal(10, 2)
  notes           String?           @db.VarChar(255)
  timestamp       DateTime          @default(now())

  creditLine      CompanyCreditLine @relation(fields: [creditLineId], references: [id])

  @@index([creditLineId])
  @@index([orderId])
}

enum LedgerTransactionType {
  ORDER_DEBIT
  PAYMENT_CREDIT
  ADJUSTMENT
}
```

### 8. Authentication, Authorization, and Security Requirements
- Checkout execution strictly requires authenticated `PHARMACY_OWNER` or `RETAIL_PHARMACY` session.
- Only `PHARMACY_OWNER` can authorize orders exceeding ৳50,000 or orders drawn against credit lines.
- Idempotency key (`x-idempotency-key`) required on submission header to prevent duplicate order generation from double-taps.

### 9. Input Validation, Edge Cases, and Error Handling
- **Credit Limit Exceeded:** If order total for Company A exceeds available credit, return 422: "Order exceeds available Beximco credit limit by ৳1,450. Please switch to Cash on Delivery or reduce quantity."
- **Expired Pharmacy License:** If pharmacy license expired, abort checkout: "Checkout blocked. Your DGDA Drug License expired on [Date]. Please update compliance in profile."
- **Network Timeout during Submit:** Frontend keeps submission spinner active and queries order status via idempotency key before prompting retry.

### 10. Dependencies on Other Features
- Depends on: Feature 1.3 (Pharmacy Profile), Feature 1.4 (Depot directory), Feature 1.8 (Cart).
- Depended on by: Feature 1.10 (Atomic Order Decomposition).

### 11. Detailed Acceptance Criteria
- [x] Unified checkout presents clear breakdown of company-wise subtotals and discounts.
- [x] Delivery address pre-populates and maps to correct regional depots.
- [x] Company credit limits accurately validated per manufacturer.
- [x] Mandatory DGDA compliance acknowledgment enforced prior to submission.
- [x] Idempotency keys prevent double submissions.

### 12. Positive, Negative, and Edge-Case Testing Scenarios
- **Positive Test 1.9.1:** Complete checkout with valid cart and available credit. Verify successful validation response and transition to confirmation.
- **Negative Test 1.9.2:** Attempt checkout with expired pharmacy license. Verify validation fails with DGDA compliance block.
- **Negative Test 1.9.3:** Select Credit payment when available credit is ৳500 and order is ৳2,000. Verify validation error prompts alternative payment.
- **Edge Case 1.9.4:** Double-tap "Confirm Order" button rapidly within 50ms. Verify idempotency header ensures only one execution occurs.


## 12. Feature 1.10: Atomic Order Decomposition & FEFO Stock Reservation Engine

### 1. Purpose and Expected Functionality
Feature 1.10 is the core transactional backbone of the MedGo platform. It takes a single unified customer cart containing medicines from multiple pharmaceutical manufacturers and atomically decomposes it into $N$ distinct legal purchase orders (one per manufacturer). It guarantees transactional atomicity (all-or-nothing decomposition with automated compensating rollbacks), implements physical First-Expiry, First-Out (FEFO) batch allocation, manages 3-minute optimistic stock reservation locks (`StockLockEngine`), deducts company credit balances, generates official DGDA Challan numbers, and dispatches asynchronous notifications to assigned Medical Promotion Officers (MPO) and depot dispatch managers.

### 2. Complete End-to-End User Workflow
1. Pharmacy Owner triggers checkout submission (Feature 1.9) with cart containing items across multiple companies (e.g. Beximco and Square).
2. The request hits `POST /api/orders/checkout`.
3. **Step 1: Idempotency Lock:** The engine checks Redis / database for `idempotencyKey`. If a duplicate request is currently executing, it blocks and waits; if already completed, it returns the cached result.
4. **Step 2: Optimistic Stock Reservation:** The engine initiates a 180-second reservation lock across all requested SKUs via `StockLockEngine`.
5. **Step 3: FEFO Batch Allocation:** For each SKU, the engine queries available physical batches at the assigned depot, sorting by `expiryDate ASC`. Batches expiring soonest are allocated first, splitting quantities across batches if a single batch has insufficient units.
6. **Step 4: Credit Verification & Ledger Debit:** The engine checks company credit lines. If sufficient, it debits the company ledger and updates `usedCredit`.
7. **Step 5: Order Creation & Challan Issuance:** Generates individual company order records with formatted DGDA Challan numbers (e.g. `ORD-20261111-BEX-1291` and `ORD-20261111-SQU-8042`), associating batch allocation details with each line item.
8. **Step 6: Cart Invalidation:** Empties the purchased items from the pharmacy's persistent cart.
9. **Step 7: Notification Dispatch:** Queues asynchronous background tasks:
   - Dispatches SMS & in-app push notification to the assigned Beximco MPO for that Thana.
   - Dispatches dispatch queue item to Beximco Tejgaon Depot.
   - Dispatches SMS & in-app push notification to Square MPO and Tongi Depot.
   - Dispatches confirmation SMS to the pharmacy owner with tracking links.
10. System responds with 200 OK containing the consolidated summary and array of created company orders.
11. If ANY step fails during decomposition (e.g., unexpected stock depletion for one item or credit limit failure), the transaction coordinator triggers an automated **compensating rollback**: releasing all stock locks, reverting credit ledger adjustments, and returning an explicit failure report.

### 3. Every User Interaction, Button, Action, and Screen Behavior
- **Submission Progress Dialog:** Shows step-by-step progress checklist during decomposition:
  - 1. Verifying real-time stock across depots... [✓]
  - 2. Allocating earliest-expiry physical batches (FEFO)... [✓]
  - 3. Securing company credit authorizations... [✓]
  - 4. Generating official DGDA delivery challans... [✓]
- **Order Success Screen:** Displays cards for each created company order with DGDA Challan ID, assigned depot, and delivery ETA.
- **"Download Challan PDF" Button:** Downloads formatted official DGDA Delivery Challan with batch numbers, expiry dates, Trade Price, and VAT breakdown.
- **"Track Live Dispatch" Button:** Opens Order Tracking view showing real-time delivery van status.

### 4. Frontend Functional Requirements
- **Atomic Checkout Handler (`useOrderDecomposition.ts`):** Client-side hook managing submission state, idempotency header generation (`uuidv4()`), and error recovery.
- **Decomposed Order Result Card Component:** Clean UI card showing company logo, unique Challan number, allocated batches, and total amount.
- **Automatic Cart Reset:** Clears local storage and synchronizes empty cart state upon receipt of 200 OK.

### 5. Backend Business Logic and Processing Rules
- **Atomic Two-Phase Protocol:**
  - *Phase 1 (Preparation):* Stock lock acquisition and credit pre-authorization.
  - *Phase 2 (Commit):* Order insertion, batch deduction, ledger commit.
  - *Rollback on Error:* If any company fails preparation, all acquired locks are released via `StockLockEngine.releaseLocks()` and any ledger entries are reversed.
- **FEFO Batch Allocation Algorithm:**
  ```typescript
  // Given requiredQuantity Q for medicine M at depot D:
  const batches = db.getBatches(M, D).sort((a, b) => a.expiryDate - b.expiryDate);
  let remaining = Q;
  const allocations = [];
  for (const batch of batches) {
    if (batch.availableStock <= 0) continue;
    const take = Math.min(remaining, batch.availableStock);
    allocations.push({ batchId: batch.id, batchNumber: batch.batchNumber, expiryDate: batch.expiryDate, quantity: take });
    remaining -= take;
    if (remaining === 0) break;
  }
  if (remaining > 0) throw new InsufficientStockError(M, remaining);
  ```
- **Challan ID Generation Format:**
  `ORD-{YYYYMMDD}-{COMPANY_CODE}-{4_DIGIT_RANDOM}` (e.g. `ORD-20261111-BEX-1291`).

### 6. Required API Endpoints with Request and Response Structures

#### `POST /api/orders/checkout`
- **Headers:**
  - `Authorization: Bearer mgtok_...`
  - `x-idempotency-key: 7b29a1e4-41d3-49d8-912a-48d1e892c901`
- **Request Body:**
```json
{
  "pharmacyId": "pharm-01",
  "paymentMethod": "CREDIT",
  "deliveryAddress": "House 14, Road 7, Dhanmondi, Dhaka",
  "items": [
    {
      "medicineId": "med-bex-napa-extra-500",
      "quantity": 10,
      "unitType": "BOX",
      "tradePrice": 435.00
    },
    {
      "medicineId": "med-squ-seclo-20",
      "quantity": 5,
      "unitType": "BOX",
      "tradePrice": 570.00
    }
  ]
}
```
- **Response (200 OK - Orders Created & Decomposed):**
```json
{
  "success": true,
  "message": "Cart decomposed and 2 company orders created successfully.",
  "decomposedOrdersCount": 2,
  "summary": {
    "grossTotal": 7200.00,
    "statutoryChemistDiscount": 216.00,
    "netGrandTotal": 6984.00,
    "pharmacyId": "pharm-01"
  },
  "orders": [
    {
      "orderId": "ORD-20261111-BEX-1291",
      "companyId": "comp-beximco",
      "companyName": "Beximco Pharmaceuticals Ltd.",
      "companyCode": "BEX",
      "depotName": "Tejgaon Regional Distribution Depot",
      "status": "ALLOCATED",
      "subtotal": 4350.00,
      "chemistDiscount": 130.50,
      "netAmount": 4219.50,
      "paymentMethod": "CREDIT",
      "challanNumber": "CH-BEX-20261111-1291",
      "items": [
        {
          "medicineId": "med-bex-napa-extra-500",
          "name": "Napa Extra",
          "quantity": 10,
          "unitType": "BOX",
          "tradePrice": 435.00,
          "allocatedBatches": [
            {
              "batchNumber": "BX-NP-2601",
              "expiryDate": "2027-06-30",
              "quantity": 10
            }
          ]
        }
      ],
      "assignedMPO": {
        "name": "Tanvir Hasan",
        "phone": "01819001122"
      }
    },
    {
      "orderId": "ORD-20261111-SQU-8042",
      "companyId": "comp-square",
      "companyName": "Square Pharmaceuticals PLC",
      "companyCode": "SQUARE",
      "depotName": "Tongi Central Distribution Depot",
      "status": "ALLOCATED",
      "subtotal": 2850.00,
      "chemistDiscount": 85.50,
      "netAmount": 2764.50,
      "paymentMethod": "CREDIT",
      "challanNumber": "CH-SQU-20261111-8042",
      "items": [
        {
          "medicineId": "med-squ-seclo-20",
          "name": "Seclo 20",
          "quantity": 5,
          "unitType": "BOX",
          "tradePrice": 570.00,
          "allocatedBatches": [
            {
              "batchNumber": "SQ-SC-2511",
              "expiryDate": "2027-04-30",
              "quantity": 5
            }
          ]
        }
      ],
      "assignedMPO": {
        "name": "Kazi Ahsan",
        "phone": "01712998877"
      }
    }
  ]
}
```

### 7. Database Tables, Fields, Relationships, and Constraints
```prisma
model Order {
  id               String               @id @default(cuid())
  orderNumber      String               @unique @db.VarChar(50)
  challanNumber    String               @unique @db.VarChar(50)
  pharmacyId       String
  companyId        String
  depotId          String
  status           OrderStatus          @default(PENDING)
  subtotal         Decimal              @db.Decimal(10, 2)
  discountAmount   Decimal              @db.Decimal(10, 2)
  netAmount        Decimal              @db.Decimal(10, 2)
  paymentMethod    PaymentMethod        @default(CASH_ON_DELIVERY)
  paymentStatus    PaymentStatus        @default(PENDING)
  deliveryAddress  String               @db.VarChar(255)
  mpoUserId        String?
  createdAt        DateTime             @default(now())
  updatedAt        DateTime             @updatedAt

  pharmacy         Pharmacy             @relation(fields: [pharmacyId], references: [id])
  company          Company              @relation(fields: [companyId], references: [id])
  depot            Depot                @relation(fields: [depotId], references: [id])
  items            OrderItem[]
  statusHistory    OrderStatusHistory[]

  @@index([pharmacyId])
  @@index([companyId])
  @@index([depotId])
  @@index([status])
}

enum OrderStatus {
  PENDING
  ALLOCATED
  PICKING
  DISPATCHED
  DELIVERED
  CANCELLED
}

enum PaymentMethod {
  CASH_ON_DELIVERY
  CREDIT
  BKASH
  NAGAD
  BANK_TRANSFER
}

enum PaymentStatus {
  PENDING
  PAID
  OVERDUE
}

model OrderItem {
  id              String               @id @default(cuid())
  orderId         String
  medicineId      String
  quantity        Int
  unitType        String               @db.VarChar(10)
  tradePrice      Decimal              @db.Decimal(10, 2)
  lineTotal       Decimal              @db.Decimal(10, 2)

  order           Order                @relation(fields: [orderId], references: [id], onDelete: Cascade)
  medicine        Medicine             @relation(fields: [medicineId], references: [id])
  allocations     OrderItemAllocation[]

  @@index([orderId])
  @@index([medicineId])
}

model OrderItemAllocation {
  id              String         @id @default(cuid())
  orderItemId     String
  batchId         String
  allocatedQty    Int

  orderItem       OrderItem      @relation(fields: [orderItemId], references: [id], onDelete: Cascade)
  batch           MedicineBatch  @relation(fields: [batchId], references: [id])

  @@index([orderItemId])
  @@index([batchId])
}
```

### 8. Authentication, Authorization, and Security Requirements
- Execution strictly requires authenticated `PHARMACY_OWNER` or `RETAIL_PHARMACY` session token.
- Orders debiting company credit lines are validated against cryptographic tenant boundaries.
- Database transactions must execute within an isolated ACID transaction (`prisma.$transaction`) with `READ COMMITTED` or `SERIALIZABLE` isolation.

### 9. Input Validation, Edge Cases, and Error Handling
- **Partial Stock Depletion during Checkout:** If Company A has stock but Company B has an unexpected physical shortage, the engine rolls back all operations, releases locks, and returns: "Square Pharmaceuticals Seclo 20 has only 2 boxes available (requested 5). Cart updated with available quantity."
- **Concurrent Order Collisions:** Handled by optimistic lock timestamping with automatic retry (up to 3 times) before throwing concurrency error.
- **Depot Offline / Closed:** Order still decomposes and saves with status `PENDING`, queued for the depot's next operational dispatch cycle.

### 10. Dependencies on Other Features
- Depends on: Feature 1.1 (Auth), Feature 1.3 (Pharmacy compliance), Feature 1.4 (Depot directory), Feature 1.5 (Catalog & batches), Feature 1.8 (Cart), Feature 1.9 (Checkout validation).
- Depended on by: Phase 2 (Order tracking, fleet GPS dispatch, invoice generation, MPO management).

### 11. Detailed Acceptance Criteria
- [x] Multi-company cart splits atomically into separate company orders with individual Challan IDs.
- [x] Physical stock deducted from batches using First Expiry, First Out (FEFO) order.
- [x] Quantities split across multiple batches if necessary.
- [x] Company credit lines debited and ledger transactions recorded.
- [x] Failure in any company order rolls back the entire checkout transaction.
- [x] MPOs and Depots receive company-specific notifications without cross-tenant data leakage.

### 12. Positive, Negative, and Edge-Case Testing Scenarios
- **Positive Test 1.10.1:** Checkout with Napa Extra (Beximco) and Seclo 20 (Square). Verify 2 orders created (`ORD-...-BEX` and `ORD-...-SQU`), earliest expiry batches allocated, and 3% discount deducted.
- **Negative Test 1.10.2:** Order quantity 50 boxes when depot only has 10 boxes in stock. Verify atomic rollback, 400 Bad Request, and 0 stock locked.
- **Negative Test 1.10.3:** Submit duplicate checkout request with identical `x-idempotency-key`. Verify second request returns cached response without duplicating orders or batch deductions.
- **Edge Case 1.10.4:** Order 10 boxes where Batch A has 6 boxes (expiring March 2027) and Batch B has 20 boxes (expiring December 2027). Verify FEFO allocates 6 from Batch A and 4 from Batch B.


## 13. Feature 1.11: Dashboard — Business Analytics & Real-Time Intelligence

### 1. Purpose and Expected Functionality
Feature 1.11 provides the core command-and-control intelligence hub for MedGo. It equips retail pharmacy owners, managing partners, and authorized operations managers with an executive-level, real-time analytics engine tracking B2B wholesale procurement, outstanding credit exposure, multi-company order velocity, and physical batch inventory health.

The Dashboard module serves six interconnected business functions:
1. **Financial Overview:** Aggregates real-time monthly and year-to-date (YTD) wholesale purchases, computes overall pharmacy credit utilization across all 45 licensed manufacturers, tracks outstanding credit balances against credit limits, and calculates pending supplier invoices.
2. **Purchase Analytics:** Analyzes procurement patterns across pharmaceutical manufacturers (e.g. Beximco, Square, Incepta, Renata), identifies top-ordered medicine SKUs by physical units and capital expenditure, and provides month-over-month (MoM) purchase comparisons.
3. **Sales & Margin Analytics:** Defines the analytical framework for counter dispensing revenue, daily/weekly/monthly sales, and gross Chemist margins. **Strict Rule:** Until the MedGo Retail Point-of-Sale (POS) dispensing module is actively populated, the backend explicitly returns `salesDataAvailable: false` with explanatory metadata, preventing the false display of `৳0` or misleading financial health indicators.
4. **Charts & Visualizations:** Renders responsive, interactive SVG/Canvas charts including Monthly Purchase Bar Charts, Company-Wise Procurement Share Bars, Top Purchased Medicines Rankings, and Multi-Month Expense Trends.
5. **Inventory Insights & Expiry Risk:** Continuously evaluates physical stock batches against reorder thresholds, identifying low-stock SKUs, stockouts, batches expiring within 90 days, and expired batches requiring regulatory DGDA return, while calculating intelligent run-rate reorder quantities.
6. **Order Lifecycle Distribution:** Summarizes B2B orders across the complete fulfillment pipeline (`SUBMITTED`, `ALLOCATED`, `PACKED`, `DISPATCHED`, `DELIVERED`, `CANCELLED`) with instant drill-down and active delivery fleet dispatch tracking.

---

### 2. Complete End-to-End User Workflow
```
[User on Home Screen]
       │
       ▼ Taps 'Dashboard' Shortcut / Metric Card
[Role & Permission Verification]
       │
       ├─► Role = 'RETAIL_PHARMACY' (Staff)
       │       │
       │       ▼ Masks financial figures (Credit, Purchases, Balances) with '••••••'
       │
       └─► Role = 'PHARMACY_OWNER' / 'ADMIN'
               │
               ▼ Unrestricted access to all Financial & Procurement KPIs
[Fetch Analytics: GET /api/dashboard/analytics?period=this_month&companyId=all]
       │
       ▼ Server aggregates actual Orders, Credits, Batches, and Ledgers
[Render Dashboard UI with Skeleton Transition]
       │
       ├─► 1. Financial Overview (Purchase, Balance, Available Credit, Invoices)
       ├─► 2. Filter Bar (Today | 7D | This Month | Last Month | This Year | Custom | Company)
       ├─► 3. Purchase Analytics (Monthly Spend, Company Share, Top SKUs, MoM Delta)
       ├─► 4. Sales & Margin Analytics (POS Integration Indicator / Metrics)
       ├─► 5. Visual Charts (Purchase Bar, Company Distribution, Top SKUs)
       ├─► 6. Inventory Insights (Total SKUs, Low Stock, Near Expiry Alerts)
       └─► 7. Order Status Pipeline (Submitted -> Allocated -> Packed -> Dispatched -> Delivered)
       │
       ▼ User selects Filter: 'Last 7 Days' or 'Square Pharmaceuticals'
[Instant Client Recalibration via API (<100ms)]
       │
       ▼ UI re-animates charts and KPIs to match selected filter slice
```

1. **Accessing the Dashboard:**
   - From the MedGo Home Screen, the user clicks the **Dashboard** shortcut in the Quick Actions grid or taps the Dashboard widget in the header.
2. **Permission & Context Evaluation:**
   - The system inspects the authenticated session token (`medgo_session`).
   - If the user has `VIEW_FINANCES` permission (`PHARMACY_OWNER`, `ADMIN`), full monetary values are shown.
   - If the user is `RETAIL_PHARMACY` counter staff, all monetary cards show a masked privacy shield (`••••••`) and a lock badge indicating that financial figures require Owner credentials.
3. **Hydration & Loading State:**
   - The screen renders an animated pulse skeleton matching the grid layout.
   - The client dispatches a request to `GET /api/dashboard/analytics` with the default filter `period=this_month` and `companyId=all`.
4. **Data Presentation & Interactive Navigation:**
   - **Financial Overview:** Highlights total purchases this month, available credit limit, outstanding balances, and pending invoices.
   - **Filter Adjustment:** The user taps a filter pill (e.g., `Last 7 Days`, `Last Month`, `This Year`, or `Custom Date Range`). The dashboard asynchronously refetches data and updates all cards and charts with zero full-page reload.
   - **Company-Specific Drill-Down:** The user selects a specific manufacturer (e.g. *Beximco Pharmaceuticals Ltd.*). The entire dashboard dynamically scopes its KPIs, showing only Beximco purchases, Beximco credit limits, Beximco orders, and Beximco inventory batches.
   - **Inventory Alerts & Replenishment:** The user taps the **Low Stock** or **Near Expiry** alert pill. An interactive slide-over drawer lists the affected medicines with batch numbers, remaining days to expiry, and one-tap **"Reorder Now"** actions that auto-populate the Multi-Company Cart.
   - **Order Tracking Link:** The user clicks the **Dispatched Orders** count, immediately navigating to the live fleet tracking map or the order status view.

---

### 3. User Interactions, UI Elements & Screen Behaviors

#### 3.1 Financial Overview KPI Cards
- **Total Purchase (Selected Period & YTD):**
  - Displays primary currency formatted sum (e.g., `৳148,500.00`) for the selected period and secondary caption `৳1,420,800.00 This Year`.
  - Shows dynamic trend pill: `▲ +12.4% vs last period` (green) or `▼ -4.2%` (red) computed dynamically from the prior equivalent time period.
- **Total Sales (Selected Period & YTD):**
  - When POS records exist: Displays gross dispensed sales and percentage growth.
  - When POS module is not yet linked: Displays a subtle amber badge `POS Module Unlinked` with tooltip `"Retail counter sales data will activate automatically once dispensing receipts are recorded via the POS terminal."`.
- **Outstanding Balance:**
  - Displays total current payables owed across wholesale credit lines (e.g., `৳34,500.00`).
  - Progress bar showing utilization relative to total credit facility:
    - `< 50%`: Emerald green indicator (`Safe Credit Buffer`).
    - `50% - 80%`: Amber indicator (`Moderate Utilization`).
    - `> 80%`: Crimson red indicator (`High Credit Risk — Approaching Limit`).
- **Available Credit Limit:**
  - Displays remaining liquid purchasing power: `৳85,500.00 Available of ৳120,000.00 Limit`.
- **Total Payments & Pending Invoices:**
  - Shows total settled payments within the period alongside count and monetary value of unsettled invoices (e.g., `3 Invoices Pending • ৳18,200.00 Due`).

#### 3.2 Filter Bar & Date-Range Controls
- **Preset Period Tabs:** Horizontal scrollable pills:
  - `[Today]` | `[Last 7 Days]` | `[This Month]` (Default active) | `[Last Month]` | `[This Year]` | `[Custom Range 📅]`
- **Custom Date Range Picker Modal:**
  - Activated when `Custom Range` is clicked.
  - Dual date picker for `Start Date` and `End Date`.
  - Enforces `startDate <= endDate` and restricts queries to a maximum lookback window of 365 days.
  - Quick action buttons: `Apply Filter` and `Reset to Default`.
- **Company Dropdown Filter:**
  - Native styled select input listing:
    - `All Pharmaceutical Companies (45)`
    - Alphabetical list of manufacturers with active orders or credit facilities.

#### 3.3 Purchase Analytics Section
- **Monthly Purchase Bar Chart:**
  - Displays a 6-month trailing bar chart with month labels (`Jun`, `Jul`, `Aug`, `Sep`, `Oct`, `Nov`).
  - Hover / tap tooltip shows exact spend and order count for that calendar month.
- **Company-Wise Purchase Share:**
  - Visual breakdown displaying supplier distribution (e.g., *Square: 41.2%*, *Beximco: 32.5%*, *Incepta: 16.8%*, *Renata: 9.5%*).
  - Accompanied by interactive legend where tapping a company filters the entire dashboard.
- **Top 5 Most Purchased Medicines:**
  - Table / card list showing:
    1. Medicine Brand Name & Strength (e.g., `Napa Extra 500mg+65mg`)
    2. Generic Molecule & Manufacturer (`Paracetamol + Caffeine • Beximco`)
    3. Total Boxes Ordered (`120 Boxes`)
    4. Total Procurement Value (`৳58,800.00`)
- **MoM Purchase Comparison Card:**
  - Direct comparative card displaying:
    - `Current Month: ৳148,500.00`
    - `Previous Month: ৳132,100.00`
    - `Net Variance: +৳16,400.00 (+12.4% MoM)`

#### 3.4 Sales & Margin Analytics Section
- **Sales Volume Breakdown:** Daily, weekly, and monthly totals calculated from dispensing tickets.
- **Top Selling Medicines:** Ranked by unit sales and gross margin percentage.
- **Chemist Margin Analysis:** Average profit margin computed across retail sales:
  $$\text{Margin } \% = \frac{\text{Retail MRP} - \text{Wholesale Trade Price}}{\text{Retail MRP}} \times 100$$
- **Unavailable Data Shield:** If POS transactions have not been recorded, the UI replaces the empty charts with an educational, non-obtrusive state explaining how POS dispensing connects to wholesale replenishment.

#### 3.5 Inventory Health & Insights
- **Metric Badges:**
  - **Total Items in Catalog:** Count of unique SKUs managed (e.g. `1,240 SKUs`).
  - **Low Stock (< 10 boxes):** Count highlighted in amber.
  - **Out of Stock (0 boxes):** Count highlighted in red with an urgent badge.
  - **Near Expiry (< 90 days):** Count highlighted in orange, showing batches requiring fast dispensing or supplier exchange.
  - **Expired Batches:** Count in deep red with DGDA return compliance prompt.
- **Interactive Reorder Suggestions Drawer:**
  - Opens on click of Low Stock or Out of Stock cards.
  - Displays SKU, Current Stock, Average Weekly Consumption, and Suggested Order Qty (in full manufacturer boxes).
  - Button: **"Add Suggested to Cart"** which leverages `ST-1.8` company clustering.

#### 3.6 Order Fulfillment Overview
- **Pipeline Status Counters:**
  - `SUBMITTED` (Pending confirmation)
  - `ALLOCATED` (Stock reserved at Depot)
  - `PACKED` (Ready for van dispatch)
  - `DISPATCHED` (En route with live delivery vehicle)
  - `DELIVERED` (Received and verified at pharmacy)
  - `CANCELLED` (Rejected or stock unavailable)
- **Active Dispatch Snapshot:**
  - Shows the most recently dispatched delivery van with vehicle license plate, assigned driver phone, and a **"Track Van"** button navigating to the live Leaflet map.

---

### 4. Frontend Functional Requirements
- **Framework & Libraries:** Built using Next.js 14 App Router React Server/Client Components, Tailwind CSS, Lucide React icons, and lightweight SVG charting primitives (zero heavy external D3 dependencies for maximum mobile performance).
- **Responsive Layout:**
  - Mobile viewport (`360px - 480px`): Single column vertical stack, horizontal swipeable cards for KPI metrics, collapsable chart sections.
  - Tablet/Desktop (`768px+`): Multi-column grid layout (2-column KPIs, side-by-side charts).
- **State Management:**
  - Local URL query synchronization: Changing filters updates URL search parameters (`?period=last_month&companyId=comp-bex`), allowing shareable, bookmarkable dashboard views.
  - SWR / React Query caching with 60-second stale time, background refetch on tab focus, and optimistic UI transitions.
- **Theme & Branding Consistency:**
  - Strictly follows the MedGo color palette: `#139485` (Primary Teal), `#0F766E` (Dark Teal), `#F0FDFA` (Light Teal Background), `#1E293B` (Slate Text), `#E2E8F0` (Borders).
  - Font family: Google Font `Open Sans`, `sans-serif`.
- **Masking & Role-Based UI Rendering:**
  - Conditionally renders sensitive financial data based on user claims returned by `useAuth()`. If `user.role === 'RETAIL_PHARMACY'`, all monetary spans display `••••••` with an `Insufficient Permission` badge.

---

### 5. Backend Business Logic & Processing Rules

#### 5.1 Deterministic Period & Date-Range Engine
The backend resolves all period filter strings against Bangladesh Standard Time (`BST = UTC+6:00`):
- `today`: From `00:00:00.000` to `23:59:59.999` BST of current day.
- `7d`: From `00:00:00.000` BST of (Today - 6 days) to `23:59:59.999` BST of Today.
- `this_month`: From 1st day `00:00:00.000` BST of current calendar month to current moment.
- `last_month`: From 1st day `00:00:00.000` BST to last day `23:59:59.999` BST of previous calendar month.
- `this_year`: From January 1st `00:00:00.000` BST of current calendar year to current moment.
- `custom`: Parses explicit `startDate` and `endDate` query parameters, ensuring `startDate <= endDate` and `(endDate - startDate) <= 365 days`.

#### 5.2 Real-Time Order & Purchase Spend Aggregation
1. Query non-cancelled orders (`status != 'CANCELLED'`) matching:
   - `pharmacyId == session.pharmacyId` (Tenant isolation)
   - `createdAt >= period.startDate AND createdAt <= period.endDate`
   - If `companyId != 'all'`, match `companyId == query.companyId`.
2. Compute `totalPurchasePeriod`:
   $$\text{totalPurchasePeriod} = \sum_{o \in \text{Orders}} o.\text{totalAmount}$$
3. Compute `totalPurchaseYear`:
   $$\text{totalPurchaseYear} = \sum_{o \in \text{Orders}_{\text{YTD}}} o.\text{totalAmount}$$
4. Compute Comparative Period Spend (`previousPeriod`):
   - Equivalent prior duration (e.g. if `period=this_month` with 11 elapsed days, compares to the first 11 days of `last_month`).
   - Growth percentage formula:
     $$\Delta\% = \begin{cases} 
     \frac{\text{Current} - \text{Previous}}{\text{Previous}} \times 100 & \text{if } \text{Previous} > 0 \\
     +100\% & \text{if } \text{Previous} = 0 \text{ and } \text{Current} > 0 \\
     0\% & \text{if } \text{Previous} = 0 \text{ and } \text{Current} = 0
     \end{cases}$$

#### 5.3 Company-Wise & SKU Aggregation
1. **Company Breakdown:**
   - Group orders by `companyId`, summing `totalAmount` per company.
   - Attach canonical manufacturer name from `companies` directory.
   - Compute percentage share:
     $$\text{Share } \% = \frac{\text{Company Spend}}{\text{totalPurchasePeriod}} \times 100$$
2. **Top Purchased Medicines:**
   - Flatten `Order.items` for orders in period.
   - Group by `medicineId`, summing `quantity` (boxes) and `subtotal` (cost).
   - Sort descending by `subtotal` (or `quantity`), taking Top 5 or Top 10 records.

#### 5.4 Credit & Outstanding Balance Calculation
1. Fetch `PharmacyCredit` records for `session.pharmacyId`.
2. Compute total facility limit:
   $$\text{Available Credit} = \sum (\text{creditLimit} - \text{usedCredit})$$
   $$\text{Outstanding Balance} = \sum \text{usedCredit}$$
3. Filter by `companyId` if specific company filter is selected.

#### 5.5 Inventory Health & FEFO Alerts
1. Query all active physical inventory batches for `session.pharmacyId` (or global catalog stock in demo context).
2. Categorize:
   - **Low Stock:** Total available quantity across all batches $\le 10$ boxes (or $\le \text{reorderLevel}$).
   - **Out of Stock:** Total quantity $== 0$.
   - **Near Expiry:** Batches where $\text{NOW}() < \text{expiryDate} \le \text{NOW}() + 90 \text{ days}$.
   - **Expired:** Batches where $\text{expiryDate} < \text{NOW}()$.
3. Compute intelligent Reorder Suggestions:
   - For items where stock $\le$ reorder threshold, calculate suggested order:
     $$\text{Suggested Boxes} = \max(20, \text{Monthly Run Rate} \times 1.5 - \text{Current Stock})$$

#### 5.6 Data Distinction Rules (Zero vs Unavailable)
- **Financial Rule:** If zero orders exist in period, `totalPurchasePeriod = 0.00` and `purchaseGrowthPercent = 0.0%`.
- **Sales Data Rule:** Because consumer dispensing POS is scheduled for Phase 3/4, the API returns:
  ```json
  "salesAnalytics": {
    "isAvailable": false,
    "reason": "POS_MODULE_UNLINKED",
    "totalSalesPeriod": null,
    "totalSalesYear": null,
    "topSellingMedicines": []
  }
  ```
  This guarantees that missing POS data is strictly separated from actual business insolvency.

---

### 6. Required API Endpoints with Request/Response Contracts

#### 6.1 `GET /api/dashboard/analytics`
- **Authentication:** Mandatory (`medgo_session` cookie).
- **Permissions:** `VIEW_DASHBOARD`. If user lacks `VIEW_FINANCES`, all monetary amounts are set to `null` or masked.
- **Query Parameters:**
  | Parameter | Type | Required | Default | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `period` | String | No | `this_month` | `today`, `7d`, `this_month`, `last_month`, `this_year`, `custom` |
  | `startDate`| String | If custom | - | ISO 8601 date string (e.g. `2026-11-01T00:00:00Z`) |
  | `endDate` | String | If custom | - | ISO 8601 date string (e.g. `2026-11-11T23:59:59Z`) |
  | `companyId`| String | No | `all` | Specific company identifier or `all` |

- **Success Response (200 OK — Pharmacy Owner):**
```json
{
  "success": true,
  "data": {
    "filter": {
      "period": "this_month",
      "startDate": "2026-11-01T00:00:00.000Z",
      "endDate": "2026-11-11T23:59:59.999Z",
      "companyId": "all",
      "companyName": "All Companies"
    },
    "financialOverview": {
      "totalPurchasePeriod": 148500.00,
      "totalPurchaseYear": 1420800.00,
      "purchaseGrowthPercent": 12.4,
      "totalOutstandingBalance": 34500.00,
      "availableCreditLimit": 85500.00,
      "totalCreditFacility": 120000.00,
      "creditUtilizationPercent": 28.75,
      "totalPaymentsPeriod": 114000.00,
      "pendingPaymentsAmount": 34500.00,
      "pendingInvoicesCount": 3
    },
    "salesAnalytics": {
      "isAvailable": false,
      "reason": "POS_MODULE_UNLINKED",
      "message": "Retail counter sales data will activate automatically once dispensing receipts are recorded via the POS terminal.",
      "totalSalesPeriod": null,
      "totalSalesYear": null,
      "salesGrowthPercent": null,
      "topSellingMedicines": []
    },
    "purchaseAnalytics": {
      "monthlyPurchases": [
        { "month": "Jun", "year": 2026, "amount": 112000.00, "orderCount": 8 },
        { "month": "Jul", "year": 2026, "amount": 125400.00, "orderCount": 10 },
        { "month": "Aug", "year": 2026, "amount": 118200.00, "orderCount": 9 },
        { "month": "Sep", "year": 2026, "amount": 139000.00, "orderCount": 11 },
        { "month": "Oct", "year": 2026, "amount": 132100.00, "orderCount": 10 },
        { "month": "Nov", "year": 2026, "amount": 148500.00, "orderCount": 12 }
      ],
      "companyPurchases": [
        { "companyId": "comp-squ", "companyName": "Square Pharmaceuticals PLC", "amount": 61200.00, "percentage": 41.2 },
        { "companyId": "comp-bex", "companyName": "Beximco Pharmaceuticals Ltd.", "amount": 48250.00, "percentage": 32.5 },
        { "companyId": "comp-inc", "companyName": "Incepta Pharmaceuticals Ltd.", "amount": 25050.00, "percentage": 16.9 },
        { "companyId": "comp-ren", "companyName": "Renata Limited", "amount": 14000.00, "percentage": 9.4 }
      ],
      "topPurchasedMedicines": [
        { "medicineId": "med-01", "name": "Napa Extra 500mg+65mg", "genericName": "Paracetamol + Caffeine", "companyName": "Beximco", "boxes": 120, "totalAmount": 58800.00 },
        { "medicineId": "med-02", "name": "Seclo 20mg", "genericName": "Omeprazole", "companyName": "Square", "boxes": 85, "totalAmount": 42500.00 },
        { "medicineId": "med-03", "name": "Monas 10mg", "genericName": "Montelukast", "companyName": "Square", "boxes": 40, "totalAmount": 24000.00 }
      ],
      "momComparison": {
        "currentMonthAmount": 148500.00,
        "previousMonthAmount": 132100.00,
        "varianceAmount": 16400.00,
        "variancePercent": 12.4
      }
    },
    "inventoryInsights": {
      "totalMedicinesCount": 1240,
      "lowStockCount": 3,
      "outOfStockCount": 1,
      "nearExpiryCount": 2,
      "expiredCount": 0,
      "reorderSuggestions": [
        { "medicineId": "med-01", "name": "Napa Extra", "companyId": "comp-bex", "currentStock": 4, "suggestedBoxes": 50, "reason": "Low Stock (< 10 boxes)" },
        { "medicineId": "med-04", "name": "Sergel 20mg", "companyId": "comp-ren", "currentStock": 0, "suggestedBoxes": 30, "reason": "Out of Stock" }
      ]
    },
    "orderOverview": {
      "totalOrders": 14,
      "byStatus": {
        "SUBMITTED": 2,
        "ALLOCATED": 1,
        "PACKED": 2,
        "DISPATCHED": 3,
        "DELIVERED": 6,
        "CANCELLED": 0
      },
      "recentDispatched": [
        {
          "orderId": "ORD-20261111-BEX-7967",
          "companyName": "Beximco Pharmaceuticals Ltd.",
          "challanNo": "CH-20261111-BEX-9102",
          "vanPlate": "DHK-METRO-CHA-11-2094",
          "driverPhone": "+880 1711-223344",
          "dispatchedAt": "2026-11-11T16:30:00.000Z"
        }
      ]
    },
    "rbac": {
      "role": "PHARMACY_OWNER",
      "financesMasked": false
    }
  }
}
```

- **Masked Response (200 OK — Counter Staff / RETAIL_PHARMACY):**
```json
{
  "success": true,
  "data": {
    "financialOverview": {
      "totalPurchasePeriod": null,
      "totalPurchaseYear": null,
      "purchaseGrowthPercent": null,
      "totalOutstandingBalance": null,
      "availableCreditLimit": null,
      "totalCreditFacility": null,
      "creditUtilizationPercent": null,
      "maskedNotice": "Financial metrics require Pharmacy Owner credentials."
    },
    "inventoryInsights": { "totalMedicinesCount": 1240, "lowStockCount": 3, "outOfStockCount": 1, "nearExpiryCount": 2, "expiredCount": 0 },
    "orderOverview": { "totalOrders": 14, "byStatus": { "SUBMITTED": 2, "ALLOCATED": 1, "PACKED": 2, "DISPATCHED": 3, "DELIVERED": 6, "CANCELLED": 0 } },
    "rbac": {
      "role": "RETAIL_PHARMACY",
      "financesMasked": true
    }
  }
}
```

---

### 7. Database Schema, Tables, Relationships & Constraints

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│            Pharmacy             │ 1       * │         PharmacyCredit          │
├─────────────────────────────────┤───────────├─────────────────────────────────┤
│ id (PK)                         │           │ id (PK)                         │
│ name                            │           │ pharmacyId (FK)                 │
│ drugLicenseNo                   │           │ companyId (FK)                  │
│ creditLimit                     │           │ creditLimit (Decimal)           │
│ outstandingBalance              │           │ usedCredit (Decimal)            │
└─────────────────────────────────┘           └─────────────────────────────────┘
                 │ 1
                 │
                 │ *
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│              Order              │ 1       * │            OrderItem            │
├─────────────────────────────────┤───────────├─────────────────────────────────┤
│ id (PK)                         │           │ id (PK)                         │
│ pharmacyId (FK)                 │           │ orderId (FK)                    │
│ companyId (FK)                  │           │ medicineId (FK)                 │
│ totalAmount (Decimal)           │           │ quantity (Int)                  │
│ status (OrderLifecycleStatus)   │           │ unitPrice (Decimal)             │
│ paymentTerms                    │           │ subtotal (Decimal)              │
│ createdAt (DateTime, INDEXED)   │           │ bonusQuantity (Int)             │
└─────────────────────────────────┘           └─────────────────────────────────┘
                 │ 1
                 │
                 │ *
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│         PaymentLedger           │           │         InventoryBatch          │
├─────────────────────────────────┤           ├─────────────────────────────────┤
│ id (PK)                         │           │ id (PK)                         │
│ pharmacyId (FK)                 │           │ medicineId (FK, INDEXED)        │
│ companyId (FK)                  │           │ batchNumber                     │
│ orderId (FK, NULLABLE)          │           │ quantity (Int)                  │
│ amount (Decimal)                │           │ expiryDate (DateTime, INDEXED)  │
│ transactionType (DEBIT/CREDIT)  │           │ purchasePrice (Decimal)         │
│ createdAt (DateTime, INDEXED)   │           │ status (ACTIVE/EXPIRED/RESERVED)│
└─────────────────────────────────┘           └─────────────────────────────────┘
```

#### SQL Indexes for Sub-50ms Dashboard Query Performance:
```sql
CREATE INDEX idx_orders_pharmacy_created ON "Order" ("pharmacyId", "createdAt");
CREATE INDEX idx_orders_company_created ON "Order" ("companyId", "createdAt");
CREATE INDEX idx_batches_expiry ON "InventoryBatch" ("expiryDate");
CREATE INDEX idx_batches_med_qty ON "InventoryBatch" ("medicineId", "quantity");
CREATE INDEX idx_ledger_pharmacy_created ON "PaymentLedger" ("pharmacyId", "createdAt");
```

---

### 8. Authentication, Authorization & Security Requirements
- **Session Verification:** Every request must present a valid, unexpired `medgo_session` token issued by `ST-1.1A`.
- **Role Enforcement & Data Masking:**
  - `PHARMACY_OWNER` & `ADMIN`: Granted full access to all procurement, financial balances, and inventory metrics.
  - `RETAIL_PHARMACY` (Staff): Financial fields (`totalPurchasePeriod`, `outstandingBalance`, `availableCreditLimit`, `companyPurchases.amount`) are scrubbed by the server and returned as `null` with `financesMasked: true`.
  - `COMPANY_REP` (MPO): Scoped strictly to their assigned `companyId`. MPOs cannot inspect other companies' purchase volumes or cross-manufacturer metrics.
- **Tenant Isolation:** Enforced at SQL / ORM query generation level (`WHERE pharmacyId = session.pharmacyId`). Attempts to forge requests for other pharmacies are rejected with `403 Forbidden`.

---

### 9. Input Validation, Edge Cases & Error Handling
- **Invalid Date Range:** If `startDate > endDate`, returns `422 Unprocessable Entity` with error `"startDate cannot be after endDate"`.
- **Excessive Date Window:** If `(endDate - startDate) > 365 days`, returns `422 Unprocessable Entity` with error `"Date range query cannot exceed 365 days"`.
- **Zero Spend Period:** If no orders occurred during the selected window, returns `totalPurchasePeriod = 0.00` and `purchaseGrowthPercent = 0.0` (never throws `DivideByZeroException` or NaN).
- **Missing Inventory Batches:** If zero batches exist for a medicine, stock is cleanly reported as `0` without missing property crashes.
- **Unlinked POS Dispensing Module:** Handles non-existent retail POS sales tables gracefully by returning structured flag `salesDataAvailable: false`.

---

### 10. Dependencies on Other Features & Phases

#### 10.1 Phase 1 In-Scope Dependencies (Fully Satisfied):
- **`ST-1.1A` & `ST-1.1B` (Authentication):** Provides authenticated user session, pharmacy identity, and security tokens.
- **`ST-1.2` (RBAC):** Supplies `VIEW_FINANCES` and `VIEW_DASHBOARD` role checks.
- **`ST-1.3` (Pharmacy Profiles):** Supplies licensed pharmacy details, credit facility thresholds, and depot linkage.
- **`ST-1.4` (Company Directory):** Supplies canonical company names, logos, and support hotlines.
- **`ST-1.5` & `ST-1.6` (Catalog & Taxonomies):** Supplies medicine names, generics, dosage forms, and chemist margin formulas.
- **`ST-1.8` & `ST-1.10` (Cart & Orders Engine):** Supplies order history, trade scheme bonuses, wholesale discounts, and physical batch allocations.

#### 10.2 Forward Dependencies (Scheduled for Later Phases):
- **Phase 3/4: Point-of-Sale (POS) & Counter Sales:** Feeds real-time retail customer sales receipts into `salesAnalytics`.
- **Phase 4: Payment Gateway & Automated Reconciliation:** Feeds bank/MFS settlement data into `totalPayments`.
- **Phase 2: Live Delivery Van GPS:** Feeds live coordinates into the active dispatch snapshot widget on the Dashboard.

---

### 11. Detailed Acceptance Criteria
1. **Real Database Data:** Every figure displayed on the Dashboard must be dynamically calculated from database records (`Order`, `OrderItem`, `PharmacyCredit`, `InventoryBatch`); no hardcoded mock figures are permitted.
2. **Filter Reactivity:** Changing the filter selector (Today, 7D, This Month, Last Month, This Year, Custom, Company) must update all cards and charts asynchronously without full-page refresh.
3. **RBAC Masking:** Users authenticated as `RETAIL_PHARMACY` must receive masked figures (`••••••`) for all financial totals while retaining access to inventory alerts and order counts.
4. **Tenant Scoping:** Pharmacy owners must only see their own pharmacy's transactions; MPOs must only see orders for their assigned pharmaceutical company.
5. **Accurate MoM Growth:** Percentage changes between current and previous periods must adhere mathematically to standard variance formulas with proper zero-handling.
6. **FEFO & Expiry Precision:** Batches expiring within 90 days must trigger Near Expiry warnings; expired batches must trigger DGDA return alerts.
7. **Reorder Suggestions:** Suggested order quantities must be computed based on stock vs threshold and formatted in full manufacturer boxes.
8. **Distinct Missing POS State:** Absence of retail sales records must be displayed as `POS Module Unlinked`, never as `৳0 Sales`.
9. **Performance Benchmark:** Aggregation queries on `GET /api/dashboard/analytics` must complete in $\le 100\text{ms}$.
10. **Visual Responsiveness:** Dashboard cards and charts must display without horizontal overflow on mobile screens (`360px - 430px`) and scale gracefully to tablet/desktop.

---

### 12. Comprehensive Test Scenarios (Positive, Negative, Edge-Case)

#### Positive Test Cases:
- **Test 1.11.1 (Standard Month Aggregation):** Query `GET /api/dashboard/analytics?period=this_month`. Verify returned `totalPurchasePeriod` matches sum of all non-cancelled orders created in November 2026.
- **Test 1.11.2 (Company Filter):** Query with `companyId=comp-bex`. Verify `companyPurchases` returns only Beximco and all order counts match Beximco orders.
- **Test 1.11.3 (Month-over-Month Comparison):** Verify `momComparison` correctly calculates difference between current month spend and previous month spend.
- **Test 1.11.4 (Inventory Health):** Verify `lowStockCount` reflects medicines with $\le 10$ boxes and `nearExpiryCount` reflects batches with expiry within 90 days.

#### Negative Test Cases:
- **Test 1.11.5 (Unauthenticated Access):** Query endpoint without `medgo_session` cookie. Verify returns `401 Unauthorized`.
- **Test 1.11.6 (Invalid Date Range):** Query with `period=custom&startDate=2026-12-01&endDate=2026-11-01`. Verify returns `422 Unprocessable Entity`.
- **Test 1.11.7 (Unauthorized Cross-Tenant MPO Query):** Log in as Square MPO and attempt to query Beximco analytics. Verify returns `403 Forbidden` (`TENANT_ISOLATION_VIOLATION`).

#### Edge-Case Test Cases:
- **Test 1.11.8 (Brand New Pharmacy — Zero Purchases):** Query analytics for newly registered pharmacy with zero orders. Verify `totalPurchasePeriod = 0.00`, `purchaseGrowthPercent = 0.0`, and empty states render gracefully without runtime error.
- **Test 1.11.9 (Staff RBAC Masking):** Query endpoint with `RETAIL_PHARMACY` session. Verify `totalPurchasePeriod` is `null`, `financesMasked` is `true`, and UI displays privacy shield.
- **Test 1.11.10 (Missing POS Sales):** Verify `salesAnalytics.isAvailable` is `false` and reason is `POS_MODULE_UNLINKED`, ensuring zero sales is not falsely indicated.

---

## 14. Detailed Phase 1 Implementation Roadmap & Git Commit Plan

The following table breaks down every Phase 1 feature into individually deliverable sub-tasks, each with its explicit scope of work, verification requirements, and semantic Git commit message.

| Sub-Task ID | Feature / Component | Scope of Work & Deliverables | Verification & Testing Requirements | Semantic Git Commit Message |
| :--- | :--- | :--- | :--- | :--- |
| **ST-1.1A** | Auth API & Token Security | Implement Phone/Email login, 6-digit OTP delivery, session tokens in secure cookies, and rate limiter. | Test OTP generation, expiry check, session cookie presence, invalid code rejection. | `feat(auth): implement OTP delivery, session cookies, and lockout protection` |
| **ST-1.1B** | Auth UI & Client State | Build `AuthModal`, phone formatter, 6-digit auto-advancing OTP input, 60s cooldown timer, and `useAuth`. | Visual test of modal dialog, backspace navigation, resend cooldown timer. | `feat(auth): build responsive OTP modal with carrier detection and countdown timer` |
| **ST-1.2** | 6-Role RBAC & Route Guards | Implement Permissions Matrix, role token verification, multi-tenant company isolation, and route guards. | Verify Pharmacy Staff cannot access finances; verify Incepta MPO cannot query Square orders. | `feat(rbac): implement 6-role permission matrix and multi-tenant isolation` |
| **ST-1.3** | Pharmacy Compliance Module | Implement DGDA drug license validation, GPS coordinates picker, credit limit ledger, and `PUT /api/pharmacies`. | Test license regex validation, location coordinate updates, credit progress bar. | `feat(pharmacy): add DGDA drug license validation and geolocation profile` |
| **ST-1.4** | Company & Depot Directory | Build directory of 40+ pharmaceutical manufacturers and distribution hubs with operating hours & cold chain status. | Query `/api/companies`, verify depot linkage and direct calling functionality. | `feat(company): implement pharmaceutical manufacturer and depot directory` |
| **ST-1.5** | Medicine Catalog & Clinical Taxonomy | Implement normalized packaging units (`BOX`, `STRIP`, `PIECE`), strengths, dosage forms, MRP, and Trade Prices. | Verify packaging math (`boxUnits = stripsPerBox * piecesPerStrip`), Rx flags, cold chain flags. | `feat(catalog): normalize DGDA medicine taxonomy and packaging specifications` |
| **ST-1.6** | Multi-Attribute Medicine Search | Implement debounced search engine matching brand names, generic molecules, company filters, and sorting. | Benchmark sub-50ms query response for 41,000+ SKU dataset; verify facet filters. | `feat(search): implement debounced multi-field medicine search engine` |
| **ST-1.7** | Brand Showcase & Filter Modal | Build horizontal brand carousel and "View All Brands" modal with logos, SKU counts, and instant filter actions. | Verify carousel swipe, modal search, and catalog filtering by selected brand. | `feat(brands): implement brand showcase and manufacturer filter modal` |
| **ST-1.8** | Company-Wise Cart Engine | Build cart holding items from multiple companies grouped by manufacturer with trade scheme bonuses and steppers. | Verify company subtotal calculations, bonus box additions, and local storage persistence. | `feat(cart): implement multi-company cart engine with trade schemes` |
| **ST-1.9** | Multi-Company Unified Checkout | Build checkout screen displaying bill summary, 3% DGDA discount, and payment terms (COD, Credit, bKash). | Test subtotal calculations, credit limit checks, and payment method selection. | `feat(checkout): implement unified checkout with company credit validation` |
| **ST-1.10**| Atomic Order Decomposition Engine | Implement server-side order decomposition, FEFO batch stock locks, ledger debit entries, and MPO notification dispatch. | Test multi-company order split (1 cart -> N orders), FEFO batch deduction, rollback on stock shortage. | `feat(orders): implement atomic order decomposition and FEFO stock reservation` |
| **ST-1.11A**| Dashboard Analytics Aggregation Engine | Implement `GET /api/dashboard/analytics` with multi-period date filters, order spend aggregations, company share, credit metrics, and staff RBAC privacy masking. | Query analytics across 6 period filters, test company scoping, verify 422 on invalid dates, test staff financial masking. | `feat(dashboard): implement real-time business analytics aggregation engine` |
| **ST-1.11B**| Dashboard UI — Financial KPIs & Inventory Health | Build responsive metric cards, utilization progress bars, inventory alerts (low stock, out of stock, near expiry), order lifecycle counters, and reorder drawer. | Visual responsive tests, verify click-to-reorder drawer, verify staff masking renders `••••••` shield. | `feat(dashboard): build responsive kpi overview and inventory insight cards` |
| **ST-1.11C**| Dashboard Charts & Interactive Filter Engine | Implement responsive SVG/Canvas charts (Monthly Purchase Bar, Company Share, Top SKUs) and multi-period filter bar with Custom Date Range modal. | Test period filter switching, verify dynamic recalculation of charts without page reload, benchmark sub-100ms UI responsiveness. | `feat(dashboard): implement interactive analytics charts and multi-period filter engine` |


---

## 15. Sign-Off & Verification Process

### Strict Operational Directive:
In direct accordance with the user's instructions:
1. **No implementation coding will begin** until the user has thoroughly reviewed this complete Functional Requirements Specification (FRS) and approved the implementation roadmap.
2. Upon user approval, each sub-task (`ST-1.1A` through `ST-1.10`) will be implemented sequentially.
3. Every sub-task will be verified with automated tests, typecheck (`npx tsc --noEmit`), and dev server verification before being committed to Git with its specified semantic message and pushed to the GitHub repository (`main` branch).
