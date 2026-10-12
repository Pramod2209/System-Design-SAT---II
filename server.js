const express = require("express");
const app = express();

app.use(express.json());

// Sample data
const products = [
  { id: 1, name: "Milk", price: 30 },
  { id: 2, name: "Bread", price: 40 }
];

const inventory = {
  1: 50,
  2: 30
};

const carts = {};
const orders = [];
const deliveries = {};

// 1. Search Products
app.get("/api/products", (req, res) => {
  const q = (req.query.q || "").toLowerCase();

  const result = products.filter(p =>
    p.name.toLowerCase().includes(q)
  );

  res.status(200).json(result);
});

// 2. Check Inventory
app.get("/api/inventory/:productId", (req, res) => {
  const id = req.params.productId;

  if (inventory[id] === undefined) {
    return res.status(404).json({
      message: "Product not found"
    });
  }

  res.json({
    productId: id,
    availableQuantity: inventory[id]
  });
});

// 3. Add Product to Cart
app.post("/api/cart/items", (req, res) => {
  const { userId, productId, quantity } = req.body;
  const product = products.find(
    p => p.id === Number(productId)
  );

  if (!userId || !product || 
      !Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({
      message: "Invalid request"
    });
  }

  if (!carts[userId]) carts[userId] = {};

  carts[userId][productId] =
    (carts[userId][productId] || 0) + quantity;

  res.status(201).json({
    message: "Product added to cart",
    cart: carts[userId]
  });
});

// 4. Place Order
app.post("/api/orders", (req, res) => {
  const { userId } = req.body;
  const cart = carts[userId];

  if (!cart || Object.keys(cart).length === 0) {
    return res.status(400).json({
      message: "Cart is empty"
    });
  }

  // Validate stock before placing the order
  for (const [id, quantity] of Object.entries(cart)) {
    if ((inventory[id] ?? 0) < quantity) {
      return res.status(409).json({
        message: "Insufficient stock",
        productId: id
      });
    }
  }

  // Reserve inventory
  for (const [id, quantity] of Object.entries(cart)) {
    inventory[id] -= quantity;
  }

  const orderId = "O" + (orders.length + 1);
  const deliveryId = "D" + (orders.length + 1);

  const order = {
    orderId,
    userId,
    items: { ...cart },
    status: "CONFIRMED"
  };

  orders.push(order);

  deliveries[deliveryId] = {
    deliveryId,
    orderId,
    partner: "DP101",
    status: "ASSIGNED"
  };

  delete carts[userId];

  res.status(201).json({
    message: "Order placed successfully",
    order,
    deliveryId
  });
});

// 5. Track Delivery
app.get("/api/deliveries/:id", (req, res) => {
  const delivery = deliveries[req.params.id];

  if (!delivery) {
    return res.status(404).json({
      message: "Delivery not found"
    });
  }

  res.status(200).json(delivery);
});

// Start Server
app.get("/", (req, res) => {
  res.send(`
    <h1>Food & Grocery Quick-Commerce Platform</h1>
    <h3>API Server is Running!</h3>
    <ul>
      <li>/api/products?q=milk</li>
      <li>/api/inventory/1</li>
    </ul>
  `);
});
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});