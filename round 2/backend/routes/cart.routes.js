const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");

/**
 * 3. ADD PRODUCT TO CART
 * POST /api/cart/items
 */
router.post("/items", cartController.addItemToCart);

/**
 * GET user cart
 * GET /api/cart/:userId
 */
router.get("/:userId", cartController.getCartByUserId);

/**
 * Remove specific item from cart
 * DELETE /api/cart/:userId/items/:productId
 */
router.delete("/:userId/items/:productId", cartController.removeItemFromCart);

/**
 * Clear cart
 * DELETE /api/cart/:userId
 */
router.delete("/:userId", cartController.clearUserCart);

module.exports = router;
