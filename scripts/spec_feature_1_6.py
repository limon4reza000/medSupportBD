# -*- coding: utf-8 -*-
"""
Feature 1.6: Multi-Attribute Medicine Search & Discovery Engine
"""

def build_feature_1_6():
    return """## 8. Feature 1.6: Multi-Attribute Medicine Search & Discovery Engine

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
"""
