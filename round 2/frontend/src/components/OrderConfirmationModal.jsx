import React from 'react';
import { CheckCircle2, X, Bike, ArrowRight, Phone, Star, ShieldCheck } from 'lucide-react';

export default function OrderConfirmationModal({ orderData, onClose, onTrackOrder }) {
  if (!orderData) return null;

  const { order, delivery } = orderData;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: "24px",
          textAlign: "center",
          background: "linear-gradient(180deg, rgba(16, 185, 129, 0.2) 0%, transparent 100%)",
          borderBottom: "1px solid var(--border-subtle)"
        }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(16, 185, 129, 0.2)",
            border: "2px solid #10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px auto",
            boxShadow: "0 0 25px rgba(16, 185, 129, 0.4)"
          }}>
            <CheckCircle2 size={36} color="#34d399" />
          </div>

          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "4px" }}>
            Order Placed Successfully!
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Stock reserved and 10-minute delivery initiated.
          </p>
        </div>

        {/* Content Details */}
        <div style={{ padding: "24px" }}>
          {/* Order & Delivery IDs */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "20px"
          }}>
            <div style={{
              background: "var(--bg-surface-elevated)",
              padding: "12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)"
            }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Order ID</span>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "15px", fontWeight: 800, color: "#38bdf8" }}>
                {order.orderId}
              </div>
            </div>
            <div style={{
              background: "var(--bg-surface-elevated)",
              padding: "12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)"
            }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Delivery ID</span>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "15px", fontWeight: 800, color: "#a855f7" }}>
                {delivery.deliveryId}
              </div>
            </div>
          </div>

          {/* Assigned Delivery Partner Card (Requirement 5) */}
          <div style={{
            background: "rgba(17, 24, 39, 0.9)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            borderRadius: "var(--radius-md)",
            padding: "16px",
            marginBottom: "20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#60a5fa", display: "flex", alignItems: "center", gap: "6px" }}>
                <Bike size={16} /> ASSIGNED DELIVERY PARTNER
              </span>
              <span className="status-badge s200">
                {delivery.status}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: 800,
                color: "#fff"
              }}>
                {delivery.partnerName[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: "#fff", fontSize: "15px" }}>
                  {delivery.partnerName} ({delivery.partnerId})
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>⭐ {delivery.partnerRating}</span>
                  <span>•</span>
                  <span>{delivery.vehicle}</span>
                </div>
              </div>
              <div style={{
                background: "rgba(255, 255, 255, 0.06)",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: "12px",
                color: "#34d399",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}>
                <Phone size={12} />
                {delivery.partnerPhone}
              </div>
            </div>
          </div>

          {/* Ordered items breakdown */}
          <div style={{
            background: "var(--bg-surface-elevated)",
            borderRadius: "var(--radius-sm)",
            padding: "14px",
            marginBottom: "24px",
            fontSize: "13px"
          }}>
            <div style={{ fontWeight: 700, marginBottom: "8px", color: "var(--text-secondary)" }}>
              Items ({order.totalItems}):
            </div>
            {order.items.map((it, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span>{it.quantity}x {it.name} ({it.unit})</span>
                <span style={{ fontWeight: 700 }}>₹{it.subtotal}</span>
              </div>
            ))}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid var(--border-subtle)",
              paddingTop: "8px",
              marginTop: "8px",
              fontWeight: 800,
              color: "#34d399"
            }}>
              <span>Total Paid</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="place-order-btn"
              onClick={() => onTrackOrder(delivery.deliveryId)}
              style={{ flex: 1 }}
            >
              <span>Track Live Delivery</span>
              <ArrowRight size={18} />
            </button>
            <button
              className="nav-btn"
              onClick={onClose}
              style={{ padding: "0 20px" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
