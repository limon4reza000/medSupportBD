# MedSupplyBD — B2B Pharmaceutical Supply Chain, Order Cutting & Distribution Platform

**MedSupplyBD** is an enterprise-grade B2B Pharmaceutical Supply Chain, Wholesale Procurement, Order Cutting, and Near-Expiry Inventory Management System built specifically for the Bangladesh pharmaceutical ecosystem (`Pharma Company → Regional Depot → Field MPO/SR → Retail Pharmacy`).

The platform indexes **41,302 verified DGDA pharmaceutical SKUs** across **339 licensed manufacturers** with real-time trade schemes, FEFO batch allocation, credit risk auditing, and AI clinical demand intelligence.

---

## 🌟 Comprehensive Feature Catalog

### 1. 🏢 Master Catalog & Company-Based Medicine Findings
- **41,302 Verified DGDA Medicines**: Complete national pharmaceutical price master with trade price (TP), retail MRP, DGDA Registration numbers (DAR), and dosage forms.
- **Dedicated Company Findings & Quick Pills**: Instant filtering for Bangladesh's top pharmaceutical manufacturers:
  - *Square Pharmaceuticals* (2,065 SKUs)
  - *Incepta Pharmaceuticals* (1,775 SKUs)
  - *Drug International* (1,530 SKUs)
  - *Opsonin Pharma* (1,400 SKUs)
  - *Eskayef (SK+F)* (1,370 SKUs)
  - *Renata Limited* (1,216 SKUs)
  - *The ACME Laboratories* (1,152 SKUs)
  - *Beximco Pharmaceuticals* (1,084 SKUs)
  - *Healthcare Pharmaceuticals* (1,046 SKUs)
  - *Aristopharma, Popular, General, Beacon, Ibn Sina, Orion, ACI, and 30+ more*.
- **All-Companies Selector Dropdown**: Select from all 46 leading manufacturers directly from the search bar.
- **Active Company Filter Banner**: Highlights active company filter with exact product count and 1-click reset.
- **Interactive Manufacturer Badges**: Click any company badge on any product card across the platform to immediately filter the view to that manufacturer.
- **Sub-20ms Prefix-Ranked Live Search**: Multi-tiered prefix matching (`Brand Prefix → Generic Prefix → Manufacturer Prefix → Substring`).
- **Virtualized High-Performance Directory**: Smooth 60fps infinite scroll rendering 50 items per batch without memory bloat.

---

### 2. 👥 Enterprise Multi-Role Persona Dashboards
MedSupplyBD provides 5 dedicated workflow interfaces with a persistent top persona switcher:
1. **Pharmacy Retailer / Chemist View**:
   - Real-time credit ledger utilization & available credit balance.
   - Live FEFO stock catalog with trade schemes.
   - 1-click B2B wholesale order cart.
   - AI Handwritten/Typed Doctor Slip upload.
2. **Super Admin Executive Dashboard**:
   - Platform GMV, total network transaction volume, and invoice totals.
   - Regional depot operational health (Dhanmondi, Chittagong, Sylhet, Bogura, Rajshahi).
   - System audit trail with live timestamps.
   - High credit risk exposure radar.
3. **Pharma Manufacturer View**:
   - Production batch release status & QA approvals.
   - National distributor quotas and depot fulfillment percentages.
   - Brand velocity analytics across divisions.
4. **Distributor / Regional Depot View**:
   - Batch-level expiry aging radar (Critical <30d, Warning <90d).
   - Delivery van dispatches, driver route tracking, and proof-of-delivery logs.
   - Warehouse temperature/cold-chain compliance tags.
5. **MPO / Field Sales Representative Terminal**:
   - Assigned territory target progress & completion percentages.
   - Daily pharmacy route itineraries.
   - Order cutting terminal to cut bulk orders on behalf of retail pharmacies.

---

### 3. ⚙️ Core Pharmaceutical Domain Engines

#### A. Packaging Hierarchy & Dynamic Trade Bonus Engine (`PackagingEngine`)
- **Unit Hierarchy**: `Box → Strip → Piece (Loose Units)`.
- **Trade Promotion Schemes**:
  - `BOX_BONUS`: Auto-awards free boxes/strips (e.g., `10+1 Box Free`, `100+10 Free`).
  - `SLAB_DISCOUNT`: Quantity-based percentage discounts (e.g., 5% off for 50+ boxes).
  - `BONUS_PERCENTAGE`: Automatic bonus stock allocation.
- **Financial Breakdown**: Calculates Gross Amount, Scheme Discounts, 2.4% BD Pharma VAT, and Net B2B Payable.

