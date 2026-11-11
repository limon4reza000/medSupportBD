# MedGo — Phase 1: Core Foundation
## Complete Workflow & Functional Requirements Specification

**Document Version:** 1.0.0  
**Status:** Approved for Implementation  
**Architecture:** Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma ORM, InMemory / MySQL Database Engine  
**Target Platform:** Mobile-First Web & Android/iOS Hybrid (Capacitor)

---

## 1. Executive Summary & Architectural Scope

Phase 1 establishes the operational backbone of the MedGo B2B Pharmaceutical Platform. It provides end-to-end functionality for identity verification, multi-role authorization, pharmaceutical catalog discovery, brand segmentation, persistent multi-company cart management, and atomic multi-company checkout with order decomposition.

```
+-----------------------------------------------------------------------------------+
|                                 PHARMACY OWNER                                    |
|  - Authenticates via Phone/OTP                                                    |
|  - Explores Medicine Catalog & Brands (Square, Beximco, Incepta, etc.)             |
|  - Adds Products from Multiple Companies to Unified Cart                           |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------+-----------------------------------------+
|                         COMPANY-WISE CART & CHECKOUT                              |
|  - Grouped by Pharmaceutical Manufacturer                                         |
|  - Validates Company Credit Limits & Trade Schemes                                |
|  - Performs Single Unified Checkout                                               |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------+-----------------------------------------+
|                  ATOMIC ORDER DECOMPOSITION BACKEND                               |
|  - Generates Isolated Order #1 for Company A (Square Pharma)                      |
|  - Generates Isolated Order #2 for Company B (Beximco Pharma)                     |
|  - Locks Batch Quantities (FEFO Allocation)                                       |
|  - Dispatches Real-Time MPO & Depot Notifications                                 |
+-----------------------------------------------------------------------------------+
```

---

## 2. Feature 1: Authentication & Session Management

### 2.1 Description
Provides dual-mode authentication (Phone Number + 6-digit OTP or Password) compliant with Bangladesh telecommunications formatting (`+8801...`). Ensures DGDA pharmacy credentials and phone numbers are verified before commercial transactions.

### 2.2 Component Hierarchy
- `AuthModal`: Responsive bottom-sheet / modal dialog for mobile & desktop.
- `PhoneInput`: Auto-prefixes `+880` with telecom carrier badge (Grameenphone, Banglalink, Robi, Airtel, Teletalk).
- `OtpInput`: 6-digit auto-advancing verification field with 60-second cooldown timer.
- `AuthContext` / `useAuth`: Global React context managing session tokens, active role, and pharmacy profile.

### 2.3 User Interactions & State Transitions
1. **Entry:** User taps "Sign In" or is intercepted by protected action (Checkout, Borrow).
2. **Phone Submission:** User enters 11-digit mobile number (`017XXXXXXXX`). System triggers `POST /api/auth/otp/send`.
3. **OTP Challenge:** UI displays 6-digit input with auto-focus. Countdown timer starts at 60s.
4. **Verification:** On completion of 6th digit, triggers `POST /api/auth/otp/verify`.
5. **Success:** User receives JWT token stored in secure cookie + LocalStorage backup; state transitions to authenticated role.
6. **Error States:** Invalid OTP displays red shake animation; 5 failed attempts locks phone number for 15 minutes.

### 2.4 Business Logic & Validation Rules
- Phone must match `^(?:\+8801|01)[3-9]\d{8}$`.
- Passwords (if used) require minimum 8 characters, 1 digit, 1 special character.
- Active pharmacy check: If the pharmacy's DGDA license is expired or suspended, session is restricted to Read-Only mode with warning banner.

### 2.5 Backend & API Endpoints
- `POST /api/auth/otp/send` -> Request OTP code generation.
- `POST /api/auth/otp/verify` -> Verify code, create session, issue token.
- `POST /api/auth/login` -> Email/Phone + password credential check.
- `POST /api/auth/logout` -> Invalidate session and clear auth cookies.
- `GET /api/auth/me` -> Hydrate current authenticated user profile.

