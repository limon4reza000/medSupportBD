# -*- coding: utf-8 -*-
"""
Master Builder for MedGo Phase 1 Functional Requirements Specification
Assembles all sections into docs/PHASE_1_FUNCTIONAL_SPECIFICATION.md
"""
import sys
import os

from spec_feature_1_1 import build_feature_1_1
from spec_feature_1_2 import build_feature_1_2
from spec_feature_1_3 import build_feature_1_3
from spec_feature_1_4 import build_feature_1_4
from spec_feature_1_5 import build_feature_1_5
from spec_feature_1_6 import build_feature_1_6
from spec_feature_1_7 import build_feature_1_7
from spec_feature_1_8 import build_feature_1_8
from spec_feature_1_9 import build_feature_1_9
from spec_feature_1_10 import build_feature_1_10

def build_header_and_toc():
    return """# MEDGO — Phase 1: Core Foundation
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
13. [Detailed Phase 1 Implementation Roadmap & Git Commit Plan](#13-detailed-phase-1-implementation-roadmap--git-commit-plan)
14. [Sign-Off & Verification Process](#14-sign-off--verification-process)

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
2. **Atomic Lock Acquisition:** The engine checks available physical stock minus existing unexpired locks. If available, it registers a lock with an expiration timestamp $T_{now} + 180\\text{s}$.
3. **Lock Auto-Expiry:** If checkout confirmation is not received within 180 seconds, background cleanup worker (`reclaimExpiredStockLocks()`) auto-releases reservations, preventing orphaned stock holds during abandoned checkouts.

### 2.4 FEFO Batch Allocation Algorithm
To prevent near-expiry medicines from accumulating, the allocation algorithm selects batches in strict order of earliest expiration:
1. Query active batches for Medicine $M$ at Depot $D$ where $\\text{expiryDate} > T_{now} + 90\\text{ days}$ (regulatory minimum shelf-life threshold).
2. Sort ascending by `expiryDate ASC`.
3. Sequentially allocate required quantity across batches until satisfied.
4. Record exact batch ID, batch number, and expiry date on `OrderItemAllocation`.

### 2.5 Multi-Company Credit Validation & Ledger Isolation
Each company operates an independent credit ledger:
- Beximco Credit Account: $\\text{Available} = \\text{Limit} - \\text{Used}$.
- Square Credit Account: $\\text{Available} = \\text{Limit} - \\text{Used}$.
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
"""

def build_roadmap_and_signoff():
    return """## 13. Detailed Phase 1 Implementation Roadmap & Git Commit Plan

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

---

## 14. Sign-Off & Verification Process

### Strict Operational Directive:
In direct accordance with the user's instructions:
1. **No implementation coding will begin** until the user has thoroughly reviewed this complete Functional Requirements Specification (FRS) and approved the implementation roadmap.
2. Upon user approval, each sub-task (`ST-1.1A` through `ST-1.10`) will be implemented sequentially.
3. Every sub-task will be verified with automated tests, typecheck (`npx tsc --noEmit`), and dev server verification before being committed to Git with its specified semantic message and pushed to the GitHub repository (`main` branch).
"""

def main():
    parts = [
        build_header_and_toc(),
        build_feature_1_1(),
        build_feature_1_2(),
        build_feature_1_3(),
        build_feature_1_4(),
        build_feature_1_5(),
        build_feature_1_6(),
        build_feature_1_7(),
        build_feature_1_8(),
        build_feature_1_9(),
        build_feature_1_10(),
        build_roadmap_and_signoff()
    ]
    full_text = "\n\n".join(parts)
    target_path = r"c:\Projects\New folder\new\MedSupplyBD\docs\PHASE_1_FUNCTIONAL_SPECIFICATION.md"
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(full_text)
    print(f"Successfully generated {target_path}")
    print(f"Total characters: {len(full_text)}")
    print(f"Total lines: {len(full_text.splitlines())}")

if __name__ == "__main__":
    main()
