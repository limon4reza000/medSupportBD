# -*- coding: utf-8 -*-
"""
Feature 1.10: Atomic Order Decomposition & FEFO Stock Reservation Engine
"""

def build_feature_1_10():
    return """## 12. Feature 1.10: Atomic Order Decomposition & FEFO Stock Reservation Engine

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
"""
