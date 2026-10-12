import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import { Sparkles, ShoppingBag, ArrowDownUp } from 'lucide-react';

export default function ShopPage({
  products,
  cart,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onAddToCart,
  onUpdateQuantity,
  onCheckInventory
}) {
  const [sortBy, setSortBy] = useState("default");

  // Filter products by category if selected
  const filteredProducts = products.filter(p => {
    if (selectedCategory && selectedCategory !== "All Items") {
      return p.category === selectedCategory;
    }
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return 0;
  });

  // Map cart items by productId for fast lookup
  const cartMap = {};
  if (cart && cart.items) {
    cart.items.forEach(item => {
      cartMap[item.productId] = item.quantity;
    });
  }

  return (
    <div>
      {/* Hero Header */}
      <section className="hero-section">
        <div className="hero-tagline">
          <Sparkles size={14} /> Hyperlocal Quick-Commerce
        </div>
        <h1 className="hero-title">
          Groceries Delivered in <span>10 Minutes</span>
        </h1>
        <p className="hero-subtitle">
          Real-time catalog search, dark store inventory reservation, and live rider tracking powered by Round 2 Low-Level Design REST APIs.
        </p>

        {/* Live Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      </section>

      {/* Product Catalog Section */}
      <div className="section-header">
        <div className="section-title">
          <ShoppingBag size={20} color="#10b981" />
          <span>
            {searchQuery ? `Search Results for "${searchQuery}"` : selectedCategory}
          </span>
          <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 500 }}>
            ({sortedProducts.length} items)
          </span>
        </div>

        {/* Sorting selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ArrowDownUp size={14} color="#94a3b8" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              padding: "6px 10px",
              color: "#fff",
              fontSize: "12.5px"
            }}
          >
            <option value="default" style={{ background: "#111726" }}>Featured First</option>
            <option value="price-low" style={{ background: "#111726" }}>Price: Low to High</option>
            <option value="price-high" style={{ background: "#111726" }}>Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {sortedProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">No products match "{searchQuery}"</div>
          <div className="empty-desc">
            The API returned an empty JSON array <code>[]</code> as specified in Round 2 requirements. Try searching for "milk", "bread", or clear your filter.
          </div>
          <button
            className="add-btn"
            onClick={() => { onSearchChange(""); onCategoryChange("All Items"); }}
          >
            Reset Search & Filters
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.productId}
              product={product}
              cartQuantity={cartMap[product.productId] || 0}
              onAddToCart={onAddToCart}
              onUpdateQuantity={onUpdateQuantity}
              onCheckInventory={onCheckInventory}
            />
          ))}
        </div>
      )}
    </div>
  );
}
