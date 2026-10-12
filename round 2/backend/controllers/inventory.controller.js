const store = require("../data/store");

/**
 * 2. NEARBY INVENTORY CONTROLLER
 * GET /api/inventory/nearby?productId=P101
 *
 * Requirements:
 * - Display available quantity and store ID.
 * - Show whether the product is in stock.
 * - Return 404 if the product does not exist.
 */
const getNearbyInventory = (req, res, next) => {
  try {
    const { productId } = req.query;

    if (!productId || typeof productId !== "string" || !productId.trim()) {
      return res.status(400).json({
        error: "MISSING_PRODUCT_ID",
        message: "Query parameter 'productId' is required (e.g., /api/inventory/nearby?productId=P101)."
      });
    }

    const inventoryData = store.getNearbyInventory(productId.trim());

    if (!inventoryData) {
      return res.status(404).json({
        error: "PRODUCT_NOT_FOUND",
        message: `Product '${productId}' not found in catalog or nearby dark stores.`,
        productId: productId.trim()
      });
    }

    // Required fields: available quantity, store ID, whether in stock
    return res.status(200).json({
      productId: inventoryData.productId,
      productName: inventoryData.productName,
      storeId: inventoryData.storeId,
      storeName: inventoryData.storeName,
      availableQuantity: inventoryData.availableQuantity,
      inStock: inventoryData.inStock,
      pincode: inventoryData.pincode,
      address: inventoryData.address,
      deliveryTimeMinutes: inventoryData.deliveryTimeMinutes
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/inventory (Full inventory overview for admin / debugging)
 */
const getAllInventory = (req, res, next) => {
  try {
    const all = store.products.map(p => store.getNearbyInventory(p.productId));
    return res.status(200).json({
      store: store.store,
      inventory: all
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNearbyInventory,
  getAllInventory
};
