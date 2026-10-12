import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  currentUser,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
  isPlacingOrder,
  orderError
}) {
  if (!isOpen) return null;

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const deliveryFee = cart?.deliveryFee || 0;
  const totalAmount = cart?.totalAmount || 0;

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-title">
            <ShoppingBag size={20} color="#10b981" />
            <span>Shopping Cart ({cart?.totalItems || 0})</span>
          </div>
          <button className="cart-close-btn" onClick={onClose} title="Close cart">
            <X size={16} />
          </button>
        </div>

        {/* User context badge */}
        <div style={{
          padding: "8px 24px",
          background: "rgba(255, 255, 255, 0.03)",
          borderBottom: "1px solid var(--border-subtle)",
          fontSize: "12px",
          color: "var(--text-muted)",
          display: "flex",
          justifyContent: "space-between"
        }}>
          <span>Active User: <strong style={{ color: "#38bdf8" }}>{currentUser}</strong></span>
          {items.length > 0 && (
            <button
              onClick={onClearCart}
              style={{
                background: "transparent",
                color: "#f43f5e",
                fontSize: "11.5px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Trash2 size={12} /> Clear Cart
            </button>
          )}
        </div>

        {/* Error notification */}
        {orderError && (
          <div style={{
            margin: "12px 24px 0 24px",
            padding: "10px 14px",
            background: "rgba(244, 63, 94, 0.15)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            borderRadius: "var(--radius-sm)",
            color: "#fda4af",
            fontSize: "13px",
            display: "flex",
            alignItems: "flex-start",
            gap: "8px"
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Order Failed:</strong> {orderError}
            </div>
          </div>
        )}

        {/* Items List */}
        {items.length === 0 ? (
          <div className="empty-state" style={{ margin: "auto 24px" }}>
            <div className="empty-icon">🛒</div>
            <div className="empty-title">Your cart is empty</div>
            <div className="empty-desc">
              Add some fresh milk, bread, eggs or coffee to get started with 10-minute delivery.
            </div>
          </div>
        ) : (
          <div className="cart-items-list">
            {items.map((item) => (
              <div key={item.productId} className="cart-item-card">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="cart-item-img"
                />
                <div className="cart-item-details">
                  <div className="cart-item-name" title={item.name}>
                    {item.name}
                  </div>
                  <div className="cart-item-sub">
                    {item.unit} • ₹{item.price} each
                  </div>
                  <div className="cart-item-price">
                    ₹{item.subtotal}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                  <div className="qty-stepper">
                    <button
                      className="stepper-btn"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="stepper-val">{item.quantity}</span>
                    <button
                      className="stepper-btn"
                      disabled={item.quantity >= item.availableQuantity}
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.productId)}
                    style={{ background: "transparent", color: "var(--text-muted)", fontSize: "11px" }}
                    title="Remove item"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer & Bill details */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="bill-breakdown">
              <div className="bill-row">
                <span>Items Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="bill-row">
                <span>Delivery Fee (Hyperlocal Hub)</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="free-tag">FREE (Orders &gt; ₹200)</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="bill-row">
                <span>Estimated Time</span>
                <span style={{ color: "#34d399", fontWeight: 700 }}>⚡ 10 mins</span>
              </div>
              <div className="bill-row total">
                <span>To Pay</span>
                <span style={{ color: "#34d399", fontSize: "18px" }}>₹{totalAmount}</span>
              </div>
            </div>

            <button
              className="place-order-btn"
              onClick={onPlaceOrder}
              disabled={isPlacingOrder || items.length === 0}
            >
              {isPlacingOrder ? (
                <span>Placing Order & Reserving Stock...</span>
              ) : (
                <>
                  <span>Place Order • ₹{totalAmount}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            <div style={{ textAlign: "center", fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>
              Calls POST /api/orders • Atomically reserves inventory & assigns rider
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
