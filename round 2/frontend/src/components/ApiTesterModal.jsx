import React, { useState } from 'react';
import { X, Terminal, Send, CheckCircle2, RotateCcw, Copy, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

const ENDPOINTS = [
  {
    id: "search",
    title: "1. Product Search",
    method: "GET",
    path: "/api/products/search?q=milk",
    desc: "Search products by name. Returns matching JSON array or empty array.",
    defaultParam: "milk"
  },
  {
    id: "inventory",
    title: "2. Nearby Inventory",
    method: "GET",
    path: "/api/inventory/nearby?productId=P101",
    desc: "Display storeId, quantity, and inStock boolean. 404 if not found.",
    defaultParam: "P101"
  },
  {
    id: "cart",
    title: "3. Add Product to Cart",
    method: "POST",
    path: "/api/cart/items",
    desc: "Validates payload, positive quantity, product existence. Returns 201 or 400/404/409.",
    defaultBody: JSON.stringify({ userId: "U101", productId: "P101", quantity: 2 }, null, 2)
  },
  {
    id: "order",
    title: "4. & 5. Place Order & Partner Assignment",
    method: "POST",
    path: "/api/orders",
    desc: "Validates non-empty cart, reserves stock, creates order ID, assigns delivery partner.",
    defaultBody: JSON.stringify({ userId: "U101" }, null, 2)
  },
  {
    id: "delivery",
    title: "6. Delivery Status",
    method: "GET",
    path: "/api/deliveries/DEL-5001/status",
    desc: "Returns deliveryId, orderId, partnerId, and status (ASSIGNED, PICKED_UP, etc.).",
    defaultParam: "DEL-5001"
  }
];

export default function ApiTesterModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(ENDPOINTS[0].id);
  const [paramInput, setParamInput] = useState("milk");
  const [bodyInput, setBodyInput] = useState(ENDPOINTS[2].defaultBody);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [copied, setCopied] = useState(false);

  const currentEndpoint = ENDPOINTS.find(e => e.id === activeTab);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setResponse(null);
    const ep = ENDPOINTS.find(e => e.id === tabId);
    if (ep.defaultParam) setParamInput(ep.defaultParam);
    if (ep.defaultBody) setBodyInput(ep.defaultBody);
  };

  const handleSend = async () => {
    setLoading(true);
    let res = null;

    if (activeTab === "search") {
      res = await api.searchProducts(paramInput);
    } else if (activeTab === "inventory") {
      res = await api.getNearbyInventory(paramInput);
    } else if (activeTab === "cart") {
      try {
        const parsed = JSON.parse(bodyInput);
        res = await api.addToCart(parsed.userId, parsed.productId, parsed.quantity, parsed.mode);
      } catch (e) {
        res = { ok: false, status: 400, statusText: "JSON Syntax Error", data: { error: e.message } };
      }
    } else if (activeTab === "order") {
      try {
        const parsed = JSON.parse(bodyInput);
        res = await api.placeOrder(parsed.userId);
      } catch (e) {
        res = { ok: false, status: 400, statusText: "JSON Syntax Error", data: { error: e.message } };
      }
    } else if (activeTab === "delivery") {
      res = await api.getDeliveryStatus(paramInput);
    }

    setResponse(res);
    setLoading(false);
  };

  const handleResetData = async () => {
    if (window.confirm("Reset in-memory data store to initial state?")) {
      const res = await api.resetStore();
      alert(res.data?.message || "Store reset successfully!");
      setResponse(res);
    }
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "720px" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-title">
            <Terminal size={20} color="#6366f1" />
            <span>Round 2 REST API Explorer</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              className="chip-btn"
              onClick={handleResetData}
              title="Reset backend catalog & inventory"
              style={{ color: "#f59e0b", borderColor: "rgba(245, 158, 11, 0.4)" }}
            >
              <RotateCcw size={12} style={{ display: 'inline', marginRight: 4 }} />
              Reset Store
            </button>
            <button className="cart-close-btn" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="api-tester-container">
          {/* Endpoint Tabs */}
          <div className="api-tabs">
            {ENDPOINTS.map(ep => (
              <button
                key={ep.id}
                className={`api-tab-btn ${activeTab === ep.id ? 'active' : ''}`}
                onClick={() => handleTabChange(ep.id)}
              >
                <span style={{
                  color: ep.method === 'GET' ? '#38bdf8' : '#34d399',
                  fontWeight: 800,
                  marginRight: 6
                }}>
                  {ep.method}
                </span>
                {ep.title}
              </button>
            ))}
          </div>

          {/* Endpoint Description */}
          <div style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            background: "rgba(255, 255, 255, 0.02)",
            padding: "10px 14px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-subtle)",
            marginBottom: "16px"
          }}>
            <div style={{ fontWeight: 700, color: "#fff", marginBottom: "2px" }}>
              {currentEndpoint.desc}
            </div>
            <code style={{ color: "#34d399", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
              {currentEndpoint.method} {currentEndpoint.path}
            </code>
          </div>

          {/* Input Controls */}
          {currentEndpoint.method === "GET" ? (
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                {activeTab === "search" ? "Query String (q):" : activeTab === "inventory" ? "Product ID (productId):" : "Delivery ID (deliveryId):"}
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={paramInput}
                  onChange={(e) => setParamInput(e.target.value)}
                  style={{
                    flex: 1,
                    background: "#090d16",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 12px",
                    color: "#fff",
                    fontFamily: "var(--font-mono)",
                    fontSize: "14px"
                  }}
                />
                <button
                  className="add-btn"
                  onClick={handleSend}
                  disabled={loading}
                >
                  <Send size={14} />
                  <span>{loading ? "Sending..." : "Send Request"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                JSON Request Body:
              </label>
              <textarea
                rows={5}
                value={bodyInput}
                onChange={(e) => setBodyInput(e.target.value)}
                style={{
                  width: "100%",
                  background: "#090d16",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 12px",
                  color: "#38bdf8",
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  resize: "vertical"
                }}
              />
              <button
                className="add-btn"
                onClick={handleSend}
                disabled={loading}
                style={{ marginTop: "8px" }}
              >
                <Send size={14} />
                <span>{loading ? "Sending..." : "Send Request"}</span>
              </button>
            </div>
          )}

          {/* Response Output */}
          {response && (
            <div>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
                marginTop: "16px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    HTTP Status:
                  </span>
                  <span className={`status-badge s${response.status}`}>
                    {response.status} {response.statusText}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    ({response.durationMs}ms)
                  </span>
                </div>

                <button
                  onClick={copyResponse}
                  style={{
                    background: "transparent",
                    color: "var(--text-secondary)",
                    fontSize: "11.5px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <Copy size={12} />
                  {copied ? "Copied!" : "Copy JSON"}
                </button>
              </div>

              <pre className="code-block" style={{ maxHeight: "240px" }}>
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
