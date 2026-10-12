import React, { useState, useEffect } from 'react';
import { X, Warehouse, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function NearbyInventoryModal({ productId, onClose }) {
  const [currentId, setCurrentId] = useState(productId || "P101");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const fetchInventory = async (id) => {
    setLoading(true);
    const res = await api.getNearbyInventory(id);
    setResult(res);
    setLoading(false);
  };

  useEffect(() => {
    if (productId) {
      setCurrentId(productId);
      fetchInventory(productId);
    }
  }, [productId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <div className="cart-header-title">
            <Warehouse size={20} color="#10b981" />
            <span>Nearby Store Inventory Check</span>
          </div>
          <button className="cart-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
            Query real-time inventory from nearest dark store using REST endpoint:
            <br />
            <code style={{ color: "#34d399", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
              GET /api/inventory/nearby?productId={currentId}
            </code>
          </div>

          {/* Product ID Input & Test Controls */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            <input
              type="text"
              value={currentId}
              onChange={(e) => setCurrentId(e.target.value)}
              placeholder="e.g. P101, P102, P999"
              style={{
                flex: 1,
                background: "#090d16",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "8px 12px",
                color: "#fff",
                fontSize: "14px",
                fontFamily: "var(--font-mono)"
              }}
            />
            <button
              className="add-btn"
              onClick={() => fetchInventory(currentId)}
              disabled={loading}
            >
              {loading ? "Checking..." : "Check Stock"}
            </button>
          </div>

          {/* Quick test buttons */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", alignSelf: "center" }}>
              Quick Test:
            </span>
            <button
              className="chip-btn"
              onClick={() => { setCurrentId("P101"); fetchInventory("P101"); }}
            >
              P101 (Milk - In Stock)
            </button>
            <button
              className="chip-btn"
              onClick={() => { setCurrentId("P112"); fetchInventory("P112"); }}
            >
              P112 (Out of Stock)
            </button>
            <button
              className="chip-btn"
              onClick={() => { setCurrentId("P999"); fetchInventory("P999"); }}
            >
              P999 (404 Test)
            </button>
          </div>

          {/* Results display */}
          {result && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>
                  HTTP Response:
                </span>
                <span className={`status-badge s${result.status}`}>
                  {result.status} {result.statusText} ({result.durationMs}ms)
                </span>
              </div>

              {result.status === 200 ? (
                <div style={{
                  background: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  marginBottom: "16px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontSize: "16px", fontWeight: 800, color: "#fff" }}>
                      {result.data.productName}
                    </span>
                    <span className={`product-stock-pill ${result.data.inStock ? 'in-stock' : 'out-of-stock'}`}>
                      {result.data.inStock ? `In Stock (${result.data.availableQuantity} units)` : "Out of Stock"}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Store ID:</span>
                      <div style={{ fontWeight: 700, color: "#38bdf8", fontFamily: "var(--font-mono)" }}>
                        {result.data.storeId}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Store Name:</span>
                      <div style={{ fontWeight: 700, color: "#fff" }}>
                        {result.data.storeName}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Available Quantity:</span>
                      <div style={{ fontWeight: 800, fontSize: "16px", color: result.data.inStock ? "#34d399" : "#f43f5e" }}>
                        {result.data.availableQuantity} units
                      </div>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Estimated Delivery:</span>
                      <div style={{ fontWeight: 700, color: "#f59e0b" }}>
                        ⚡ {result.data.deliveryTimeMinutes} minutes
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: "rgba(244, 63, 94, 0.1)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  borderRadius: "var(--radius-md)",
                  padding: "14px",
                  color: "#fda4af",
                  fontSize: "13.5px",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <AlertTriangle size={20} color="#f43f5e" />
                  <div>
                    <strong>404 Not Found:</strong> {result.data?.message || "Product does not exist in any dark store."}
                  </div>
                </div>
              )}

              {/* Raw JSON */}
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
                Raw JSON Payload:
              </div>
              <pre className="code-block">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
