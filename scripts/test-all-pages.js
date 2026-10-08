const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const routes = [
  "/",
  "/dashboard",
  "/products",
  "/products/med-01",
  "/cart",
  "/my-orders",
  "/order-history",
  "/orders/ord-901",
  "/ai-order",
  "/ai-insights",
  "/credit",
  "/transactions",
  "/trade-offers",
  "/inventory",
  "/inventory/batches",
  "/inventory/near-expiry",
  "/inventory/adjustments",
  "/inventory/returns",
  "/inventory/stock-movement",
  "/pharmacies",
  "/sales",
  "/sales/pharmacies",
  "/sales/pharmacies/pharm-01",
  "/depot",
  "/reports",
  "/notifications",
  "/collections",
  "/profile",
  "/settings",
  "/security",
  "/support",
  "/users",
  "/admin",
  "/login",
  "/register",
  "/forgot-password"
];

async function checkAllRoutes() {
  console.log("==================================================================");
  console.log(`🔍 SCANNING ALL ${routes.length} APP ROUTES FOR RUNTIME ERRORS`);
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;
  const errors = [];

  for (const route of routes) {
    try {
      const res = await fetch(`${BASE_URL}${route}`);
      const text = await res.text();

      const hasNextError = text.includes("Unhandled Runtime Error") || 
                           text.includes("Error: ") ||
                           text.includes("Rendered more hooks") ||
                           text.includes("Cannot read property") ||
                           text.includes("is not defined");

      if (res.ok && !hasNextError) {
        console.log(`✅ [200 OK] ${route}`);
        passed++;
      } else {
        console.error(`❌ [ERROR ${res.status}] ${route}`);
        errors.push({ route, status: res.status, snippet: text.slice(0, 300) });
        failed++;
      }
    } catch (err) {
      console.error(`❌ [NETWORK FAIL] ${route} - ${err.message}`);
      errors.push({ route, status: "NETWORK_ERR", snippet: err.message });
      failed++;
    }
  }

  console.log("\n==================================================================");
  console.log(`🏁 SCAN COMPLETE: ${passed}/${routes.length} ROUTES HEALTHY, ${failed} FAILED`);
  console.log("==================================================================\n");

  if (errors.length > 0) {
    console.log("DETAILS OF FAILED ROUTES:");
    errors.forEach(e => console.log(`- ${e.route} (${e.status}): ${e.snippet.slice(0, 150)}...`));
  }
}

checkAllRoutes();
