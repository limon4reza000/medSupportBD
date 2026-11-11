# -*- coding: utf-8 -*-
"""
Feature 1.5: Medicine Catalog & Clinical Taxonomy
"""

def build_feature_1_5():
    return """## 7. Feature 1.5: Medicine Catalog & Clinical Taxonomy

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
  $$\\text{Chemist Margin (\\%)} = \\frac{\\text{MRP} - \\text{Trade Price}}{\\text{MRP}} \\times 100$$
- **High-Performance Virtualized List:** Seamless 60 FPS scrolling through 1,000+ medicines using windowing (react-window or tanstack virtual).

### 5. Backend Business Logic and Processing Rules
- **Mathematical Packaging Engine:** Enforces canonical packaging formulas:
  - $\\text{Units per Box} = \\text{stripsPerBox} \\times \\text{piecesPerStrip}$
  - $\\text{Trade Price per Strip} = \\frac{\\text{tradePricePerBox}}{\\text{stripsPerBox}}$
  - $\\text{Trade Price per Piece} = \\frac{\\text{tradePricePerBox}}{\\text{Units per Box}}$
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
"""
