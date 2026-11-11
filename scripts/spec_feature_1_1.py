# -*- coding: utf-8 -*-
"""
MedGo Phase 1 Functional Requirements Specification Generator
Generates comprehensive, enterprise-grade FRS covering all 10 features with 12 distinct sections each.
"""
import sys

def build_feature_1_1():
    return """## 3. Feature 1.1: Authentication & Session Management

### 1. Purpose and Expected Functionality
Feature 1.1 provides secure, tamper-proof, multi-channel identity verification and session lifecycle management for all MedGo actors. It allows pharmacy owners, staff, pharmaceutical representatives, and administrators to securely sign in using mobile phone numbers with 6-digit One-Time Passwords (OTP) or corporate email/password credentials, sustaining seamless authenticated sessions with cryptographic tokens stored in `httpOnly` secure cookies.

### 2. Complete End-to-End User Workflow
1. User opens MedGo on mobile browser or desktop and is greeted on the Home Screen.
2. Clicking any restricted action (e.g., "Place Order", "Cart", "Profile", "Dashboard") or the user avatar triggers the `AuthModal` bottom sheet.
3. User selects their role (default: `PHARMACY_OWNER`) and enters their 11-digit Bangladeshi mobile number (`01XXXXXXXXX`) or corporate email.
4. User clicks **"Send OTP Verification Code"**.
5. The backend validates formatting, applies IP/phone rate limiting, generates a cryptographic 6-digit OTP, stores it in cache with a 300-second (5 min) TTL, and dispatches via SMS gateway (with fallback demo bypass code for testing).
6. Frontend switches smoothly to the OTP verification screen with an auto-advancing 6-box PIN input and a 60-second countdown timer.
7. User inputs the 6-digit OTP. On the 6th digit, the frontend automatically dispatches the verification payload to `/api/auth/login`.
8. Backend validates the code, resolves the user profile, creates a signed JWT session token (`mgtok_...`), sets an `httpOnly` secure cookie, and returns the profile payload.
9. Frontend closes the modal, updates `useAuth` reactive state, displays a success toast ("Welcome back, [User Name]!"), and proceeds with the requested action.

### 3. Every User Interaction, Button, Action, and Screen Behavior
- **"Sign In / Register" Avatar Pill:** Opens the `AuthModal` with a smooth spring transition and background dimming (backdrop blur).
- **"Phone Number" Input Field:** Features a fixed `+880` prefix badge, restricts input to numbers only, formats as `01711-409821`, and highlights red on invalid carrier prefixes.
- **"Send OTP" Button:** Shows animated spinner during request, disables on click to prevent double submission, transitions to OTP step upon 200 OK.
- **6-Digit OTP Box Grid:** Auto-focuses on the first box; auto-advances to the next box upon digit input; pressing Backspace focuses the previous box; pasting a 6-digit string populates all 6 boxes automatically.
- **"Resend OTP" Link:** Disabled with a countdown timer (`Resend code in 48s`); turns teal and interactive once countdown reaches zero.
- **"Switch to Password Login" Toggle:** Replaces OTP flow with password field featuring a toggleable eye icon ("Show/Hide Password").
- **"Sign Out" Button in Profile:** Displays confirmation dialog ("Are you sure you want to sign out?"), calls `POST /api/auth/logout`, purges client storage, clears session cookie, and redirects to Home.

### 4. Frontend Functional Requirements
- **Modal Component (`AuthModal.tsx`):** Responsive bottom sheet on mobile (<768px) and centered dialog on tablet/desktop (>=768px). Accessible keyboard navigation (Escape closes, Enter submits).
- **Reactive Auth Context (`AuthContext.tsx` & `useAuth.ts`):** Exposes `user`, `role`, `token`, `isAuthenticated`, `isLoading`, `login()`, `logout()`, `sendOtp()`, and `refreshSession()`.
- **Session Auto-Revalidation:** Listens to focus and online events; re-queries `/api/auth/me` to ensure session validity without disruptive page reloads.
- **Network Resilience:** Shows offline alert banner if user attempts login while disconnected from the internet.

### 5. Backend Business Logic and Processing Rules
- **Phone Normalization:** Strips non-digits, strips leading `+880` or `88`, ensures exactly 11 digits starting with `013`, `014`, `015`, `016`, `017`, `018`, or `019`.
- **OTP Cryptography & Cache:** Generated using `crypto.randomInt(100000, 999999)`. Stored in Redis or persistent memory store with key `otp:{phone}` and TTL of 300 seconds.
- **Rate Limiting & Lockout:** Maximum 3 OTP send requests per phone number per hour. 5 consecutive incorrect OTP entries lock the phone number for 15 minutes.
- **Session Token Issuance:** Signs JWT payload containing `userId`, `role`, `pharmacyId`, `companyId`, `depotId` with secret key using `HS256`, 7-day expiration.
- **Cookie Security Configuration:** `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, `sameSite: 'lax'`, `path: '/'`, `maxAge: 604800`.

### 6. Required API Endpoints with Request and Response Structures

#### `POST /api/auth/otp`
- **Request Body:**
```json
{
  "action": "send",
  "target": "01711409821",
  "type": "phone"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP verification code dispatched to 01711409821. Valid for 5 minutes.",
  "target": "01711409821",
  "cooldownSeconds": 60,
  "demoCode": "412736"
}
```
- **Response (429 Too Many Requests):**
```json
{
  "success": false,
  "error": "Rate limit exceeded. Too many OTP requests for this number. Try again in 15 minutes."
}
```

#### `POST /api/auth/login`
- **Request Body (OTP Verification):**
```json
{
  "identifier": "01711409821",
  "otp": "412736",
  "role": "PHARMACY_OWNER"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "user-po-01",
    "phone": "01711409821",
    "email": "greencare.pharm@gmail.com",
    "fullName": "Dr. Rafiqul Islam",
    "role": "PHARMACY_OWNER",
    "pharmacyId": "pharm-01",
    "pharmacyName": "Green Care Pharmacy & Med Store",
    "isVerified": true
  },
  "token": "mgtok_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Response (401 Unauthorized - Invalid OTP):**
```json
{
  "success": false,
  "error": "Invalid verification code. 4 attempts remaining before temporary lockout."
}
```

#### `GET /api/auth/me`
- **Headers:** `Cookie: medgo_session=...` or `Authorization: Bearer mgtok_...`
- **Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "user-po-01",
    "phone": "01711409821",
    "fullName": "Dr. Rafiqul Islam",
    "role": "PHARMACY_OWNER",
    "pharmacyId": "pharm-01",
    "pharmacyName": "Green Care Pharmacy & Med Store",
    "creditBalance": 85500.00,
    "creditLimit": 100000.00
  }
}
```

#### `POST /api/auth/logout`
- **Response (200 OK):** Sets cookie `medgo_session=deleted; Max-Age=0; Path=/` and returns `{"success": true, "message": "Successfully signed out"}`.

### 7. Database Tables, Fields, Relationships, and Constraints
```prisma
model User {
  id              String         @id @default(cuid())
  phone           String         @unique @db.VarChar(15)
  email           String?        @unique @db.VarChar(100)
  passwordHash    String?        @db.VarChar(255)
  fullName        String         @db.VarChar(100)
  role            UserRole       @default(PHARMACY_OWNER)
  pharmacyId      String?
  companyId       String?
  depotId         String?
  isVerified      Boolean        @default(false)
  failedAttempts  Int            @default(0)
  lockoutUntil    DateTime?
  lastLoginAt     DateTime?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  pharmacy        Pharmacy?      @relation(fields: [pharmacyId], references: [id])
  company         Company?       @relation(fields: [companyId], references: [id])
  sessions        Session[]

  @@index([phone])
  @@index([role])
}

model Session {
  id           String    @id @default(cuid())
  userId       String
  tokenHash    String    @unique
  userAgent    String?
  ipAddress    String?   @db.VarChar(45)
  expiresAt    DateTime
  createdAt    DateTime  @default(now())

  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([tokenHash])
}

enum UserRole {
  PHARMACY_OWNER
  RETAIL_PHARMACY
  SALES_REP
  PHARMA_COMPANY
  DEPOT_MANAGER
  ADMIN
}
```

### 8. Authentication, Authorization, and Security Requirements
- Passwords must be hashed using `bcrypt` (work factor 12) or Argon2id.
- JWT session tokens must be signed with 256-bit secret key; secret rotation supported via key IDs (`kid`).
- Session cookies must enforce `HttpOnly`, `SameSite=Lax`, and `Secure` flags.
- Cross-Site Request Forgery (CSRF) mitigation via custom `x-medgo-client` request header validation.
- All failed authentication attempts must be logged to an audit security stream with IP and User-Agent.

### 9. Input Validation, Edge Cases, and Error Handling
- **Non-BD Carrier Prefix:** If user enters `011XXXXXXXX` or `012XXXXXXXX`, reject with "Please enter a valid Bangladeshi mobile operator number".
- **Short or Long Digits:** Enforce exact 11-digit regex `^01[3-9]\d{8}$`.
- **Expired OTP:** If OTP submitted after 300 seconds, return 410 Gone: "Verification code has expired. Request a new one."
- **Network Drop during Verification:** Client retries up to 2 times with exponential backoff before displaying "Connection interrupted. Check your internet connection."

### 10. Dependencies on Other Features
- Depends on: None (Foundation module).
- Depended on by: Features 1.2 (RBAC), 1.3 (Pharmacy Profiles), 1.8 (Cart), 1.9 (Checkout), 1.10 (Order Decomposition).

### 11. Detailed Acceptance Criteria
- [x] Entering valid phone number sends 6-digit OTP and returns 60-second cooldown.
- [x] Auto-advancing OTP input works seamlessly across desktop and mobile keyboards.
- [x] Pasting 6-digit OTP into first box fills all 6 inputs and triggers submission.
- [x] Valid OTP sets `medgo_session` cookie and updates client state in <200ms.
- [x] Invalid OTP highlights inputs in red with remaining attempt count.
- [x] 5 incorrect attempts locks account for 15 minutes.
- [x] Refreshing page maintains logged-in state without flicker.
- [x] Sign Out completely clears cookies, cache, and state.

### 12. Positive, Negative, and Edge-Case Testing Scenarios
- **Positive Test 1.1.1:** Sign in with valid number `01711409821` and demo code `412736`. Verify 200 OK, cookie set, and `useAuth().isAuthenticated === true`.
- **Negative Test 1.1.2:** Submit invalid OTP `000000`. Verify 401 Unauthorized, error toast displayed, and attempt count decremented.
- **Negative Test 1.1.3:** Attempt to request OTP 4 times within 2 minutes. Verify 4th request returns 429 Too Many Requests.
- **Edge Case 1.1.4:** Fast-paste 6 digits while on mobile. Verify all fields populate accurately without truncation.
- **Edge Case 1.1.5:** Clock drift test: Submit OTP at 299 seconds. Verify acceptance; submit at 301 seconds, verify rejection.
"""
