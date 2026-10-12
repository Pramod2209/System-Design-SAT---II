const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const productRoutes = require("./routes/product.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const deliveryRoutes = require("./routes/delivery.routes");
const { resetStore } = require("./controllers/delivery.controller");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// API Root / Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "HEALTHY",
    timestamp: new Date().toISOString(),
    service: "Quick-Commerce Food & Grocery API",
    version: "2.0.0"
  });
});

// Admin Reset
app.post("/api/admin/reset", resetStore);

// Mount Modular Routes
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/deliveries", deliveryRoutes);

// Informative landing page
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Food & Grocery Quick-Commerce Platform - Round 2 REST API",
    status: "Running",
    endpoints: {
      "1. Product Search": "GET /api/products/search?q=milk",
      "2. Nearby Inventory": "GET /api/inventory/nearby?productId=P101",
      "3. Add Product to Cart": "POST /api/cart/items (Body: { userId, productId, quantity })",
      "4. Place Order": "POST /api/orders (Body: { userId })",
      "5. Delivery Partner Assignment": "Automatic upon successful POST /api/orders",
      "6. Delivery Status": "GET /api/deliveries/:deliveryId/status",
      "Demo: Advance Delivery": "POST /api/deliveries/:deliveryId/advance",
      "Demo: Reset Store": "POST /api/admin/reset"
    }
  });
});

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: `Resource '${req.method} ${req.originalUrl}' not found on this server.`
  });
});

// Centralized Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.name || "INTERNAL_SERVER_ERROR",
    message: err.message || "An unexpected server error occurred."
  });
});

// Start Server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Quick-Commerce Backend running on http://localhost:${PORT}`);
    console.log(`📡 Round 2 REST API Endpoints active`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
