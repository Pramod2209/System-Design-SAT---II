import React, { useState, useEffect } from 'react';
import DeliveryTracker from '../components/DeliveryTracker';
import { Package, Clock, Bike, CheckCircle2, ChevronRight, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function OrdersPage({ currentUser, activeDeliveryId, onSelectDeliveryId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await api.getOrders(currentUser);
    if (res.ok && Array.isArray(res.data)) {
      setOrders(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  return (
    <div>
      {/* 1. Live Delivery Tracker Section */}
      <DeliveryTracker
        selectedDeliveryId={activeDeliveryId}
        onSelectDeliveryId={onSelectDeliveryId}
      />

      {/* 2. Order History Header */}
      <div className="section-header" style={{ marginTop: "36px" }}>
        <div className="section-title">
          <Package size={20} color="#3b82f6" />
          <span>Orders for {currentUser}</span>
          <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 500 }}>
            ({orders.length} placed)
          </span>
        </div>

        <button className="nav-btn" onClick={fetchOrders} disabled={loading}>
          <RefreshCw size={14} className={loading ? "spin" : ""} />
          Refresh Orders
        </button>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <div className="empty-title">No orders found for {currentUser}</div>
          <div className="empty-desc">
            Place an order from the Shop catalog to see the atomic stock reservation and delivery partner assignment in action.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {orders.map((order) => (
            <div
              key={order.orderId}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "14px"
              }}
            >
              {/* Order Meta Bar */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                borderBottom: "1px solid var(--border-subtle)",
                paddingBottom: "12px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "16px", fontWeight: 800, color: "#38bdf8" }}>
                    {order.orderId}
                  </span>
                  <span className="status-badge s200">
                    {order.status}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={12} /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <button
                  className="add-btn"
                  onClick={() => onSelectDeliveryId(order.deliveryId)}
                  style={{ fontSize: "12px", padding: "6px 14px" }}
                >
                  <Bike size={14} />
                  <span>Track Delivery ({order.deliveryId})</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Items Breakdown */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                    ITEMS ORDERED:
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ fontSize: "13.5px", color: "#fff", display: "flex", justifyContent: "space-between" }}>
                        <span>
                          {item.quantity}x {item.name} ({item.unit})
                        </span>
                        <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                          ₹{item.subtotal}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div style={{
                  background: "var(--bg-surface-elevated)",
                  borderRadius: "var(--radius-sm)",
                  padding: "12px",
                  fontSize: "13px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    <span>Store:</span>
                    <span style={{ fontWeight: 600 }}>{order.storeId}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    <span>Delivery Fee:</span>
                    <span>{order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, color: "#34d399", borderTop: "1px solid var(--border-subtle)", paddingTop: "6px" }}>
                    <span>Total Amount:</span>
                    <span>₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