### 2.6 Database Requirements
- `User` model: `id`, `phone`, `email`, `fullName`, `passwordHash`, `role`, `isActive`, `createdAt`.
- `OtpVerification` model: `id`, `phone`, `otpCode`, `expiresAt`, `attempts`, `isVerified`.

---

## 3. Feature 2: User Roles & Role-Based Access Control (RBAC)

### 3.1 Description
Multi-tenant authorization architecture supporting 6 distinct pharmaceutical roles with strict server-side boundary enforcement.

### 3.2 Role Matrix
| Role | Code | Permissions & Scope |
| :--- | :--- | :--- |
| **Pharmacy Owner** | `PHARMACY_OWNER` | Manage store inventory, order stock, multi-company checkout, borrow requests, credit visibility. |
| **Pharmacy Staff** | `PHARMACY_STAFF` | Browse catalog, draft orders, view stock, check received shipments. Cannot edit credit or licenses. |
| **Company Representative** | `SALES_REP` / `MPO` | Assigned territory pharmacies, view incoming orders for own company, accept/reject line items. |
| **Company Admin** | `PHARMA_COMPANY` | Manage company catalog, pricing, trade schemes, approve credit limits, review company analytics. |
| **Hub / Depot Manager** | `DEPOT_MANAGER` | Oversee regional depot batches, inspect cold-chain logs, assign delivery vans, confirm dispatches. |
| **Platform Super Admin** | `ADMIN` | DGDA pharmacy verification, dispute resolution, audit trail access, system configuration. |

### 3.3 Business Logic
- Multi-Tenant Isolation: Every database query for company-specific resources is scoped by `companyId`. A Sales Rep from Incepta cannot view orders placed with Square.
- Server-side middleware (`requireRole([UserRole.PHARMACY_OWNER])`) validates role tokens prior to executing route handlers.

---

## 4. Feature 3: Pharmacy Profiles & Compliance

### 4.1 Description
Maintains authenticated business profile for retail pharmacies, including DGDA license verification, physical GPS depot coordinates, and store credit ledger.

### 4.2 Component & Data Model
- Profile Header: Trade Name, Pharmacy Code (`PHARM-DHK-001`), Verified Badge.
- Legal Information: DGDA Drug License No (`DL-DHK-2022-88219`), TIN/BIN number, Trade License expiry.
- Location Profile: Latitude, Longitude, Thana, District, Street Address, Nearest Verified Supply Hub.
- Financial Profile: Approved Total Credit Limit (e.g. ৳120,000), Outstanding Balance (৳34,500), Available Credit (৳85,500).

### 4.3 Workflows
- **Location Auto-Detection:** Uses HTML5 Geolocation with manual Dhaka preset overrides (Dhanmondi, Shamoli, Tejgaon, Mirpur, Uttara, Mohakhali, Motijheel, Kallyanpur).
- **License Renewal Alert:** When drug license is within 30 days of expiry, a high-priority banner reminds the chemist to upload renewed documents.

---

## 5. Feature 4: Pharmaceutical Company & Depot Profiles

### 5.1 Description
Maintains profiles of licensed pharmaceutical manufacturers and their authorized regional distribution depots across Bangladesh.

### 5.2 Manufacturer Portfolio
- **Square Pharmaceuticals PLC** (Central Depot: Tejgaon Industrial Area)
- **Beximco Pharmaceuticals Ltd.** (Metropolitan Logistics Hub: Shamoli)
- **Incepta Pharmaceuticals Ltd.** (Western Regional Depot: Shankar, Dhanmondi)
- **Renata PLC** (Northern Logistics Warehouse: Mirpur Sector 1)
- **ACI Healthcare Limited** (Tejgaon Logistics Center)
- **Eskayef Pharmaceuticals Ltd.** (Commercial Depot: Motijheel)
- **Delta Pharma Limited** (Uttara Distribution Center)

