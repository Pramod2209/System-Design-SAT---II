/**
 * Automated Test Suite for Round 2 REST APIs
 * Food & Grocery Quick-Commerce Platform
 */

const http = require("http");

const BASE_URL = "http://localhost:5000";

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        "Content-Type": "application/json"
      }
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", chunk => { data += chunk; });
      res.on("end", () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("==================================================");
  console.log("🧪 RUNNING ROUND 2 REST API AUTOMATED TEST SUITE");
  console.log("==================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
    }
  }

  try {
    // Reset store before starting
    await request("POST", "/api/admin/reset");

    // 1. PRODUCT SEARCH
    console.log("--- 1. Testing Product Search ---");
    const searchRes = await request("GET", "/api/products/search?q=milk");
    assert(searchRes.status === 200, "GET /api/products/search?q=milk returns HTTP 200");
    assert(Array.isArray(searchRes.data), "Product search returns JSON array");
    assert(searchRes.data.length > 0, `Search finds ${searchRes.data.length} milk items`);
    assert(searchRes.data[0].productId && searchRes.data[0].name && searchRes.data[0].price, 
      "Product contains required fields: productId, name, price");

    const emptySearchRes = await request("GET", "/api/products/search?q=nonexistentproductname123");
    assert(emptySearchRes.status === 200, "Empty search query returns HTTP 200");
    assert(Array.isArray(emptySearchRes.data) && emptySearchRes.data.length === 0, 
      "Search returns empty array [] when no products match");

    // 2. NEARBY INVENTORY
    console.log("\n--- 2. Testing Nearby Inventory ---");
    const invRes = await request("GET", "/api/inventory/nearby?productId=P101");
    assert(invRes.status === 200, "GET /api/inventory/nearby?productId=P101 returns HTTP 200");
    assert(invRes.data.availableQuantity !== undefined, "Returns available quantity");
    assert(invRes.data.storeId !== undefined, "Returns store ID");
    assert(invRes.data.inStock === true, "Shows product in stock flag");

    const invNotFoundRes = await request("GET", "/api/inventory/nearby?productId=P9999");
    assert(invNotFoundRes.status === 404, "GET /api/inventory/nearby for unknown product returns HTTP 404 Not Found");

    // 3. ADD PRODUCT TO CART
    console.log("\n--- 3. Testing Add Product to Cart ---");
    const cartRes = await request("POST", "/api/cart/items", {
      userId: "U101",
      productId: "P101",
      quantity: 2
    });
    assert(cartRes.status === 201 || cartRes.status === 200, "POST /api/cart/items returns HTTP 201 Created");
    assert(cartRes.data.cart && cartRes.data.cart.items.length === 1, "Cart contains added item");
    assert(cartRes.data.cart.items[0].quantity === 2, "Cart item has correct quantity 2");

    // Add another item
    await request("POST", "/api/cart/items", {
      userId: "U101",
      productId: "P102",
      quantity: 1
    });

    // Test rejection of invalid quantity
    const badQtyRes = await request("POST", "/api/cart/items", {
      userId: "U101",
      productId: "P101",
      quantity: -5
    });
    assert(badQtyRes.status === 400, "Negative quantity returns HTTP 400 Bad Request");

    // Test missing fields
    const missingFieldRes = await request("POST", "/api/cart/items", {
      userId: "U101"
    });
    assert(missingFieldRes.status === 400, "Missing fields returns HTTP 400 Bad Request");

    // 4. PLACE ORDER & 5. DELIVERY PARTNER ASSIGNMENT
    console.log("\n--- 4. & 5. Testing Place Order & Delivery Assignment ---");
    const orderRes = await request("POST", "/api/orders", {
      userId: "U101"
    });
    assert(orderRes.status === 201, "POST /api/orders returns HTTP 201 Created");
    assert(orderRes.data.order && orderRes.data.order.orderId, "Order contains unique order ID");
    assert(orderRes.data.delivery && orderRes.data.delivery.deliveryId, "Order response includes delivery ID");
    assert(orderRes.data.delivery.partnerId && orderRes.data.delivery.partnerName, "Order assigns delivery partner");

    const orderId = orderRes.data.order.orderId;
    const deliveryId = orderRes.data.delivery.deliveryId;

    // Verify cart is cleared after order
    const clearedCartRes = await request("GET", "/api/cart/U101");
    assert(clearedCartRes.data.items.length === 0, "Cart is cleared after successful order placement");

    // Verify placing order with empty cart fails with 400
    const emptyOrderRes = await request("POST", "/api/orders", {
      userId: "U101"
    });
    assert(emptyOrderRes.status === 400, "Placing order with empty cart returns HTTP 400 Bad Request");

    // Verify stock was deducted
    const invAfterOrder = await request("GET", "/api/inventory/nearby?productId=P101");
    assert(invAfterOrder.data.availableQuantity === 23, "Inventory reserved: 25 - 2 = 23");

    // 6. DELIVERY STATUS
    console.log("\n--- 6. Testing Delivery Status ---");
    const deliveryStatusRes = await request("GET", `/api/deliveries/${deliveryId}/status`);
    assert(deliveryStatusRes.status === 200, "GET /api/deliveries/:deliveryId/status returns HTTP 200");
    assert(deliveryStatusRes.data.deliveryId === deliveryId, "Status response includes correct deliveryId");
    assert(deliveryStatusRes.data.orderId === orderId, "Status response includes correct orderId");
    assert(deliveryStatusRes.data.partnerId !== undefined, "Status response includes partnerId");
    assert(deliveryStatusRes.data.status === "ASSIGNED", "Initial status is ASSIGNED");

    // Invalid delivery ID returns 404
    const badDeliveryRes = await request("GET", "/api/deliveries/INVALID_DEL_9999/status");
    assert(badDeliveryRes.status === 404, "Invalid deliveryId returns HTTP 404 Not Found");

    // Test status transitions: ASSIGNED -> PICKED_UP -> OUT_FOR_DELIVERY -> DELIVERED
    const step1 = await request("POST", `/api/deliveries/${deliveryId}/advance`);
    assert(step1.data.status === "PICKED_UP", "Status transitioned to PICKED_UP");

    const step2 = await request("POST", `/api/deliveries/${deliveryId}/advance`);
    assert(step2.data.status === "OUT_FOR_DELIVERY", "Status transitioned to OUT_FOR_DELIVERY");

    const step3 = await request("POST", `/api/deliveries/${deliveryId}/advance`);
    assert(step3.data.status === "DELIVERED", "Status transitioned to DELIVERED");

    console.log("\n==================================================");
    console.log(`🎉 TEST SUMMARY: ${passed}/${total} PASSED!`);
    console.log("==================================================");
  } catch (err) {
    console.error("Test execution error:", err);
  }
}

runTests();
