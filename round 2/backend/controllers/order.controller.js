const store = require("../data/store");

/**
 * 4. & 5. PLACE ORDER & DELIVERY PARTNER ASSIGNMENT CONTROLLER
 * POST /api/orders
 *
 * Request:
 * {
 *   "userId": "U101"
 * }
 *
 * Requirements:
 * - Verify that the cart is not empty (400 Bad Request).
 * - Validate inventory before confirming the order (409 Conflict).
 * - Reserve the required stock.
 * - Generate a unique order ID.
 * - Assign an available delivery partner.
 * - Generate a delivery ID.
 * - Associate the delivery with the order.
 * - Clear the cart after successful order placement.
 * - Return suitable HTTP status codes (201 Created).
 */
const placeOrder = (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId || typeof userId !== "string" || !userId.trim()) {
      return res.status(400).json({
        error: "INVALID_USER_ID",
        message: "Missing or invalid 'userId'. Must be a non-empty string (e.g., 'U101')."
      });
    }

    const trimmedUserId = userId.trim();

    // Call store placeOrder logic which atomically checks stock, reserves it,
    // generates order ID, assigns delivery partner, and clears cart
    const result = store.placeOrder(trimmedUserId);

    if (!result.success) {
      if (result.error === "EMPTY_CART") {
        return res.status(400).json({
          error: "EMPTY_CART",
          message: result.message
        });
      }

      if (result.error === "INSUFFICIENT_STOCK") {
        return res.status(409).json({
          error: "INSUFFICIENT_STOCK",
          message: result.message,
          productId: result.productId,
          productName: result.productName,
          requested: result.requested,
          available: result.available
        });
      }

      return res.status(result.statusCode || 400).json({
        error: result.error,
        message: result.message
      });
    }

    // 201 Created on successful order placement & partner assignment
    return res.status(201).json({
      message: result.message,
      order: result.order,
      delivery: result.delivery
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders (Optionally filter by ?userId=U101)
 */
const getOrders = (req, res, next) => {
  try {
    const { userId } = req.query;
    const orders = store.getAllOrders(userId);
    return res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/:orderId
 */
const getOrderById = (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = store.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        error: "ORDER_NOT_FOUND",
        message: `Order with ID '${orderId}' does not exist.`
      });
    }

    const delivery = store.getDeliveryStatus(order.deliveryId);

    return res.status(200).json({
      ...order,
      delivery
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  placeOrder,
  getOrders,
  getOrderById
};
