const store = require("../data/store");

/**
 * 6. DELIVERY STATUS CONTROLLER
 * GET /api/deliveries/:deliveryId/status
 *
 * Requirements:
 * - Return delivery ID, order ID, partner ID, and status.
 * - Support statuses: ASSIGNED, PICKED_UP, OUT_FOR_DELIVERY, DELIVERED.
 * - Return 404 for an invalid delivery ID.
 */
const getDeliveryStatus = (req, res, next) => {
  try {
    const { deliveryId } = req.params;

    if (!deliveryId || !deliveryId.trim()) {
      return res.status(400).json({
        error: "INVALID_DELIVERY_ID",
        message: "Delivery ID parameter is required."
      });
    }

    const delivery = store.getDeliveryStatus(deliveryId.trim());

    if (!delivery) {
      return res.status(404).json({
        error: "DELIVERY_NOT_FOUND",
        message: `Delivery with ID '${deliveryId}' does not exist.`
      });
    }

    // Required fields: delivery ID, order ID, partner ID, and status
    return res.status(200).json({
      deliveryId: delivery.deliveryId,
      orderId: delivery.orderId,
      partnerId: delivery.partnerId,
      partnerName: delivery.partnerName,
      partnerPhone: delivery.partnerPhone,
      partnerRating: delivery.partnerRating,
      vehicle: delivery.vehicle,
      status: delivery.status,
      statusHistory: delivery.statusHistory,
      estimatedDeliveryMins: delivery.estimatedDeliveryMins
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/deliveries/:deliveryId/advance
 * Simulates progression to next delivery state:
 * ASSIGNED -> PICKED_UP -> OUT_FOR_DELIVERY -> DELIVERED
 */
const advanceDeliveryStatus = (req, res, next) => {
  try {
    const { deliveryId } = req.params;
    const delivery = store.advanceDeliveryStatus(deliveryId.trim());

    if (!delivery) {
      return res.status(404).json({
        error: "DELIVERY_NOT_FOUND",
        message: `Delivery with ID '${deliveryId}' not found.`
      });
    }

    return res.status(200).json({
      message: `Delivery status transitioned to '${delivery.status}'`,
      deliveryId: delivery.deliveryId,
      orderId: delivery.orderId,
      partnerId: delivery.partnerId,
      status: delivery.status,
      statusHistory: delivery.statusHistory
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Reset data store for automated testing / demo fresh start
 * POST /api/admin/reset
 */
const resetStore = (req, res, next) => {
  try {
    store.reset();
    return res.status(200).json({
      message: "Data store reset to initial state successfully."
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDeliveryStatus,
  advanceDeliveryStatus,
  resetStore
};
