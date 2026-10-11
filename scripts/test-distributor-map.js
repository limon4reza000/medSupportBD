/**
 * Automated Test Suite for Map-Based Nearby Distributor & Medicine Inventory Finder
 * Tests Haversine calculations, nearby API radius filtering, medicine stock searches,
 * road routing, live vehicle tracking, and B2B checkout integration.
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function runTests() {
  console.log("==================================================================");
  console.log("🗺️ RUNNING NEARBY DISTRIBUTOR & MAP INVENTORY TEST SUITE");
  console.log("==================================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = "") {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (details) console.log(`   └─ ${details}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (details) console.error(`   └─ ${details}`);
    }
  }

  // TEST 1: Nearby distributors within default 20 km radius
  try {
    const res = await fetch(`${BASE_URL}/api/distributors/nearby?lat=23.7465&lng=90.3760&radiusKm=20`);
    const data = await res.json();
    assert(
      res.ok && data.success && Array.isArray(data.distributors) && data.distributors.length >= 6,
      "API: GET /api/distributors/nearby returns verified depots within 20km",
      `Found ${data.totalFound} depots. Nearest: ${data.distributors[0]?.distributor?.name} (${data.distributors[0]?.distanceRoadKm} km by road)`
    );
  } catch (err) {
    assert(false, "API: GET /api/distributors/nearby", err.message);
  }

  // TEST 2: Radius filtering (strict 5 km radius)
  try {
    const res = await fetch(`${BASE_URL}/api/distributors/nearby?lat=23.7465&lng=90.3760&radiusKm=5`);
    const data = await res.json();
    const allWithin5km = data.distributors.every((d) => d.distanceStraightKm <= 5.0);
    assert(
      res.ok && data.success && data.distributors.length > 0 && allWithin5km,
      "Distance Filtering: Strict 5 km radius correctly excludes distant depots",
      `Filtered to ${data.totalFound} depots all <= 5.0 km straight distance`
    );
  } catch (err) {
    assert(false, "Distance Filtering: 5 km radius", err.message);
  }

  // TEST 3: Medicine-specific inventory search across nearby depots (Napa Extra)
  try {
    const res = await fetch(`${BASE_URL}/api/distributors/nearby?lat=23.7465&lng=90.3760&q=napa&sortBy=price`);
    const data = await res.json();
    const first = data.distributors[0];
    const stock = first?.targetMedicineStock;
    assert(
      res.ok && stock && stock.brandName.toLowerCase().includes("napa") && stock.tradePricePerBox > 0 && stock.availableStockBoxes > 0,
      "Medicine Inventory Search: Accurately checks medicine stock across nearby depots",
      `Target: ${stock?.brandName} (${stock?.strength}) | Stock: ${stock?.availableStockBoxes} Boxes | Trade: ৳${stock?.tradePricePerBox}/Box`
    );
  } catch (err) {
    assert(false, "Medicine Inventory Search", err.message);
  }

  // TEST 4: Sorting by lowest trade price
  try {
    const res = await fetch(`${BASE_URL}/api/distributors/nearby?lat=23.7465&lng=90.3760&q=seclo&sortBy=price`);
    const data = await res.json();
    let isSortedByPrice = true;
    for (let i = 0; i < data.distributors.length - 1; i++) {
      const priceA = data.distributors[i].targetMedicineStock?.tradePricePerBox || 0;
      const priceB = data.distributors[i + 1].targetMedicineStock?.tradePricePerBox || 0;
      if (priceA > priceB) {
        isSortedByPrice = false;
        break;
      }
    }
    assert(
      res.ok && isSortedByPrice,
      "Sorting: 'sortBy=price' correctly orders depots by lowest trade price first",
      `First depot price: ৳${data.distributors[0]?.targetMedicineStock?.tradePricePerBox}/Box`
    );
  } catch (err) {
    assert(false, "Sorting: sortBy=price", err.message);
  }

  // TEST 5: Sorting by nearest road distance
  try {
    const res = await fetch(`${BASE_URL}/api/distributors/nearby?lat=23.7465&lng=90.3760&sortBy=distance`);
    const data = await res.json();
    let isSortedByDistance = true;
    for (let i = 0; i < data.distributors.length - 1; i++) {
      if (data.distributors[i].distanceRoadKm > data.distributors[i + 1].distanceRoadKm) {
        isSortedByDistance = false;
        break;
      }
    }
    assert(
      res.ok && isSortedByDistance,
      "Sorting: 'sortBy=distance' correctly orders depots by nearest road distance",
      `Nearest: ${data.distributors[0]?.distanceRoadKm} km (${data.distributors[0]?.distributor?.name})`
    );
  } catch (err) {
    assert(false, "Sorting: sortBy=distance", err.message);
  }

  // TEST 6: Distributor-specific full inventory endpoint
  try {
    const res = await fetch(`${BASE_URL}/api/distributors/depot-dhk-01/inventory?limit=10`);
    const data = await res.json();
    assert(
      res.ok && data.success && Array.isArray(data.inventory) && data.inventory.length === 10,
      "API: GET /api/distributors/[id]/inventory returns authorized catalog with batch metrics",
      `Retrieved ${data.totalItems} items. First: ${data.inventory[0]?.brandName} (Stock: ${data.inventory[0]?.availableStockBoxes} boxes)`
    );
  } catch (err) {
    assert(false, "API: GET /api/distributors/[id]/inventory", err.message);
  }

  // TEST 7: Road routing calculation service (OSRM / Road model)
  try {
    const res = await fetch(`${BASE_URL}/api/distributors/route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startLat: 23.7465,
        startLng: 90.3760,
        destLat: 23.76442,
        destLng: 90.38924,
      }),
    });
    const data = await res.json();
    assert(
      res.ok && data.success && data.route && data.route.coordinates?.length > 1 && data.route.distanceKm > 0,
      "Routing Service: POST /api/distributors/route calculates road polyline coordinates",
      `Distance: ${data.route?.distanceKm} km | Drive Time: ${data.route?.durationMinutes} mins | Source: ${data.route?.source}`
    );
  } catch (err) {
    assert(false, "Routing Service", err.message);
  }

  // TEST 8: Live delivery courier tracking endpoint
  try {
    const res = await fetch(`${BASE_URL}/api/distributors/live-tracking`);
    const data = await res.json();
    assert(
      res.ok && data.success && Array.isArray(data.vehicles) && data.vehicles.length >= 1,
      "Live Delivery Tracking: GET /api/distributors/live-tracking returns authorized couriers in transit",
      `Active Vehicles: ${data.totalActive}. First: ${data.vehicles[0]?.vehicleNumber} (Driver: ${data.vehicles[0]?.driverName})`
    );
  } catch (err) {
    assert(false, "Live Delivery Tracking", err.message);
  }

  // TEST 9: Delivery coverage zone verification
  try {
    const res = await fetch(`${BASE_URL}/api/distributors/nearby?lat=23.7465&lng=90.3760&radiusKm=50`);
    const data = await res.json();
    const nearest = data.distributors[0];
    assert(
      res.ok && nearest.isWithinDeliveryZone === true && nearest.distributor.coverageRadiusKm >= 20,
      "Coverage Engine: Correctly flags pharmacy within distributor's authorized service zone",
      `Depot: ${nearest.distributor.name} (Coverage Radius: ${nearest.distributor.coverageRadiusKm} km)`
    );
  } catch (err) {
    assert(false, "Coverage Engine", err.message);
  }

  // TEST 10: Full platform integration test regression check
  try {
    const res = await fetch(`${BASE_URL}/api/orders/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pharmacyId: "pharm-01",
        depotId: "depot-dhk-01",
        salesRepId: "user-sr-01",
        items: [{ medicineId: "med-01", orderedUnit: "BOX", orderedQty: 2 }],
        deliveryNotes: "Dispatched from nearby map order",
      }),
    });
    const data = await res.json();
    assert(
      res.ok && data.success && data.data?.orderNumber && data.data?.netPayableAmount > 0,
      "Checkout Integration: Order created directly from nearby distributor inventory",
      `Order #${data.data.orderNumber} | Net: ৳${data.data.netPayableAmount} | Billed Loose Pieces: ${data.data.totalLoosePieces}`
    );
  } catch (err) {
    assert(false, "Checkout Integration", err.message);
  }

  console.log("\n==================================================================");
  console.log(`🏁 TEST RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}% SUCCESS RATE)`);
  console.log("==================================================================\n");

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
