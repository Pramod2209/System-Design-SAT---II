# ⚡ Food & Grocery Quick-Commerce Platform

> **Round 2 Low-Level Design (LLD) Implementation**  
> Hyperlocal 10-Minute Delivery Platform powered by Node.js/Express REST APIs and React.js.

---

## 🏗️ Architecture & Technology Stack

- **Backend:** Node.js & Express.js (Modular routing, controllers, centralized error handling, and in-memory transactional store)
- **Frontend:** React.js (Vite), modern CSS design system with glassmorphism, responsive grid, dynamic steppers, live delivery status timeline, and embedded interactive API Explorer
- **Database / Store:** Thread-safe in-memory data store with atomic stock reservations, concurrency checks, and user-cart sessions
- **API Testing:** Postman Collection (`postman_collection.json`) + Automated Node.js Test Suite (`node test-api.js` with 32 assertions)

---

## 📂 Project Directory Structure

```text
round 2/
├── backend/
│   ├── config/
│   ├── controllers/
│   │   ├── product.controller.js     # 1. Product Search & Catalog
│   │   ├── inventory.controller.js   # 2. Nearby Dark Store Inventory
│   │   ├── cart.controller.js        # 3. Add to Cart & Cart Management
│   │   ├── order.controller.js       # 4. & 5. Place Order & Partner Assignment
│   │   └── delivery.controller.js    # 6. Delivery Tracking & Simulation
│   ├── data/
│   │   ├── products.data.js          # Catalog dataset (Milk, Bread, Eggs, etc.)
│   │   ├── inventory.data.js         # Hyperlocal dark store stock levels
│   │   ├── deliveryPartners.data.js  # Fleet of delivery riders (EV fleet)
│   │   └── store.js                  # In-memory reactive state manager
│   ├── routes/
│   │   ├── product.routes.js
│   │   ├── inventory.routes.js
│   │   ├── cart.routes.js
│   │   ├── order.routes.js
│   │   └── delivery.routes.js
│   ├── package.json
│   ├── server.js                     # Express server setup & middleware
│   └── test-api.js                   # 32/32 Automated API test suite
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # User switcher, dark store badge, cart button
│   │   │   ├── SearchBar.jsx         # Debounced search, category filters, quick chips
│   │   │   ├── ProductCard.jsx       # Card with image, stock pill, stepper, inventory query
│   │   │   ├── CartDrawer.jsx        # Slide-over cart with bill breakdown & place order
│   │   │   ├── OrderConfirmationModal.jsx # Order celebration & rider assignment details
│   │   │   ├── DeliveryTracker.jsx   # 4-stage delivery timeline & simulation stepper
│   │   │   ├── NearbyInventoryModal.jsx  # Interactive nearby store stock checker
│   │   │   └── ApiTesterModal.jsx    # Built-in REST API Explorer modal
│   │   ├── pages/
│   │   │   ├── ShopPage.jsx          # Grocery catalog & filtering
│   │   │   └── OrdersPage.jsx        # Order history & live tracking
│   │   ├── services/
│   │   │   └── api.js                # Centralized fetch client
│   │   ├── App.jsx                   # Root application state & routing
│   │   ├── index.css                 # Custom quick-commerce design system
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js                # Vite server with /api proxy to Express
│
├── postman_collection.json           # Ready-to-import Postman collection v2.1.0
├── package.json                      # Root workspace scripts
└── README.md                         # Documentation & test guide
```

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Start the Backend API Server
```bash
# From the "round 2" directory
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000`.*

