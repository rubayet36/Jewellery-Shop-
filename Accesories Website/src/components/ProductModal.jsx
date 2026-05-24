import { useState, useEffect } from "react";
import { FiX, FiHeart } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

const BROWN = "#831843";
const RUST = "#db2777";
const BEIGE = "#ffe4ef";
const LIGHT = "#fffafd";

export default function ProductModal({ product, onClose }) {
  const [selectedColor, setSelectedColor] = useState("");
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (!product) return;
    if (product.colors?.length > 0) setSelectedColor(product.colors[0]);
    // Check wishlist
    const wl = JSON.parse(localStorage.getItem("jewel_wishlist") || "[]");
    setWishlisted(wl.includes(product.id));
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  useEffect(() => {
    const esc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  if (!product) return null;

  const displayPrice =
    product.is_sale && product.sale_price
      ? Number(product.sale_price)
      : Number(product.price);

  const handleAddToCart = () => {
    addToCart(product, selectedColor, qty);
    toast(`${product.name} added to cart! 🛍️`);
  };

  const toggleWishlist = () => {
    const wl = JSON.parse(localStorage.getItem("jewel_wishlist") || "[]");
    const updated = wishlisted
      ? wl.filter((id) => id !== product.id)
      : [...wl, product.id];
    localStorage.setItem("jewel_wishlist", JSON.stringify(updated));
    setWishlisted(!wishlisted);
    toast(wishlisted ? "Removed from wishlist" : "Added to wishlist ♥", "info");
  };

  const stockStatus = () => {
    if (product.stock === undefined || product.stock === null) return null;
    if (product.stock === 0)
      return { text: "✕ Out of Stock", color: "#e74c3c" };
    if (product.stock <= 5)
      return { text: `⚡ Only ${product.stock} left!`, color: "#e67e22" };
    return { text: "✓ In Stock", color: "#27ae60" };
  };
  const stock = stockStatus();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 9990,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fffafd",
          borderRadius: "24px",
          maxWidth: "820px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          boxShadow: "0 28px 70px rgba(157,23,77,0.28)",
          animation: "scaleIn 0.25s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div
          style={{
            width: "42%",
            flexShrink: 0,
            background: "#ffeef2",
            position: "relative",
          }}
        >
          {product.is_sale && (
            <div
              style={{
                position: "absolute",
                top: "14px",
                left: "14px",
                background: RUST,
                color: "#fff",
                padding: "4px 12px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: "800",
                letterSpacing: "1px",
                zIndex: 1,
              }}
            >
              SALE
            </div>
          )}
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "56px",
              }}
            >
              💍
            </div>
          )}
        </div>

        {/* Details */}
        <div
          style={{
            flex: 1,
            padding: "28px 28px 24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {/* Top row */}
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
          >
            <button
              onClick={toggleWishlist}
              style={{
                background: wishlisted ? "#ffe4ef" : "#fff",
                border: "none",
                borderRadius: "999px",
                width: "34px",
                height: "34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <FiHeart
                size={16}
                fill={wishlisted ? "#e74c3c" : "none"}
                stroke={wishlisted ? "#e74c3c" : "#888"}
              />
            </button>
            <button
              onClick={onClose}
              style={{
                background: "#fff",
                border: "none",
                borderRadius: "999px",
                width: "34px",
                height: "34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <FiX size={16} />
            </button>
          </div>

          {/* Category */}
          {product.categories?.name && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: RUST,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              {product.categories.name}
            </span>
          )}

          {/* Name */}
          <h2
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "800",
              color: BROWN,
              lineHeight: 1.2,
            }}
          >
            {product.name}
          </h2>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "26px", fontWeight: "800", color: BROWN }}>
              ৳{displayPrice}
            </span>
            {product.is_sale && product.sale_price && (
              <span
                style={{
                  fontSize: "16px",
                  color: "#bbb",
                  textDecoration: "line-through",
                }}
              >
                ৳{product.price}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p
              style={{
                color: "#666",
                lineHeight: 1.65,
                fontSize: "14px",
                margin: 0,
              }}
            >
              {product.description}
            </p>
          )}

          {/* Design */}
          {product.design && (
            <div
              style={{
                background: LIGHT,
                borderRadius: "8px",
                padding: "10px 14px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: BROWN,
                  letterSpacing: "1px",
                }}
              >
                DESIGN
              </span>
              <p style={{ margin: "3px 0 0", fontSize: "13px", color: "#555" }}>
                {product.design}
              </p>
            </div>
          )}

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: BROWN,
                  letterSpacing: "1px",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                COLOR: <span style={{ color: RUST }}>{selectedColor}</span>
              </span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    style={{
                      padding: "6px 16px",
                      borderRadius: "999px",
                      border: `2px solid ${selectedColor === c ? RUST : "#ddd"}`,
                      background: selectedColor === c ? RUST : "#fff",
                      color: selectedColor === c ? "#fff" : "#555",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          {stock && (
            <p
              style={{
                fontSize: "13px",
                color: stock.color,
                fontWeight: "700",
                margin: 0,
              }}
            >
              {stock.text}
            </p>
          )}

          {/* Qty + Add to Cart */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "auto",
              paddingTop: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: `1.5px solid ${BEIGE}`,
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                style={{
                  padding: "10px 14px",
                  background: LIGHT,
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  color: BROWN,
                }}
              >
                −
              </button>
              <span
                style={{
                  padding: "10px 16px",
                  fontWeight: "700",
                  color: BROWN,
                  fontSize: "15px",
                }}
              >
                {qty}
              </span>
              <button
                onClick={() => setQty(Math.min(qty + 1, product.stock || 1))}
                disabled={qty >= (product.stock || 0)}
                style={{
                  padding: "10px 14px",
                  background: LIGHT,
                  border: "none",
                  cursor:
                    qty >= (product.stock || 0) ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  color: qty >= (product.stock || 0) ? "#bbb" : BROWN,
                }}
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              style={{
                flex: 1,
                padding: "12px",
                background:
                  product.stock === 0
                    ? "#ccc"
                    : RUST,
                color: "#fff",
                border: "none",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: product.stock === 0 ? "not-allowed" : "pointer",
              }}
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart 🛍️"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
