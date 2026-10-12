const store = require("../data/store");

/**
 * 1. PRODUCT SEARCH CONTROLLER
 * GET /api/products/search?q=milk
 *
 * Requirements:
 * - Search products by name.
 * - Display product name, price, and product ID.
 * - Return matching products as JSON.
 * - Return an empty array when no products match.
 */
const searchProducts = (req, res, next) => {
  try {
    const { q = "" } = req.query;

    const matches = store.searchProducts(q);

    // Format according to prompt requirements:
    // "Display product name, price, and product ID" + rich metadata for UI
    const formatted = matches.map(p => ({
      productId: p.productId,
      name: p.name,
      price: p.price,
      category: p.category,
      unit: p.unit,
      brand: p.brand,
      imageUrl: p.imageUrl,
      inStock: p.inStock,
      availableQuantity: p.availableQuantity
    }));

    return res.status(200).json(formatted);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products/:productId
 */
const getProductById = (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = store.getProductById(productId);

    if (!product) {
      return res.status(404).json({
        error: "PRODUCT_NOT_FOUND",
        message: `Product with ID '${productId}' not found.`
      });
    }

    const inventory = store.getNearbyInventory(productId);

    return res.status(200).json({
      ...product,
      inventory
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  searchProducts,
  getProductById
};