### 2. Start the Frontend React Application
Open a new terminal window:
```bash
# From the "round 2" directory
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

### 3. Run Automated API Tests (All 32 Assertions)
```bash
# From the "round 2" directory
cd backend
node test-api.js
```

---

## 📡 REST API Documentation & Test Requests

### 1. Product Search
**Endpoint:** `GET /api/products/search?q=milk`

**Description:**
Searches grocery catalog by product name (case-insensitive substring match). Returns matching JSON array with `productId`, `name`, `price`, unit, category, and real-time stock availability. Returns `[]` when no products match.

**Sample Request:**
```http
GET /api/products/search?q=milk HTTP/1.1
Host: localhost:5000
```

**Sample Response (HTTP 200 OK):**
```json
[
  {
    "productId": "P101",
    "name": "Amul Taaza Fresh Toned Milk",
    "price": 32,
    "category": "Dairy & Breakfast",
    "unit": "500 ml",
    "brand": "Amul",
    "imageUrl": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500",
    "inStock": true,
    "availableQuantity": 25
  },
  {
    "productId": "P111",
    "name": "Mother Dairy Cow Milk Pouch",
    "price": 28,
    "category": "Dairy & Breakfast",
    "unit": "500 ml",
    "brand": "Mother Dairy",
    "imageUrl": "https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=500",
    "inStock": true,
    "availableQuantity": 20
  }
]
```

**Empty Result Response (HTTP 200 OK):**
```json
[]
```

---

### 2. Nearby Store Inventory
**Endpoint:** `GET /api/inventory/nearby?productId=P101`

**Description:**
Fetches stock availability and store details from the hyperlocal dark store (`STORE_BLR_01`). Returns 404 if the product does not exist in the system.

**Sample Request:**
```http
GET /api/inventory/nearby?productId=P101 HTTP/1.1
Host: localhost:5000
```

**Sample Response (HTTP 200 OK):**
```json
{
  "productId": "P101",
  "productName": "Amul Taaza Fresh Toned Milk",
  "storeId": "STORE_BLR_01",
  "storeName": "Koramangala Hyperlocal Hub #14",
  "availableQuantity": 25,
  "inStock": true,
  "pincode": "560034",
  "address": "80 Feet Road, 4th Block, Koramangala, Bengaluru",
  "deliveryTimeMinutes": 10
}
```

**Product Not Found (HTTP 404 Not Found):**
```http
GET /api/inventory/nearby?productId=P9999 HTTP/1.1
Host: localhost:5000
```
```json
{
  "error": "PRODUCT_NOT_FOUND",
  "message": "Product 'P9999' not found in catalog or nearby dark stores.",
  "productId": "P9999"
}
```

---

### 3. Add Product to Cart
**Endpoint:** `POST /api/cart/items`

**Description:**
Adds products to user's cart, validates input types, positive integer quantities, product existence, and available stock. Supports updates.

**Sample Request:**
```http
POST /api/cart/items HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "userId": "U101",
  "productId": "P101",
  "quantity": 2
}
```

**Sample Response (HTTP 201 Created):**
```json
{
  "message": "Product added to cart successfully",
  "cart": {
    "userId": "U101",
    "items": [
      {
        "productId": "P101",
        "name": "Amul Taaza Fresh Toned Milk",
        "price": 32,
        "unit": "500 ml",
        "quantity": 2,
        "subtotal": 64,
        "availableQuantity": 25,
        "inStock": true
      }
    ],
    "totalItems": 2,
    "subtotal": 64,
    "deliveryFee": 25,
    "totalAmount": 89
  }
}
```

**Invalid Quantity Error (HTTP 400 Bad Request):**
```http
POST /api/cart/items HTTP/1.1
Content-Type: application/json

