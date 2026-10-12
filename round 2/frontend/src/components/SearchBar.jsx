import React from 'react';
import { Search, X, Sparkles } from 'lucide-react';

const CATEGORIES = [
  "All Items",
  "Dairy & Breakfast",
  "Bakery",
  "Fresh Produce",
  "Beverages",
  "Snacks & Sweets",
  "Cooking Essentials"
];

const QUICK_KEYWORDS = ["milk", "bread", "eggs", "avocados", "coffee", "yogurt", "olive oil"];

export default function SearchBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange
}) {
  return (
    <div className="search-container">
      {/* Search Input Box */}
      <div className="search-box-wrapper">
        <Search className="search-icon-left" size={20} />
        <input
          type="text"
          className="search-input"
          placeholder='Search "milk", "bread", "eggs", or product name (GET /api/products/search?q=...)'
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            className="search-clear-btn"
            onClick={() => onSearchChange("")}
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Quick Search Chips */}
      <div className="quick-chips-wrapper">
        <span className="chip-label">
          <Sparkles size={12} style={{ display: 'inline', marginRight: 4, color: '#f59e0b' }} />
          Trending Queries:
        </span>
        {QUICK_KEYWORDS.map((kw) => (
          <button
            key={kw}
            className="chip-btn"
            onClick={() => onSearchChange(kw)}
          >
            "{kw}"
          </button>
        ))}
      </div>

      {/* Category Pills */}
      <div className="category-pills-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
