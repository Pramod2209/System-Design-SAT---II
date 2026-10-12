import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ShopPage from './pages/ShopPage';
import OrdersPage from './pages/OrdersPage';
import CartDrawer from './components/CartDrawer';
import OrderConfirmationModal from './components/OrderConfirmationModal';
import NearbyInventoryModal from './components/NearbyInventoryModal';
import ApiTesterModal from './components/ApiTesterModal';
import { api } from './services/api';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState("U101");
  const [activeTab, setActiveTab] = useState("shop");
  
  // Catalog & Search State
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [isSearching, setIsSearching] = useState(false);

  // Cart State
  const [cart, setCart] = useState({ items: [], totalItems: 0, subtotal: 0, deliveryFee: 0, totalAmount: 0 });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);

  // Modals & Navigation State
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [selectedInventoryProductId, setSelectedInventoryProductId] = useState(null);
  const [isApiTesterOpen, setIsApiTesterOpen] = useState(false);
  const [activeDeliveryId, setActiveDeliveryId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Fetch Products via Search API
  const fetchProducts = async (query = "") => {
    setIsSearching(true);
    const res = await api.searchProducts(query);
    if (res.ok && Array.isArray(res.data)) {
      setProducts(res.data);
    } else {
      setProducts([]);
    }
    setIsSearching(false);
  };

  // 2. Fetch User Cart
  const fetchCart = async (userId) => {
    const res = await api.getCart(userId);
    if (res.ok) {
      setCart(res.data);
    }
  };

  // Initial load & search debounce
  useEffect(() => {
    fetchProducts(searchQuery);
  }, [searchQuery]);

  // Load cart when user changes
  useEffect(() => {
    fetchCart(currentUser);
  }, [currentUser]);

  // Handle Add to Cart: POST /api/cart/items
  const handleAddToCart = async (productId, quantity = 1) => {
    const res = await api.addToCart(currentUser, productId, quantity, "add");
    if (res.ok) {
      setCart(res.data.cart);
      showToast(`Added to cart! (HTTP ${res.status})`);
      // Refresh products to get updated availableQuantity
      fetchProducts(searchQuery);
    } else {
      showToast(res.data?.message || "Failed to add to cart", "error");
    }
  };

  // Handle Update Quantity in Cart
  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    const res = await api.addToCart(currentUser, productId, newQuantity, "set");
    if (res.ok) {
      setCart(res.data.cart);
      fetchProducts(searchQuery);
    } else {
      showToast(res.data?.message || "Cannot update quantity", "error");
    }
  };

  // Handle Remove Single Item
  const handleRemoveFromCart = async (productId) => {
    const res = await api.removeFromCart(currentUser, productId);
    if (res.ok) {
      setCart(res.data.cart);
      showToast("Item removed from cart");
      fetchProducts(searchQuery);
    }
  };

  // Handle Clear Cart
  const handleClearCart = async () => {
    const res = await api.clearCart(currentUser);
    if (res.ok) {
      setCart(res.data.cart);
      showToast("Cart cleared");
      fetchProducts(searchQuery);
    }
  };

  // Handle Place Order: POST /api/orders
  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    setOrderError(null);

    const res = await api.placeOrder(currentUser);

    if (res.ok && res.status === 201) {
      // Order placed successfully!
      setIsCartOpen(false);
      setConfirmedOrder(res.data);
      setActiveDeliveryId(res.data.delivery.deliveryId);
      // Cart is cleared automatically by backend
      await fetchCart(currentUser);
      await fetchProducts(searchQuery);
      showToast(`Order Placed! Partner ${res.data.delivery.partnerName} assigned. (HTTP 201)`);
    } else {
      // Insufficient stock (409) or empty cart (400)
      const errMsg = res.data?.message || "Order placement failed.";
      setOrderError(errMsg);
      showToast(errMsg, "error");
    }

    setIsPlacingOrder(false);
  };

  const handleTrackFromConfirmation = (deliveryId) => {
    setConfirmedOrder(null);
    setActiveDeliveryId(deliveryId);
    setActiveTab("orders");
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onUserChange={(newId) => setCurrentUser(newId)}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        cartTotalCount={cart?.totalItems || 0}
        cartTotalAmount={cart?.totalAmount || 0}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenApiTester={() => setIsApiTesterOpen(true)}
      />

      {/* Main Content Pages */}
      <main className="main-content">
        {activeTab === "shop" ? (
          <ShopPage
            products={products}
            cart={cart}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onCheckInventory={(pId) => setSelectedInventoryProductId(pId)}
          />
        ) : (
          <OrdersPage
            currentUser={currentUser}
            activeDeliveryId={activeDeliveryId}
            onSelectDeliveryId={(delId) => setActiveDeliveryId(delId)}
          />
        )}
      </main>

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        currentUser={currentUser}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onPlaceOrder={handlePlaceOrder}
        isPlacingOrder={isPlacingOrder}
        orderError={orderError}
      />

      {/* Order Confirmation Screen Modal */}
      {confirmedOrder && (
        <OrderConfirmationModal
          orderData={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
          onTrackOrder={handleTrackFromConfirmation}
        />
      )}

      {/* Nearby Inventory Check Modal */}
      {selectedInventoryProductId && (
        <NearbyInventoryModal
          productId={selectedInventoryProductId}
          onClose={() => setSelectedInventoryProductId(null)}
        />
      )}

      {/* LLD REST API Explorer Modal */}
      <ApiTesterModal
        isOpen={isApiTesterOpen}
        onClose={() => setIsApiTesterOpen(false)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="toast-alert" style={{
          borderColor: toast.type === 'error' ? '#f43f5e' : '#10b981'
        }}>
          {toast.type === 'error' ? (
            <AlertCircle size={18} color="#f43f5e" />
          ) : (
            <CheckCircle2 size={18} color="#10b981" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
