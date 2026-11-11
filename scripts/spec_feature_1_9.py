# -*- coding: utf-8 -*-
"""
Feature 1.9: Multi-Company Unified Checkout
"""

def build_feature_1_9():
    return """## 11. Feature 1.9: Multi-Company Unified Checkout

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
"""
