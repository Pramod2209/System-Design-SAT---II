import React from 'react';
import { Plus, Minus, Warehouse, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProductCard({
  product,
  cartQuantity = 0,
  onAddToCart,
  onUpdateQuantity,
  onCheckInventory
}) {
  const isOutOfStock = !product.inStock || product.availableQuantity === 0;

  return (
    <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
      {/* Product Image & Badges */}
      <div className="product-image-container">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        <span className="product-badge-category">{product.category}</span>
        
        {isOutOfStock ? (
          <span className="product-stock-pill out-of-stock">Out of Stock</span>
        ) : product.availableQuantity <= 5 ? (
          <span className="product-stock-pill low-stock">Only {product.availableQuantity} left</span>
        ) : (
          <span className="product-stock-pill in-stock">
            ✓ In Stock ({product.availableQuantity})
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="product-body">
        <div className="product-brand">{product.brand || "Fresh"}</div>
        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>
        <div className="product-unit">{product.unit}</div>

        {/* Price & Add to Cart */}
        <div className="product-meta-row">
          <div className="product-price-box">
            <span className="product-price">₹{product.price}</span>
            <span className="product-id-tag">ID: {product.productId}</span>
          </div>

          <div>
            {isOutOfStock ? (
              <button className="add-btn" disabled>
                Sold Out
              </button>
            ) : cartQuantity === 0 ? (
              <button
                className="add-btn"
                onClick={() => onAddToCart(product.productId, 1)}
              >
                <Plus size={16} />
                <span>ADD</span>
              </button>
            ) : (
              <div className="qty-stepper">
                <button
                  className="stepper-btn"
                  onClick={() => onUpdateQuantity(product.productId, cartQuantity - 1)}
                  title="Decrease"
                >
                  <Minus size={14} />
                </button>
                <span className="stepper-val">{cartQuantity}</span>
                <button
                  className="stepper-btn"
                  disabled={cartQuantity >= product.availableQuantity}
                  onClick={() => onUpdateQuantity(product.productId, cartQuantity + 1)}
                  title="Increase"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Nearby Inventory Quick Query Button */}
        <button
          className="inventory-check-btn"
          onClick={() => onCheckInventory(product.productId)}
          title="Verify stock via GET /api/inventory/nearby"
        >
          <Warehouse size={12} />
          <span>Check Nearby Dark Store Inventory</span>
        </button>
      </div>
    </div>
  );
}
