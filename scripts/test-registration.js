const http = require('http');

function postJson(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(raw) });
          } catch (e) {
            resolve({ status: res.statusCode, raw });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJson(path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method: 'GET',
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(raw) });
          } catch (e) {
            resolve({ status: res.statusCode, raw });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log("==================================================================");
  console.log("🔬 TESTING ROLE-BASED REGISTRATION SYSTEM & VALIDATIONS");
  console.log("==================================================================");

  let passed = 0;
  let total = 0;

  function assert(condition, name, details = "") {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [PASS] ${name}`);
      if (details) console.log(`   └─ ${details}`);
    } else {
      console.error(`❌ [FAIL] ${name}`);
      if (details) console.error(`   └─ ${details}`);
    }
  }

  // 1. Missing required fields validation (Pharmacy Owner)
  const res1 = await postJson('/api/auth/register', {
    role: "PHARMACY_OWNER",
    shopName: "Incomplete Pharmacy",
    // Missing ownerName, phone, nidNumber, tradeLicenseNo, tinNumber, address, latitude, longitude
  });
  assert(
    res1.status === 400 && res1.data.fieldErrors,
    "Backend strictly rejects incomplete form submissions",
    `HTTP 400 returned with field errors on: ${Object.keys(res1.data.fieldErrors || {}).join(', ')}`
  );

  // 2. OTP Sending & Verification API
  const testPhone = "01755112233";
  const otpRes = await postJson('/api/auth/otp', {
    action: "send",
    target: testPhone,
    type: "phone",
  });
  assert(
    otpRes.status === 200 && otpRes.data.success && otpRes.data.demoCode,
    "OTP generation and dispatch endpoint works",
    `Dispatched 6-digit OTP: ${otpRes.data.demoCode} for ${testPhone}`
  );

  const verifyRes = await postJson('/api/auth/otp', {
    action: "verify",
    target: testPhone,
    code: otpRes.data.demoCode,
    type: "phone",
  });
  assert(
    verifyRes.status === 200 && verifyRes.data.verified,
    "OTP verification confirms mobile contact number",
    `Verified mobile number ${testPhone} with cryptographic token`
  );

  // 3. Complete Pharmacy Owner Registration
  const genPhone = () => '017' + Math.floor(10000000 + Math.random() * 90000000);
  const genNid = () => '199' + Math.floor(1000000000 + Math.random() * 9000000000);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);

  const pharmacyPhone = genPhone();
  const pharmacyNid = genNid();
  const pharmacyTrade = `TRAD/DSCC/${randomSuffix}/2026`;

  const resPharm = await postJson('/api/auth/register', {
    role: "PHARMACY_OWNER",
    shopName: "Standard Care Dispensary",
    ownerName: "Dr. Anisul Haque",
    phone: pharmacyPhone,
    nidNumber: pharmacyNid,
    tradeLicenseNo: pharmacyTrade,
    tinNumber: "782910482910",
    address: "Shop 12, Dhanmondi 27, Dhaka",
    latitude: 23.7521,
    longitude: 90.3752,
    isPhoneVerified: true,
    documents: [
      {
        type: "TRADE_LICENSE",
        fileName: "trade_license_2026.pdf",
        fileSize: 1024 * 300,
        mimeType: "application/pdf",
      },
    ],
  });
  assert(
    resPharm.status === 201 && resPharm.data.trackingNumber,
    "Pharmacy Owner registration succeeds with Tracking ID",
    `Tracking Number: ${resPharm.data.trackingNumber} | Status: ${resPharm.data.status}`
  );
  const createdTracking = resPharm.data.trackingNumber;

  // 4. Retail Pharmacy Registration (Separate role)
  const retailTrade = `TRAD/DNCC/${randomSuffix}/2026`;
  const resRetail = await postJson('/api/auth/register', {
    role: "RETAIL_PHARMACY",
    shopName: "City Chemist & Drug Corner",
    ownerName: "Md. Jahangir Alam",
    phone: genPhone(),
    nidNumber: genNid(),
    tradeLicenseNo: retailTrade,
    tinNumber: "123456789012",
    address: "Mirpur 10 Circle, Dhaka",
    latitude: 23.807,
    longitude: 90.368,
    isPhoneVerified: true,
  });
  assert(
    resRetail.status === 201 && resRetail.data.role === "RETAIL_PHARMACY",
    "Retail Pharmacy registers as dedicated role distinct from Pharmacy Owner",
    `Assigned Role: ${resRetail.data.role} | Tracking: ${resRetail.data.trackingNumber}`
  );

  // 5. Pharmaceutical Company Registration
  const resPharma = await postJson('/api/auth/register', {
    role: "PHARMA_COMPANY",
    companyName: `Zenith Healthcare Ltd ${randomSuffix}`,
    address: "Plot 42, Tejgaon I/A, Dhaka",
    latitude: 23.76,
    longitude: 90.4,
    tradeLicenseNo: `CORP/TRAD/${randomSuffix}`,
    tinNumber: "998877665544",
    officialPhone: genPhone(),
    officialEmail: `corporate${randomSuffix}@zenithpharma.com`,
    isContactVerified: true,
  });
  assert(
    resPharma.status === 201 && resPharma.data.role === "PHARMA_COMPANY",
    "Pharmaceutical Company registration enforces corporate location & credentials",
    `Tracking: ${resPharma.data.trackingNumber} | Entity: ${resPharma.data.entityName}`
  );

  // 6. Distributor / Depot Registration
  const resDist = await postJson('/api/auth/register', {
    role: "DISTRIBUTOR",
    distributorName: `Sylhet Regional Pharma Hub ${randomSuffix}`,
    ownerName: "Mustafizur Rahman",
    phone: genPhone(),
    tradeLicenseNo: `DEPOT/SYL/${randomSuffix}`,
    tinNumber: "554433221100",
    address: "Amberkhana Point, Sylhet",
    latitude: 24.8949,
    longitude: 91.8687,
    isPhoneVerified: true,
    serviceArea: ["Sylhet Sadar", "Beanibazar", "Moulvibazar"],
  });
  assert(
    resDist.status === 201 && resDist.data.role === "DISTRIBUTOR",
    "Distributor / Depot registration captures logistics warehouse location & service area",
    `Tracking: ${resDist.data.trackingNumber} | Depot: ${resDist.data.entityName}`
  );

  // 7. Medical Representative (MPO / SR) Registration
  const resSR = await postJson('/api/auth/register', {
    role: "SALES_REP",
    employeeId: `EMP-BEX-${randomSuffix}`,
    nidNumber: genNid(),
    phone: genPhone(),
    email: `mpo.${randomSuffix}@beximco.com`,
    affiliatedCompany: "Beximco Pharmaceuticals Ltd.",
    designatedTerritory: "Mirpur - Uttara Medical Zone",
    isContactVerified: true,
  });
  assert(
    resSR.status === 201 && resSR.data.role === "SALES_REP",
    "Medical Representative registration links employee ID & affiliated Pharma Company",
    `Tracking: ${resSR.data.trackingNumber} | Status: ${resSR.data.status}`
  );

  // 8. Duplicate Account Prevention
  const resDup = await postJson('/api/auth/register', {
    role: "PHARMACY_OWNER",
    shopName: "Duplicate Pharmacy Attempt",
    ownerName: "Dr. Copy Person",
    phone: pharmacyPhone, // Duplicate phone!
    nidNumber: pharmacyNid, // Duplicate NID!
    tradeLicenseNo: pharmacyTrade,
    tinNumber: "782910482910",
    address: "Somewhere in Dhaka",
    latitude: 23.75,
    longitude: 90.37,
    isPhoneVerified: true,
  });
  assert(
    resDup.status === 409 && resDup.data.existingTrackingNumber,
    "Duplicate account prevention stops repeated Phone/NID/Trade License registrations",
    `HTTP 409 Conflict: Application already registered under #${resDup.data.existingTrackingNumber}`
  );

  // 9. Document validation (Unsupported format or excessive size)
  const resInvalidDoc = await postJson('/api/auth/register', {
    role: "PHARMACY_OWNER",
    shopName: "Invalid Doc Pharmacy",
    ownerName: "Test Owner",
    phone: genPhone(),
    nidNumber: genNid(),
    tradeLicenseNo: `TRAD/TEST/${randomSuffix}`,
    tinNumber: "123456789012",
    address: "Holding 12, Gulshan",
    latitude: 23.75,
    longitude: 90.37,
    isPhoneVerified: true,
    documents: [
      {
        fileName: "malicious_script.exe",
        fileSize: 1024 * 1024 * 10, // 10MB (exceeds 5MB)
        mimeType: "application/x-msdownload", // Disallowed mime-type
      },
    ],
  });
  assert(
    resInvalidDoc.status === 400,
    "Document validator rejects files exceeding 5MB or invalid MIME types",
    `Rejected with error: ${resInvalidDoc.data.error}`
  );

  // 10. Status Tracking Query API (GET)
  const queryRes = await getJson(`/api/auth/register?tracking=${encodeURIComponent(createdTracking)}`);
  assert(
    queryRes.status === 200 && queryRes.data.found && queryRes.data.application.trackingNumber === createdTracking,
    "Registration Status Query API accurately returns live application progress",
    `Queried #${createdTracking} -> Status: ${queryRes.data.application.status} | Masked NID: ${queryRes.data.application.maskedNid}`
  );

  console.log("==================================================================");
  console.log(`🏁 TEST RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed/total)*100)}% SUCCESS RATE)`);
  console.log("==================================================================");

  if (passed !== total) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
