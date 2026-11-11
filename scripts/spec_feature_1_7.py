# -*- coding: utf-8 -*-
"""
Feature 1.7: Brands & Manufacturer Showcase
"""

def build_feature_1_7():
    return """## 9. Feature 1.7: Brands & Manufacturer Showcase

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
"""
