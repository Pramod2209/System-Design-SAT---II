import React, { useState, useEffect } from 'react';
import { 
  Bike, PackageCheck, CheckCircle2, Clock, MapPin, 
  RefreshCw, Play, Pause, ChevronRight, Phone, AlertTriangle, ShieldCheck 
} from 'lucide-react';
import { api } from '../services/api';

const STATUS_STEPS = [
  { key: "ASSIGNED", label: "Partner Assigned", desc: "Order assigned to nearest rider" },
  { key: "PICKED_UP", label: "Order Picked Up", desc: "Packed from Koramangala Hub" },
  { key: "OUT_FOR_DELIVERY", label: "Out For Delivery", desc: "Rider on the way to your door" },
  { key: "DELIVERED", label: "Delivered", desc: "Order received safely" }
];

export default function DeliveryTracker({ selectedDeliveryId, onSelectDeliveryId }) {
  const [deliveryIdInput, setDeliveryIdInput] = useState(selectedDeliveryId || "DEL-5001");
  const [deliveryData, setDeliveryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchStatus = async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const res = await api.getDeliveryStatus(id);

    if (res.ok) {
      setDeliveryData(res.data);
    } else {
      setError(res.data?.message || `Delivery ID '${id}' not found (HTTP ${res.status}).`);
      setDeliveryData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedDeliveryId) {
      setDeliveryIdInput(selectedDeliveryId);
      fetchStatus(selectedDeliveryId);
    }
  }, [selectedDeliveryId]);

  // Advance delivery status step
  const handleAdvanceStep = async () => {
    if (!deliveryData) return;
    const res = await api.advanceDeliveryStatus(deliveryData.deliveryId);
    if (res.ok) {
      fetchStatus(deliveryData.deliveryId);
    }
  };

  // Auto-simulation timer
  useEffect(() => {
    let timer;
    if (isSimulating && deliveryData && deliveryData.status !== "DELIVERED") {
      timer = setTimeout(async () => {
        await handleAdvanceStep();
      }, 4000);
    } else if (deliveryData?.status === "DELIVERED") {
      setIsSimulating(false);
    }
    return () => clearTimeout(timer);
  }, [isSimulating, deliveryData]);

  const currentStepIndex = deliveryData
    ? STATUS_STEPS.findIndex(s => s.key === deliveryData.status)
    : 0;

  const progressPercent = currentStepIndex >= 0
    ? (currentStepIndex / (STATUS_STEPS.length - 1)) * 100
    : 0;

  return (
    <div className="tracking-card">
      {/* Top Search / Delivery ID Input */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border-subtle)",
        paddingBottom: "18px",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
            <Bike size={22} color="#10b981" />
            Live Hyperlocal Delivery Tracking
          </h2>
          <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Endpoint: <code style={{ color: "#38bdf8", fontFamily: "var(--font-mono)" }}>GET /api/deliveries/:deliveryId/status</code>
          </p>
        </div>

        {/* Input Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="text"
            value={deliveryIdInput}
            onChange={(e) => setDeliveryIdInput(e.target.value)}
            placeholder="e.g. DEL-5001"
            style={{
              background: "#090d16",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              padding: "8px 12px",
              color: "#fff",
              fontSize: "13.5px",
              fontFamily: "var(--font-mono)",
              width: "160px"
            }}
          />
          <button
            className="nav-btn"
            onClick={() => fetchStatus(deliveryIdInput)}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            Track
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          padding: "16px",
          background: "rgba(244, 63, 94, 0.1)",
          border: "1px solid rgba(244, 63, 94, 0.3)",
          borderRadius: "var(--radius-md)",
          color: "#fda4af",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px"
        }}>
          <AlertTriangle size={20} color="#f43f5e" />
          <div>
            <strong>HTTP 404 / Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Active Tracking Content */}
      {deliveryData && (
        <div>
          {/* Tracking Header Details */}
          <div className="tracking-header">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "#fff", fontFamily: "var(--font-mono)" }}>
                  {deliveryData.deliveryId}
                </span>
                <span className={`tracking-status-pill status-${deliveryData.status.toLowerCase()}`}>
                  ● {deliveryData.status.replace(/_/g, " ")}
                </span>
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "4px" }}>
                Associated Order: <strong style={{ color: "#38bdf8", fontFamily: "var(--font-mono)" }}>{deliveryData.orderId}</strong>
              </div>
            </div>

            {/* Simulation controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                className="add-btn"
                onClick={handleAdvanceStep}
                disabled={deliveryData.status === "DELIVERED"}
                title="Advance to next status in LLD state machine"
              >
                <span>Advance Step</span>
                <ChevronRight size={16} />
              </button>

              <button
                className={`nav-btn ${isSimulating ? 'active' : ''}`}
                onClick={() => setIsSimulating(!isSimulating)}
                disabled={deliveryData.status === "DELIVERED"}
                title="Auto-advance status every 4 seconds"
              >
                {isSimulating ? <Pause size={14} /> : <Play size={14} />}
                <span>{isSimulating ? "Pause Auto" : "Auto Simulate"}</span>
              </button>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="stepper-timeline">
            {/* Background and fill line */}
            <div
              className="stepper-progress-fill"
              style={{ width: `calc(${progressPercent}% * 0.9 + 20px)` }}
            />

            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isActive = idx === currentStepIndex;
              return (
                <div key={step.key} className="timeline-step">
                  <div className={`step-node ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                    {isCompleted ? (
                      <CheckCircle2 size={20} color="#064e3b" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <div className={`step-label ${isActive || isCompleted ? 'active' : ''}`}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: "10.5px", color: "var(--text-muted)", maxWidth: "120px", marginTop: "2px" }}>
                    {step.desc}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rider Profile & Vehicle Information */}
          <div className="rider-card">
            <div className="rider-avatar">
              {deliveryData.partnerName ? deliveryData.partnerName[0] : "R"}
            </div>
            <div className="rider-info">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="rider-name">{deliveryData.partnerName}</span>
                <span style={{
                  fontSize: "11px",
                  background: "rgba(59, 130, 246, 0.2)",
                  color: "#93c5fd",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)"
                }}>
                  {deliveryData.partnerId}
                </span>
                <span style={{ fontSize: "12px", color: "#f59e0b", display: "flex", alignItems: "center", gap: "2px" }}>
                  ⭐ {deliveryData.partnerRating}
                </span>
              </div>
              <div className="rider-meta" style={{ marginTop: "3px" }}>
                {deliveryData.vehicle} • {deliveryData.partnerPhone}
              </div>
            </div>

            <div style={{
              textAlign: "right",
              borderLeft: "1px solid var(--border-subtle)",
              paddingLeft: "16px"
            }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>ESTIMATED TIME</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#34d399" }}>
                {deliveryData.status === "DELIVERED" ? "Completed" : `⚡ ${deliveryData.estimatedDeliveryMins || 10} Mins`}
              </div>
            </div>
          </div>

          {/* Status Progression Audit Trail */}
          {deliveryData.statusHistory && deliveryData.statusHistory.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>
                Status Transition Audit Log:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {deliveryData.statusHistory.map((hist, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      background: "rgba(255, 255, 255, 0.02)",
                      padding: "6px 12px",
                      borderRadius: "var(--radius-sm)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="status-badge s200" style={{ fontSize: "11px" }}>{hist.status}</span>
                      <span style={{ color: "var(--text-secondary)" }}>{hist.note}</span>
                    </div>
                    <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                      {new Date(hist.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