{
  "userId": "U101",
  "productId": "P101",
  "quantity": -5
}
```
```json
{
  "error": "INVALID_QUANTITY",
  "message": "Quantity must be a positive integer greater than zero.",
  "providedQuantity": -5
}
```

---

### 4. & 5. Place Order & Delivery Partner Assignment
**Endpoint:** `POST /api/orders`

**Description:**
- Verifies cart is not empty (HTTP 400).
- Atomically validates inventory sufficiency for all items (HTTP 409 Conflict if stock is insufficient).
- Reserves and deducts required stock.
- Generates unique `orderId` (`ORD-1001`).
- Assigns available delivery rider (`DP101: Rajesh Kumar`).
- Generates unique `deliveryId` (`DEL-5001`).
- Clears the cart for `userId`.

**Sample Request:**
```http
POST /api/orders HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "userId": "U101"
}
```

**Sample Response (HTTP 201 Created):**
```json
{
  "message": "Order placed successfully! Delivery partner assigned.",
  "order": {
    "orderId": "ORD-1001",
    "userId": "U101",
    "storeId": "STORE_BLR_01",
    "storeName": "Koramangala Hyperlocal Hub #14",
    "items": [
      {
        "productId": "P101",
        "name": "Amul Taaza Fresh Toned Milk",
        "price": 32,
        "unit": "500 ml",
        "quantity": 2,
        "subtotal": 64
      }
    ],
    "totalItems": 2,
    "subtotal": 64,
    "deliveryFee": 25,
    "totalAmount": 89,
    "deliveryId": "DEL-5001",
    "status": "CONFIRMED",
    "createdAt": "2026-10-12T10:14:36.120Z"
  },
  "delivery": {
    "deliveryId": "DEL-5001",
    "orderId": "ORD-1001",
    "partnerId": "DP101",
    "partnerName": "Rajesh Kumar",
    "partnerPhone": "+91 98765 43210",
    "partnerRating": 4.9,
    "vehicle": "Ather 450X EV (KA-01-EQ-4421)",
    "storeId": "STORE_BLR_01",
    "storeName": "Koramangala Hyperlocal Hub #14",
    "status": "ASSIGNED",
    "estimatedDeliveryMins": 10,
    "createdAt": "2026-10-12T10:14:36.120Z",
    "statusHistory": [
      {
        "status": "ASSIGNED",
        "timestamp": "2026-10-12T10:14:36.120Z",
        "note": "Assigned to delivery partner Rajesh Kumar"
      }
    ]
  }
}
```

**Empty Cart Error (HTTP 400 Bad Request):**
```json
{
  "error": "EMPTY_CART",
  "message": "Cart is empty. Please add items to cart before placing an order."
}
```

**Insufficient Stock Error (HTTP 409 Conflict):**
```json
{
  "error": "INSUFFICIENT_STOCK",
  "message": "Insufficient inventory for product 'Amul Taaza Fresh Toned Milk' (ID: P101). Requested: 50, Available: 23",
  "productId": "P101",
  "productName": "Amul Taaza Fresh Toned Milk",
  "requested": 50,
  "available": 23
}
```

---

### 6. Delivery Status & Tracking
**Endpoint:** `GET /api/deliveries/:deliveryId/status`

**Description:**
Returns real-time status of the delivery order, rider details, estimated time, and full audit progression history. Supports statuses: `ASSIGNED`, `PICKED_UP`, `OUT_FOR_DELIVERY`, and `DELIVERED`. Returns 404 for invalid delivery IDs.

**Sample Request:**
```http
GET /api/deliveries/DEL-5001/status HTTP/1.1
Host: localhost:5000
```

**Sample Response (HTTP 200 OK):**
```json
{
  "deliveryId": "DEL-5001",
  "orderId": "ORD-1001",
  "partnerId": "DP101",
  "partnerName": "Rajesh Kumar",
  "partnerPhone": "+91 98765 43210",
  "partnerRating": 4.9,
  "vehicle": "Ather 450X EV (KA-01-EQ-4421)",
  "status": "OUT_FOR_DELIVERY",
  "statusHistory": [
    {
      "status": "ASSIGNED",
      "timestamp": "2026-10-12T10:14:36.120Z",
      "note": "Assigned to delivery partner Rajesh Kumar"
    },
    {
      "status": "PICKED_UP",
      "timestamp": "2026-10-12T10:15:35.400Z",
      "note": "Order picked up from dark store"
    },
    {
      "status": "OUT_FOR_DELIVERY",
      "timestamp": "2026-10-12T10:16:05.100Z",
      "note": "Rider is en route to customer location"
    }
  ],
  "estimatedDeliveryMins": 10
}
```

**Invalid Delivery ID (HTTP 404 Not Found):**
```http
GET /api/deliveries/INVALID_DEL/status HTTP/1.1
Host: localhost:5000
```
```json
{
  "error": "DELIVERY_NOT_FOUND",
  "message": "Delivery with ID 'INVALID_DEL' does not exist."
}
```

---

## 🚦 HTTP Status Codes Used

| Code | Status | When Used |
|---|---|---|
| **200** | OK | Successful product search, nearby inventory check, delivery status lookup, cart query. |
| **201** | Created | Successful item added to cart, order created with partner assignment. |
| **400** | Bad Request | Missing input fields, invalid quantity (`<= 0` or non-integer), empty cart checkout. |
| **404** | Not Found | Product ID or Delivery ID does not exist in the system. |
| **409** | Conflict | Insufficient stock when adding item or confirming order during checkout. |
| **500** | Internal Server Error | Handled by centralized Express error-handling middleware. |

---

## 🧪 Postman Testing

1. Open Postman.
2. Click **Import** in the top left.
3. Select the file `postman_collection.json` located in `d:\SD\round 2\postman_collection.json`.
4. The collection is pre-configured with the `{{baseUrl}}` variable pointing to `http://localhost:5000` and all 6 required endpoints with test requests and saved sample responses!
