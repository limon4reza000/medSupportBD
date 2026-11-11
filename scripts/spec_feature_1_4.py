# -*- coding: utf-8 -*-
"""
Feature 1.4: Pharmaceutical Company & Depot Directory
"""

def build_feature_1_4():
    return """## 6. Feature 1.4: Pharmaceutical Company & Depot Directory

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
"""
