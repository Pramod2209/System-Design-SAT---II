/**
 * Central In-Memory Store & State Manager
 * Handles concurrency-safe atomic inventory deductions,
 * cart operations, order placements, and delivery tracking.
 */

const initialProducts = require("./products.data");
const { defaultStore, initialInventory } = require("./inventory.data");
const initialPartners = require("./deliveryPartners.data");

class DataStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.products = [...initialProducts];
    this.store = { ...defaultStore };
    this.inventory = { ...initialInventory };
    this.deliveryPartners = initialPartners.map(p => ({ ...p }));
    
    // Carts: userId -> Map of productId -> quantity
    this.carts = new Map();

    // Orders: orderId -> order object
    this.orders = new Map();

    // Deliveries: deliveryId -> delivery object
    this.deliveries = new Map();

    this.orderCounter = 1000;
    this.deliveryCounter = 5000;
    this.partnerIndex = 0;
  }

  // --- 1. Product Search ---
  searchProducts(query = "") {
    const q = (query || "").trim().toLowerCase();
    if (!q) {
      // If query is empty, return all products
      return this.products.map(p => ({
        productId: p.productId,
        name: p.name,
        price: p.price,
        category: p.category,
        unit: p.unit,
        brand: p.brand,
        imageUrl: p.imageUrl,
        inStock: (this.inventory[p.productId] ?? 0) > 0,
        availableQuantity: this.inventory[p.productId] ?? 0
      }));
    }

    return this.products
      .filter(p => p.name.toLowerCase().includes(q))
      .map(p => ({
        productId: p.productId,
        name: p.name,
        price: p.price,
        category: p.category,
        unit: p.unit,
        brand: p.brand,
        imageUrl: p.imageUrl,
        inStock: (this.inventory[p.productId] ?? 0) > 0,
        availableQuantity: this.inventory[p.productId] ?? 0
      }));
  }

  getProductById(productId) {
    return this.products.find(p => p.productId === productId);
  }

  // --- 2. Nearby Inventory ---
  getNearbyInventory(productId) {
    const product = this.getProductById(productId);
    if (!product) {
      return null;
    }

    const availableQuantity = this.inventory[productId] ?? 0;
    return {
      productId: product.productId,
      productName: product.name,
      storeId: this.store.storeId,
      storeName: this.store.storeName,
      pincode: this.store.pincode,
      address: this.store.address,
      availableQuantity,
      inStock: availableQuantity > 0,
      deliveryTimeMinutes: this.store.estimatedDeliveryMins
    };
  }

  // --- 3. Cart Management ---
  getCart(userId) {
    if (!this.carts.has(userId)) {
      return {
        userId,
        items: [],
        totalItems: 0,
        subtotal: 0,
        deliveryFee: 0,
        totalAmount: 0
      };
    }

    const userCart = this.carts.get(userId);
    const items = [];
    let subtotal = 0;
    let totalItems = 0;

    for (const [productId, quantity] of userCart.entries()) {
      const product = this.getProductById(productId);
      if (product) {
        const itemSubtotal = product.price * quantity;
        subtotal += itemSubtotal;
        totalItems += quantity;
        items.push({
          productId: product.productId,
          name: product.name,
          price: product.price,
          unit: product.unit,
          imageUrl: product.imageUrl,
          quantity,
          subtotal: itemSubtotal,
          availableQuantity: this.inventory[productId] ?? 0,
          inStock: (this.inventory[productId] ?? 0) >= quantity
        });
      }
    }

    const deliveryFee = items.length > 0 ? (subtotal >= 200 ? 0 : 25) : 0;
    const totalAmount = subtotal + deliveryFee;

    return {
      userId,
      items,
      totalItems,
      subtotal,
      deliveryFee,
      totalAmount
    };
  }

  addToCart(userId, productId, quantity, setAbsolute = false) {
    const product = this.getProductById(productId);
    if (!product) {
      return { error: "NOT_FOUND", message: `Product ${productId} does not exist` };
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return { error: "INVALID_QUANTITY", message: "Quantity must be a positive integer" };
    }

    if (!this.carts.has(userId)) {
      this.carts.set(userId, new Map());
    }

    const userCart = this.carts.get(userId);
    const currentQty = userCart.get(productId) || 0;
    const newQty = setAbsolute ? quantity : currentQty + quantity;

    const availableStock = this.inventory[productId] ?? 0;
    if (newQty > availableStock) {
      return {
        error: "STOCK_LIMIT_EXCEEDED",
        message: `Only ${availableStock} units available for ${product.name}`,
        availableQuantity: availableStock,
        requestedQuantity: newQty
      };
    }

    userCart.set(productId, newQty);
    return {
      success: true,
      cart: this.getCart(userId)
    };
  }

  updateCartItemQuantity(userId, productId, quantity) {
    if (!Number.isInteger(quantity) || quantity < 0) {
      return { error: "INVALID_QUANTITY", message: "Quantity must be a non-negative integer" };
    }

    if (quantity === 0) {
      return this.removeFromCart(userId, productId);
    }

    return this.addToCart(userId, productId, quantity, true);
  }

  removeFromCart(userId, productId) {
    if (this.carts.has(userId)) {
      this.carts.get(userId).delete(productId);
      if (this.carts.get(userId).size === 0) {
        this.carts.delete(userId);
      }
    }
    return { success: true, cart: this.getCart(userId) };
  }

  clearCart(userId) {
    this.carts.delete(userId);
    return { success: true, cart: this.getCart(userId) };
  }

  // --- 4. Order & Inventory Reservation ---
  placeOrder(userId) {
    const cart = this.getCart(userId);

    // 1. Check if cart is empty
    if (!cart || cart.items.length === 0) {
      return {
        error: "EMPTY_CART",
        statusCode: 400,
        message: "Cart is empty. Please add items to cart before placing an order."
      };
    }

    // 2. Validate stock sufficiency for every item before deduction (Atomicity)
    for (const item of cart.items) {
      const stock = this.inventory[item.productId] ?? 0;
      if (stock < item.quantity) {
        return {
          error: "INSUFFICIENT_STOCK",
          statusCode: 409,
          message: `Insufficient inventory for product '${item.name}' (ID: ${item.productId}). Requested: ${item.quantity}, Available: ${stock}`,
          productId: item.productId,
          productName: item.name,
          requested: item.quantity,
          available: stock
        };
      }
    }

    // 3. Stock deduction / Reservation
    for (const item of cart.items) {
      this.inventory[item.productId] -= item.quantity;
    }

    // 4. Generate unique IDs
    this.orderCounter += 1;
    this.deliveryCounter += 1;
    const orderId = `ORD-${this.orderCounter}`;
    const deliveryId = `DEL-${this.deliveryCounter}`;

    // 5. Assign delivery partner (Round-robin or availability)
    const partner = this.assignDeliveryPartner();

    const now = new Date().toISOString();

    const orderRecord = {
      orderId,
      userId,
      storeId: this.store.storeId,
      storeName: this.store.storeName,
      items: cart.items.map(i => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        unit: i.unit,
        quantity: i.quantity,
        subtotal: i.subtotal
      })),
      totalItems: cart.totalItems,
      subtotal: cart.subtotal,
      deliveryFee: cart.deliveryFee,
      totalAmount: cart.totalAmount,
      deliveryId,
      status: "CONFIRMED",
      createdAt: now
    };

    const deliveryRecord = {
      deliveryId,
      orderId,
      partnerId: partner.partnerId,
      partnerName: partner.name,
      partnerPhone: partner.phone,
      partnerRating: partner.rating,
      vehicle: partner.vehicle,
      storeId: this.store.storeId,
      storeName: this.store.storeName,
      status: "ASSIGNED",
      estimatedDeliveryMins: this.store.estimatedDeliveryMins,
      createdAt: now,
      statusHistory: [
        { status: "ASSIGNED", timestamp: now, note: `Assigned to delivery partner ${partner.name}` }
      ]
    };

    this.orders.set(orderId, orderRecord);
    this.deliveries.set(deliveryId, deliveryRecord);

    // 6. Clear user cart after successful order placement
    this.clearCart(userId);

    return {
      success: true,
      statusCode: 201,
      message: "Order placed successfully! Delivery partner assigned.",
      order: orderRecord,
      delivery: deliveryRecord
    };
  }

  // --- 5. Delivery Partner Assignment ---
  assignDeliveryPartner() {
    const partner = this.deliveryPartners[this.partnerIndex % this.deliveryPartners.length];
    this.partnerIndex += 1;
    return partner;
  }

  // --- 6. Delivery Tracking & Status ---
  getDeliveryStatus(deliveryId) {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery) {
      return null;
    }

    return {
      deliveryId: delivery.deliveryId,
      orderId: delivery.orderId,
      partnerId: delivery.partnerId,
      partnerName: delivery.partnerName,
      partnerPhone: delivery.partnerPhone,
      partnerRating: delivery.partnerRating,
      vehicle: delivery.vehicle,
      status: delivery.status,
      statusHistory: delivery.statusHistory,
      estimatedDeliveryMins: delivery.estimatedDeliveryMins,
      createdAt: delivery.createdAt
    };
  }

  advanceDeliveryStatus(deliveryId) {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery) {
      return null;
    }

    const transitions = {
      "ASSIGNED": { next: "PICKED_UP", note: "Order picked up from dark store" },
      "PICKED_UP": { next: "OUT_FOR_DELIVERY", note: "Rider is en route to customer location" },
      "OUT_FOR_DELIVERY": { next: "DELIVERED", note: "Package handed over to customer" },
      "DELIVERED": { next: "DELIVERED", note: "Order is already completed" }
    };

    const current = delivery.status;
    const transition = transitions[current] || { next: current, note: "Status update" };

    if (current !== "DELIVERED") {
      delivery.status = transition.next;
      delivery.statusHistory.push({
        status: transition.next,
        timestamp: new Date().toISOString(),
        note: transition.note
      });

      // Update associated order status as well
      const order = this.orders.get(delivery.orderId);
      if (order && transition.next === "DELIVERED") {
        order.status = "COMPLETED";
      }
    }

    return delivery;
  }

  getAllOrders(userId) {
    const all = Array.from(this.orders.values());
    if (userId) {
      return all.filter(o => o.userId === userId).reverse();
    }
    return all.reverse();
  }

  getOrderById(orderId) {
    return this.orders.get(orderId) || null;
  }
}

// Singleton store instance
const storeInstance = new DataStore();
module.exports = storeInstance;
