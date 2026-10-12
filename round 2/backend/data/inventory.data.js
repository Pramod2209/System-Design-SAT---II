/**
 * Nearby Dark Store Inventory Dataset
 * Default store: STORE_BLR_01 (Koramangala Hyperlocal Hub)
 */

const defaultStore = {
  storeId: "STORE_BLR_01",
  storeName: "Koramangala Hyperlocal Hub #14",
  pincode: "560034",
  address: "80 Feet Road, 4th Block, Koramangala, Bengaluru",
  estimatedDeliveryMins: 10
};

// Initial inventory levels mapped by productId
const initialInventory = {
  "P101": 25, // Milk - in stock
  "P102": 18, // Sourdough bread
  "P103": 30, // Brown eggs
  "P104": 14, // Greek yogurt
  "P105": 8,  // Hass Avocados
  "P106": 40, // Maggi noodles
  "P107": 12, // Cold brew coffee
  "P108": 15, // Dark chocolate
  "P109": 9,  // Baby spinach
  "P110": 4,  // Olive oil (limited stock)
  "P111": 20, // Cow milk
  "P112": 0   // Orange juice (out of stock demo)
};

module.exports = {
  defaultStore,
  initialInventory
};
