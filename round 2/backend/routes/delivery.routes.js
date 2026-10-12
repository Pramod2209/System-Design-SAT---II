const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/delivery.controller");

/**
 * 6. DELIVERY STATUS
 * GET /api/deliveries/:deliveryId/status
 */
router.get("/:deliveryId/status", deliveryController.getDeliveryStatus);

/**
 * Advance delivery status (Demonstration / Simulation helper)
 * POST /api/deliveries/:deliveryId/advance
 */
router.post("/:deliveryId/advance", deliveryController.advanceDeliveryStatus);

module.exports = router;
