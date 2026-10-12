import React from 'react';
import { ShoppingBag, Zap, MapPin, User, Terminal, PackageCheck } from 'lucide-react';

export default function Navbar({
  currentUser,
  onUserChange,
  activeTab,
  onTabChange,
  cartTotalCount,
  cartTotalAmount,
  onOpenCart,
  onOpenApiTester
}) {
  const users = [
    { id: "U101", name: "Rahul Sharma (U101)" },
    { id: "U102", name: "Ananya Patel (U102)" },
    { id: "U103", name: "Devansh Mehta (U103)" }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand-wrapper" onClick={() => onTabChange("shop")}>
          <div className="brand-logo-icon">
            <Zap size={22} fill="white" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="brand-title">FlashBlink</span>
              <span className="brand-badge">10 Mins</span>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              Round 2 LLD Quick-Commerce
            </div>
          </div>
        </div>

        {/* Hyperlocal Dark Store Indicator */}
        <div className="store-location-badge">
          <span className="live-dot" />
          <MapPin size={14} color="#10b981" />
          <span>Hub #14: Koramangala (STORE_BLR_01)</span>
        </div>

        {/* Actions */}
        <div className="nav-actions">
          {/* User selector */}
          <div className="user-selector" title="Switch User for Cart & Orders">
            <User size={14} color="#94a3b8" />
            <select
              value={currentUser}
              onChange={(e) => onUserChange(e.target.value)}
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Buttons */}
          <button
            className={`nav-btn ${activeTab === 'shop' ? 'active' : ''}`}
            onClick={() => onTabChange('shop')}
          >
            Shop
          </button>

          <button
            className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => onTabChange('orders')}
          >
            <PackageCheck size={16} />
            Orders & Tracking
          </button>

          <button
            className="nav-btn"
            style={{ color: "#a5b4fc", borderColor: "rgba(99, 102, 241, 0.4)" }}
            onClick={onOpenApiTester}
            title="Inspect & Test Round 2 REST APIs"
          >
            <Terminal size={16} />
            API Explorer
          </button>

          {/* Cart Button */}
          <button className="cart-btn-nav" onClick={onOpenCart}>
            <ShoppingBag size={18} />
            <span>₹{cartTotalAmount}</span>
            <span className="cart-counter-badge">{cartTotalCount}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