#### B. Near-Expiry FIFO (FEFO) Batch Allocation Engine (`BatchFifoEngine`)
- **Earliest Expiry First**: Sorts available depot stock strictly by `expiryDate ASC` to eliminate warehouse expiration losses.
- **Multi-Batch Order Splitting**: Seamlessly fulfills high-volume orders across multiple chronological batches when a single batch has insufficient stock.
- **Expiry Buffer Rules**:
  - Excludes batches expiring within 30 days.
  - Warns depot managers on batches expiring within 90 days.

#### C. Pharmacy Credit Ledger & Risk Auditing Engine (`CreditLedgerEngine`)
- **Real-Time Credit Ceiling**: Blocks order placement if `projectedBalance > creditLimit`.
- **Aging & Invoice Overdue Auditing**: Automatically freezes checkout if an unpaid invoice exceeds credit cycle terms (e.g. >30 days).
- **Immutable Double-Entry Ledger**: Full transaction log recording `INVOICE_DEBIT` and `PAYMENT_CREDIT` transactions with reference numbers.

#### D. Optimistic Stock Locking Engine (`StockLockEngine`)
- **Distributed Concurrency Lock**: In-memory / Redis-compatible mutex lock with TTL (Time-To-Live).
- Prevents race conditions and overselling during peak morning order cutting windows.

---

### 4. 🤖 AI Clinical & Demand Intelligence Suite

- **AI Prescription & Memo Slip Parser (`/api/ai/slip-parser`)**:
  - Ingests typed or handwritten doctor memos/chemist slips.
  - Generates entity confidence scores (98%+ confidence) for Brand, Generic, Strength, Dosage Form, Unit, and Quantity.
  - 1-click **"Add Extracted Items to Order Cart"**.
- **AI 30-Day Demand Forecaster (`/api/ai/forecast`)**:
  - Calculates 30-day velocity run-rates per SKU.
  - Applies regional monsoon & disease epidemic surge multipliers (Monsoon Dengue, Typhoid, Post-Eid influx: 1.45x multiplier).
  - Outputs recommended replenishment quantities and capital allocations.
- **Out-of-Stock Generic Substitutes Engine (`/api/ai/alternatives`)**:
  - Identifies bioequivalent pharmaceutical substitutes sharing identical chemical generic composition and dosage form.
  - Shows price variance metrics (e.g., Napa vs Ace vs Fast) to prevent lost sales.

---

### 5. 🔍 Omnichannel Command & Search Palette
- **Global `Cmd + K` / `Ctrl + K` Modal (`SearchCommand.tsx`)**:
  - High-contrast full-screen command center.
  - Direct company pills + full 46-company selector dropdown.
  - Instant trade price vs MRP display with 1-click Quick Add to Cart.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Vanilla Tailwind CSS (Custom `#025540` Surgical Green Palette) |
| **Icons** | Lucide React |
| **Database & ORM** | PostgreSQL / MySQL with Prisma ORM |
| **Validation** | Zod Schemas |
| **State Management** | React Context (`AppContext.tsx`) with localStorage persistence |
| **Testing** | Automated Node.js integration & E2E test runner (`scripts/test-platform.js`) |

---

## 🚀 Getting Started

### 1. Installation
```bash
git clone https://github.com/limon4reza000/medSupportBD.git
cd medSupportBD
npm install
```

### 2. Setup Prisma ORM
```bash
npx prisma generate
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Automated Test Suite
```bash
node scripts/test-platform.js
```

---

## 📱 Mobile App (PWA & Android Native APK)

MedSupplyBD comes with dual mobile architecture for seamless chemist and field sales representative (MPO) usage:

### 1. Progressive Web App (PWA) — Recommended
- **Zero App Store friction**: <3MB download size, instant updates.
- **Offline Mode**: Serves cached 41,300+ SKU catalog and queues orders locally when connectivity drops in remote pharmacies.
- **Install Flow**: Scan the QR Code from the header **"📱 Get App"** button or select *"Add to Home Screen"* in Chrome (Android) or Safari (iOS).

### 2. Native Android Application (Compiled APK)
- **Pre-Compiled APK Ready**:
  - Gradle Output: [`android/app/build/outputs/apk/debug/app-debug.apk`](file:///c:/Projects/New%20folder/new/MedSupplyBD/android/app/build/outputs/apk/debug/app-debug.apk) (17.3 MB)
  - Public Web Download: [`public/downloads/medsupplybd-v1.0.apk`](file:///c:/Projects/New%20folder/new/MedSupplyBD/public/downloads/medsupplybd-v1.0.apk)
- **Package ID**: `bd.medsupply.b2b`
- **Target Platform**: Android 14+ / SDK 36 (minSdk: 24, Android 7.0+)
- **Build / Recompile Commands**:
  ```bash
  # 1. Sync web assets & compile native APK:
  npm run mobile:build

  # 2. Or compile APK directly via Gradle:
  npm run mobile:apk
  ```

---

## 👥 Contributors
- **Limon Reza** (ID: 232-35-004)
- **Md Mehedi Hasan** (ID: 232-35-712)

