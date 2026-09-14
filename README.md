# MedSupply BD — B2B Pharmaceutical Order Cutting & Distribution Platform

**MedSupply** is a production-grade B2B Pharmaceutical Order Cutting and Inventory Distribution Platform designed for pharmaceutical depots, medical promotion officers (MPO / SR), and retail pharmacies.

---

## 🌟 Key Features

1. **Packaging Hierarchy & Dynamic Trade Bonus Engine**:
   - Multi-tier unit conversion: `Box -> Strip -> Piece (Loose Units)`.
   - Automated trade schemes (e.g., `10+1 Box Free`, `5% Slab Discounts`, `Bonus Ratio`).
   - Standardized billable packaging breakdown.

2. **Near-Expiry FIFO (First-In, First-Out) Batch Allocation**:
   - Orders batches by `expiryDate ASC` to prevent warehouse expiry losses.
   - Intelligent multi-batch splitting when a single batch has insufficient quantity.
   - Near-expiry alert tags (< 90 days) and expired buffer filters (< 30 days).

3. **Pharmacy Credit & Ledger Risk Engine**:
   - Real-time credit limit enforcement (`currentBalance + orderNetTotal <= creditLimit`).
   - Overdue invoice aging checks (blocks accounts with unpaid invoices exceeding credit cycle days).
   - Immutable double-entry financial ledger (`INVOICE_DEBIT`, `PAYMENT_CREDIT`).

4. **Optimistic Stock Locking (Redis-Compatible)**:
   - Concurrency control with TTL to prevent overselling during peak order cutting windows.

5. **AI Clinical & Demand Intelligence**:
   - **AI Prescription & Memo Slip Parser**: Ingests handwritten/typed doctor slips with OCR confidence scoring and fuzzy catalog matching.
   - **AI Demand Forecaster**: Synthesizes 30-day consumption velocity with monsoon disease surge indices (Dengue, Typhoid, Viral Fever).
   - **Out-of-Stock Generic Alternatives**: Finds bioequivalent chemical generic substitutes with price variance metrics.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Next.js Server Handlers / REST APIs, TypeScript, Zod Schema Validation.
- **Database & ORM**: MySQL / PostgreSQL with Prisma ORM.
- **State & Concurrency**: Redis-compatible distributed locking with TTL.
- **Theme**: Surgical Green (`#025540`) with high-contrast pure white text (`#FFFFFF`).

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Integration Tests
```bash
node scripts/test-platform.js
```

---

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── alternatives/   # Generic substitute finder
│   │   │   ├── forecast/       # 30-day demand forecaster
│   │   │   └── slip-parser/    # AI prescription memo parser
│   │   ├── ledger/             # Financial transaction ledger
│   │   ├── medicines/          # Catalog & batch stock
│   │   ├── orders/checkout/    # Atomic transactional checkout
│   │   └── pharmacies/         # Pharmacy credit profiles
│   ├── globals.css             # Theme #025540 styling
│   ├── layout.tsx
│   └── page.tsx                # Main dashboard & order cutting POS
├── components/
│   ├── AiDemandForecaster.tsx
│   ├── AiSlipParserModal.tsx
│   ├── FifoBatchInspector.tsx
│   ├── GenericAlternativesFinder.tsx
│   ├── LedgerManager.tsx
│   ├── MetricsOverview.tsx
│   ├── Navbar.tsx
│   └── OrderCuttingTerminal.tsx
├── prisma/
│   └── schema.prisma           # Complete database schema
├── services/
│   ├── batchFifoEngine.ts      # Near-expiry FIFO algorithm
│   ├── creditLedgerEngine.ts   # Credit ceiling & ledger audit
│   ├── packagingEngine.ts      # Box/Strip/Piece + trade bonuses
│   └── stockLockEngine.ts      # Optimistic concurrency lock
├── types/
│   └── domain.ts               # Domain types & Zod schemas
└── scripts/
    └── test-platform.js        # Automated end-to-end test suite
```
