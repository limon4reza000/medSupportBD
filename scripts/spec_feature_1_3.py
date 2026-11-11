# -*- coding: utf-8 -*-
"""
Feature 1.3: Pharmacy Profiles & Compliance
"""

def build_feature_1_3():
    return """## 5. Feature 1.3: Pharmacy Profiles & Compliance

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
"""
