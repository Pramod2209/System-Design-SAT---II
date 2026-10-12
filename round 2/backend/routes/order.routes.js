const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

/**
 * 4. PLACE ORDER & 5. DELIVERY PARTNER ASSIGNMENT
 * POST /api/orders
 */
router.post("/", orderController.placeOrder);

/**
 * GET all orders (optional ?userId=U101)
 * GET /api/orders
 */
router.get("/", orderController.getOrders);

/**
 * GET single order details
 * GET /api/orders/:orderId
 */
router.get("/:orderId", orderController.getOrderById);

module.exports = router;