### 5.3 Workflows
- Direct access to depot operating hours (8:00 AM - 10:00 PM), cutoff times for same-day delivery, cold chain storage availability (2°C - 8°C), and verified DGDA depot certificates.

---

## 6. Feature 5: Medicine Catalog & Clinical Taxonomy

### 6.1 Description
Comprehensive, normalized medicine catalog featuring genuine Bangladeshi pharmaceutical products with packaging units, strengths, dosage forms, and government-monitored pricing.

### 6.2 Data Model per Medicine
- `id`: Unique identifier (e.g., `med-01`).
- `brandName`: Trade name (e.g., "Napa Extra", "Seclo 20", "Maxpro 20", "Monas 10").
- `genericName`: Active pharmaceutical ingredient (e.g., "Paracetamol + Caffeine", "Omeprazole", "Esomeprazole").
- `dosageForm`: `TABLET`, `CAPSULE`, `SYRUP`, `INJECTION`, `EYE_DROPS`.
- `strength`: Quantitative dosage (e.g., "500mg + 65mg", "20mg", "10mg").
- `manufacturer`: Company name and reference ID.
- `packSize`: Packaging description (e.g., "20 x 10 tablets per box").
- `piecesPerStrip`: Number of units per strip (e.g., 10).
- `stripsPerBox`: Number of strips per wholesale box (e.g., 20).
- `mrp`: Maximum Retail Price per unit and box.
- `tradePrice`: B2B trade price per box.
- `requiresPrescription`: Boolean Rx indicator.
- `isColdChain`: Boolean flag indicating refrigerated logistics requirement.

---

## 7. Feature 6: Medicine Search & Discovery Engine

### 7.1 Description
High-performance, debounced search and filtering engine allowing pharmacy owners to locate medicines within milliseconds.

### 7.2 Capabilities
1. **Multi-Field Text Search:** Matches brand name, generic name, dosage form, or company.
2. **Filtering Facets:**
   - Pharmaceutical Company (All, Square, Beximco, Incepta, etc.)
   - Therapeutic / Dosage Form (Tablets, Capsules, Syrups, Injections)
   - Stock Status (All, In Stock, Low Stock, Bonus Schemes)
3. **Sorting:** Trade Price (Low to High / High to Low), Alphabetical, Most Popular.
4. **Empty State:** Shows friendly message with alternative generic molecules if the specific brand is unavailable.

---

## 8. Feature 7: Brands & Manufacturer Directory

### 8.1 Description
Visual brand navigation bar and bottom-sheet brand directory honoring the MedGo visual identity.

### 8.2 Workflows
- Quick-filter pills for top brands on the Home and Explore tabs.
- "View All" modal displaying all registered pharmaceutical manufacturers with brand logos, SKU counts, and active trade schemes.
- Selecting a brand instantly filters the catalog to that manufacturer's portfolio.

---

## 9. Feature 8: Company-Wise Cart Management

### 9.1 Description
Multi-tenant cart engine capable of holding products from multiple pharmaceutical companies simultaneously while grouping them by company for clear subtotaling and commercial visibility.

### 9.2 Key Interactions
- **Add to Cart:** Select box quantity or strip quantity.
- **Quantity Stepper:** `[-]`, direct numeric input, `[+]` with real-time stock cap validation.
- **Company Grouping:** Products automatically segregate into:
  - *Square Pharmaceuticals Section* (Items, Subtotal, Applied Bonus)
  - *Beximco Pharmaceuticals Section* (Items, Subtotal, Applied Bonus)
- **Trade Scheme Calculation:** Real-time bonus calculation (e.g. Buy 10 Boxes -> +1 Bonus Box added free).
- **Persistence:** LocalStorage synchronization with debounced server-side cart hydration.

