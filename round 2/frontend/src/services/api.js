/**
 * Frontend API Service Layer
 * Interacts with Round 2 Express REST API Backend
 */

const BASE_URL = "/api";

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  };

  const startTime = performance.now();
  try {
    const res = await fetch(url, config);
    const durationMs = Math.round(performance.now() - startTime);
    let data = null;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      durationMs,
      data
    };
  } catch (error) {
    const durationMs = Math.round(performance.now() - startTime);
    return {
      ok: false,
      status: 0,
      statusText: "Network Error",
      durationMs,
      data: { error: "NETWORK_ERROR", message: error.message }
    };
  }
}

export const api = {
  // 1. Product Search: GET /api/products/search?q=milk
  searchProducts: async (query = "") => {
    const endpoint = query ? `/products/search?q=${encodeURIComponent(query)}` : "/products";
    return request(endpoint, { method: "GET" });
  },

  // 2. Nearby Inventory: GET /api/inventory/nearby?productId=P101
  getNearbyInventory: async (productId) => {
    return request(`/inventory/nearby?productId=${encodeURIComponent(productId)}`, { method: "GET" });
  },

  // 3. Add Product to Cart: POST /api/cart/items
  addToCart: async (userId, productId, quantity, mode = "add") => {
    return request("/cart/items", {
      method: "POST",
      body: JSON.stringify({ userId, productId, quantity, mode })
    });
  },

  // Get user's cart: GET /api/cart/:userId
  getCart: async (userId) => {
    return request(`/cart/${encodeURIComponent(userId)}`, { method: "GET" });
  },

  // Remove single item from cart: DELETE /api/cart/:userId/items/:productId
  removeFromCart: async (userId, productId) => {
    return request(`/cart/${encodeURIComponent(userId)}/items/${encodeURIComponent(productId)}`, {
      method: "DELETE"
    });
  },

  // Clear user cart: DELETE /api/cart/:userId
  clearCart: async (userId) => {
    return request(`/cart/${encodeURIComponent(userId)}`, { method: "DELETE" });
  },

  // 4. & 5. Place Order: POST /api/orders
  placeOrder: async (userId) => {
    return request("/orders", {
      method: "POST",
      body: JSON.stringify({ userId })
    });
  },

  // Get orders list: GET /api/orders?userId=:userId
  getOrders: async (userId) => {
    const endpoint = userId ? `/orders?userId=${encodeURIComponent(userId)}` : "/orders";
    return request(endpoint, { method: "GET" });
  },

  // Get single order: GET /api/orders/:orderId
  getOrderById: async (orderId) => {
    return request(`/orders/${encodeURIComponent(orderId)}`, { method: "GET" });
  },

  // 6. Delivery Status: GET /api/deliveries/:deliveryId/status
  getDeliveryStatus: async (deliveryId) => {
    return request(`/deliveries/${encodeURIComponent(deliveryId)}/status`, { method: "GET" });
  },

  // Advance delivery status step (Demo/Simulation)
  advanceDeliveryStatus: async (deliveryId) => {
    return request(`/deliveries/${encodeURIComponent(deliveryId)}/advance`, { method: "POST" });
  },

  // Reset store (Demo test helper)
  resetStore: async () => {
    return request("/admin/reset", { method: "POST" });
  }
};
