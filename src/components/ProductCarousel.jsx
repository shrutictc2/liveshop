import { useState } from "react";
import "./ProductCarousel.css";

const PRODUCTS = [
  { id: "p1", name: "Cloud Knit Sweater", price: 42, color: "#8B7FD1" },
  { id: "p2", name: "Ridge Trail Sneakers", price: 68, color: "#FF3B5C" },
  { id: "p3", name: "Terra Ceramic Mug", price: 18, color: "#FFB84D" },
  { id: "p4", name: "Linen Weekend Tote", price: 34, color: "#5FB3A3" },
];

function ProductSwatch({ color }) {
  return (
    <div className="product-card__swatch" style={{ background: color }} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="28" height="28">
        <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export default function ProductCarousel({ onSelect }) {
  const [activeId, setActiveId] = useState(null);

  return (
    <div className="product-carousel" role="list" aria-label="Products featured in this stream">
      {PRODUCTS.map((product) => (
        <button
          key={product.id}
          role="listitem"
          className={`product-card${activeId === product.id ? " product-card--active" : ""}`}
          onClick={() => {
            setActiveId(product.id);
            onSelect?.(product);
          }}
        >
          <ProductSwatch color={product.color} />
          <div className="product-card__name">{product.name}</div>
          <div className="product-card__price">${product.price}</div>
        </button>
      ))}
    </div>
  );
}