---

## 10. Feature 9: Multi-Company Unified Checkout

### 10.1 Description
The core architectural innovation of MedGo: a single unified checkout screen for the pharmacy owner that decomposes on the server into discrete, legally separated company orders.

### 10.2 Workflow & Validation Pipeline
1. **Cart Validation:** Verify that every line item has sufficient physical stock in the assigned depot.
2. **Price Validation:** Ensure prices haven't changed since items were added to the cart.
3. **Company MOV Check:** Validate that each company's subtotal meets its Minimum Order Value (e.g. ৳1,000).
4. **Credit Check:** For credit payments, verify that the pharmacy's available credit with Company A is `>= Company A order total`.
5. **Trade Discount Application:** Calculate 3% DGDA wholesale scheme discount and bonus products.
6. **Payment Terms:** Select Cash on Delivery (COD), 15-Day Pharmacy Credit Line, or bKash Commercial.
7. **Consolidated Summary:** User sees clear grand total and company-wise subtotals.

---

## 11. Feature 10: Atomic Order Creation & Company Decomposition

### 11.1 Description
Server-side transaction that splits the approved checkout into independent orders.

### 11.2 Decomposition Workflow
```
[User Submits Unified Checkout: Total ৳18,500]
                      |
                      v
      +---------------+---------------+
      |                               |
      v                               v
[Order #ORD-2026-SQR-001]     [Order #ORD-2026-BEX-002]
Company: Square Pharma        Company: Beximco Pharma
Depot: Tejgaon                Depot: Shamoli
Total: ৳11,200                Total: ৳7,300
Status: PENDING_APPROVAL      Status: PENDING_APPROVAL
Batch: FEFO Locked            Batch: FEFO Locked
MPO Notified: Jalal Uddin     MPO Notified: Tariq Aziz
```

### 11.3 Post-Creation Operations
1. **Stock Lock:** Physical units are marked with `StockLockStatus.ACTIVE` (held for 15 minutes awaiting depot confirmation).
2. **Financial Ledger:** Invoices are recorded with status `UNPAID` or `CREDIT_PENDING`.
3. **Audit Trail:** Logged with timestamp, user ID, IP address, and device metadata.
4. **Notification Dispatch:** Real-time alert delivered to the respective company representative and depot dashboard.
5. **Confirmation UI:** Pharmacy owner receives confirmation with discrete tracking IDs for each company.

---

## 12. Component & Sub-Task Implementation Checklist for Phase 1

- [ ] **Component 1.1:** Authentication API & Session Provider (`/api/auth/*` and `AuthContext`).
- [ ] **Component 1.2:** Multi-Role RBAC Authorization Middleware (`lib/auth/rbac.ts`).
- [ ] **Component 1.3:** Pharmacy Compliance & Location Profile Module.
- [ ] **Component 1.4:** Pharmaceutical Company & Depot Directory Service.
- [ ] **Component 1.5:** Medicine Catalog & Data Normalization Engine.
- [ ] **Component 1.6:** Multi-Attribute Search & Filter Pipeline.
- [ ] **Component 1.7:** Brand Directory & Filter Component.
- [ ] **Component 1.8:** Company-Wise Cart Engine with Local & Server Persistence.
- [ ] **Component 1.9:** Multi-Company Checkout Validation & Financial Breakdown.
- [ ] **Component 1.10:** Atomic Order Decomposition & Stock Lock Engine (`/api/orders/checkout`).

---

## 13. Git & Quality Assurance Protocol

In accordance with strict project discipline:
1. Every component will be built, tested, and validated individually.
2. TypeScript compilation (`npx tsc --noEmit`) and build health checks (`HTTP 200`) will be verified for every component.
3. Every component will receive a dedicated, concise Git commit (e.g. `feat(auth): implement OTP validation and session management`) and be pushed immediately to `origin/main`.
4. No broken or intermediate code will be pushed.
