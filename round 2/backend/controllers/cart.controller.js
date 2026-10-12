const store = require("../data/store");

/**
 * 3. ADD PRODUCT TO CART CONTROLLER
 * POST /api/cart/items
 *
 * Request Body:
 * {
 *   "userId": "U101",
 *   "productId": "P101",
 *   "quantity": 2,
 *   "mode": "add" | "set" (optional, default: "add")
 * }
 *
 * Requirements:
 * - Validate all input fields.
 * - Allow users to add products to their carts.
 * - Support quantity updates.
 * - Reject invalid quantities.
 * - Return suitable HTTP status codes (201 Created / 200 OK / 400 Bad Request / 404 Not Found / 409 Conflict).
 */
const addItemToCart = (req, res, next) => {
  try {
    const { userId, productId, quantity, mode = "add" } = req.body;

    // Field existence validation
    if (!userId || typeof userId !== "string" || !userId.trim()) {
      return res.status(400).json({
        error: "INVALID_USER_ID",
        message: "Missing or invalid 'userId'. Must be a non-empty string."
      });
    }

    if (!productId || typeof productId !== "string" || !productId.trim()) {
      return res.status(400).json({
        error: "INVALID_PRODUCT_ID",
        message: "Missing or invalid 'productId'. Must be a non-empty string."
      });
    }

    // Quantity validation: reject invalid quantities
    if (quantity === undefined || quantity === null || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        error: "INVALID_QUANTITY",
        message: "Quantity must be a positive integer greater than zero.",
        providedQuantity: quantity
      });
    }

    const trimmedUserId = userId.trim();
    const trimmedProductId = productId.trim();

    // Check if product exists in catalog
    const product = store.getProductById(trimmedProductId);
    if (!product) {
      return res.status(404).json({
        error: "PRODUCT_NOT_FOUND",
        message: `Product with ID '${trimmedProductId}' does not exist.`
      });
    }

    const currentCart = store.getCart(trimmedUserId);
    const existingItem = currentCart.items.find(i => i.productId === trimmedProductId);
    const isNewItem = !existingItem;

    const result = store.addToCart(trimmedUserId, trimmedProductId, quantity, mode === "set");

    if (result.error === "STOCK_LIMIT_EXCEEDED") {
      return res.status(409).json({
        error: "INSUFFICIENT_STOCK",
        message: result.message,
        availableQuantity: result.availableQuantity,
        requestedQuantity: result.requestedQuantity
      });
    }

    if (!result.success) {
      return res.status(400).json({
        error: result.error,
        message: result.message
      });
    }

    // 201 Created if newly added, 200 OK if quantity updated
    const statusCode = isNewItem ? 201 : 200;

    return res.status(statusCode).json({
      message: isNewItem ? "Product added to cart successfully" : "Cart item quantity updated successfully",
      cart: result.cart
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cart/:userId
 */
const getCartByUserId = (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId || !userId.trim()) {
      return res.status(400).json({
        error: "INVALID_USER_ID",
        message: "Parameter 'userId' is required."
      });
    }

    const cart = store.getCart(userId.trim());
    return res.status(200).json(cart);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/cart/:userId/items/:productId
 */
const removeItemFromCart = (req, res, next) => {
  try {
    const { userId, productId } = req.params;
    const result = store.removeFromCart(userId.trim(), productId.trim());
    return res.status(200).json({
      message: `Product ${productId} removed from cart.`,
      cart: result.cart
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/cart/:userId
 */
const clearUserCart = (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = store.clearCart(userId.trim());
    return res.status(200).json({
      message: "Cart cleared successfully.",
      cart: result.cart
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addItemToCart,
  getCartByUserId,
  removeItemFromCart,
  clearUserCart
};
