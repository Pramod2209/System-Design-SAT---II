const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory.controller");

/**
 * 2. NEARBY INVENTORY
 * GET /api/inventory/nearby?productId=P101
 */
router.get("/nearby", inventoryController.getNearbyInventory);

/**
 * GET /api/inventory (Full inventory overview)
 */
router.get("/", inventoryController.getAllInventory);

module.exports = router;
