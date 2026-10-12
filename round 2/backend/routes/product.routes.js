const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

/**
 * 1. PRODUCT SEARCH
 * GET /api/products/search?q=milk
 */
router.get("/search", productController.searchProducts);

/**
 * GET /api/products
 * Returns all products or filtered
 */
router.get("/", productController.searchProducts);

/**
 * GET /api/products/:productId
 */
router.get("/:productId", productController.getProductById);

module.exports = router;
