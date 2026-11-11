# -*- coding: utf-8 -*-
"""
Feature 1.8: Company-Wise Cart Engine
"""

def build_feature_1_8():
    return """## 10. Feature 1.8: Company-Wise Cart Engine

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
- **Promotional Scheme Engine (`calculateTradeSchemes.ts`):** Client-side calculator applying quantity bonus rules (e.g. $Q \\ge 10 \\rightarrow +1$ bonus).

### 5. Backend Business Logic and Processing Rules
- **Server Cart Synchronization:** When an authenticated user updates their cart, the payload syncs with `POST /api/cart/sync`, persisting cart items to the database.
- **Pricing Verification:** The server re-validates current Trade Prices against the live database to prevent client-side price tampering.
- **MOV Enforcement:** Checks that for each company cluster in the cart:
  $$\\sum (\\text{tradePrice} \\times \\text{quantity}) \\ge \\text{company.minimumOrderAmount}$$
- **Statutory Chemist Wholesale Discount:** Applies standard DGDA 3% chemist cash discount across all eligible items:
  $$\\text{Chemist Discount} = \\text{Gross Trade Price} \\times 0.03$$
  $$\\text{Net Payable} = \\text{Gross Trade Price} - \\text{Chemist Discount}$$

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
- **Below Minimum Order Value:** "Proceed to Checkout" button is disabled with an explanatory tooltip if any company cluster subtotal $< \\text{MOV}$.

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
"""
