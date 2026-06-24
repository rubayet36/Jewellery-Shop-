import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../utils/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footers";
import Products from "../components/Products";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { FiChevronLeft, FiChevronRight, FiX, FiHeart, FiMinus, FiPlus } from "react-icons/fi";

const BROWN = "#831843";
const RUST = "#db2777";
const BEIGE = "#ffe4ef";
const LIGHT = "#fffafd";
const LIGHT_BEIGE = "#fffafd";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState("");
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeImage, setActiveImage] = useState("");
  
  // Zoomed Lightbox states
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*, categories(name)")
          .eq("id", id)
          .single();

        if (error || !data) {
          console.error("Error loading product:", error);
          toast("Product not found!", "error");
          navigate("/shop");
          return;
        }

        setProduct(data);
        setActiveImage(data.image_url || "");
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        } else {
          setSelectedColor("");
        }

        // Check Wishlist
        const wl = JSON.parse(localStorage.getItem("jewel_wishlist") || "[]");
        setWishlisted(wl.includes(data.id));

        // Load similar products in same category
        if (data.category_id) {
          const { data: similar } = await supabase
            .from("products")
            .select("*, categories(name)")
            .eq("category_id", data.category_id)
            .neq("id", data.id)
            .limit(4);
          if (similar) setSimilarProducts(similar);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
    // Scroll to top when product ID changes
    window.scrollTo(0, 0);
  }, [id]);

  const allImages = [
    product?.image_url,
    ...(Array.isArray(product?.additional_images)
      ? product.additional_images
      : product?.additional_images
      ? product.additional_images.split(",").map((img) => img.trim()).filter(Boolean)
      : []),
  ].filter(Boolean);

  // Sync zoom index when lightbox opens
  const handleZoomOpen = () => {
    const idx = allImages.indexOf(activeImage);
    setZoomIndex(idx !== -1 ? idx : 0);
    setIsZoomed(true);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setZoomIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setZoomIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isZoomed) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setZoomIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
      } else if (e.key === "ArrowRight") {
        setZoomIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
      } else if (e.key === "Escape") {
        setIsZoomed(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomed, allImages]);

  if (loading) {
    return (
      <div style={{ background: LIGHT_BEIGE, minHeight: "100vh" }}>
        <Navbar solid />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: RUST }} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  const displayPrice =
    product.is_sale && product.sale_price
      ? Number(product.sale_price)
      : Number(product.price);

  const handleAddToCart = () => {
    if (product.stock === 0 && !product.is_preorder) return;
    addToCart(product, selectedColor, qty);
    toast(`${product.name} added to cart! 🛍️`);
  };

  const toggleWishlist = () => {
    const wl = JSON.parse(localStorage.getItem("jewel_wishlist") || "[]");
    const updated = wishlisted
      ? wl.filter((wId) => wId !== product.id)
      : [...wl, product.id];
    localStorage.setItem("jewel_wishlist", JSON.stringify(updated));
    setWishlisted(!wishlisted);
    toast(wishlisted ? "Removed from wishlist" : "Added to wishlist ♥", "info");
  };

  const stockStatus = () => {
    if (product.is_preorder) {
      return { text: `📦 Preorder (ships in ${product.preorder_days || 15} days)`, color: "#e67e22" };
    }
    if (product.stock === undefined || product.stock === null) return null;
    if (product.stock === 0)
      return { text: "✕ Out of Stock", color: "#e74c3c" };
    if (product.stock <= 5)
      return { text: `⚡ Only ${product.stock} left!`, color: "#e67e22" };
    return { text: "✓ In Stock", color: "#27ae60" };
  };
  const stock = stockStatus();

  return (
    <div style={{ background: LIGHT_BEIGE, minHeight: "100vh" }}>
      <Navbar solid />

      {/* Main Container */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "120px 40px 60px" }}>
        
        {/* Breadcrumbs */}
        <p style={{ color: "rgba(131, 24, 67, 0.6)", fontSize: "12px", letterSpacing: "1.5px", marginBottom: "32px", textTransform: "uppercase" }}>
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link> &nbsp;/&nbsp;&nbsp;
          <Link to="/shop" style={{ color: "inherit", textDecoration: "none" }}>Shop</Link> &nbsp;/&nbsp;&nbsp;
          <span style={{ color: BROWN, fontWeight: "700" }}>{product.categories?.name || product.category}</span>
        </p>

        {/* Product Layout Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "48px", alignItems: "start" }}>
          
          {/* Column Left: Gallery */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Main Image View */}
            <div 
              style={{ 
                height: "450px", 
                background: "#ffeef2", 
                borderRadius: "28px", 
                border: `3px solid ${BEIGE}`,
                boxShadow: "0 12px 28px rgba(255,93,143,0.06)",
                overflow: "hidden", 
                position: "relative",
                cursor: "zoom-in"
              }}
              onClick={handleZoomOpen}
            >
              {product.is_sale && (
                <div style={{ position: "absolute", top: "16px", left: "16px", background: RUST, color: "#fff", padding: "4px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: "800", letterSpacing: "1px", zIndex: 5 }}>
                  SALE ✨
                </div>
              )}
              {activeImage ? (
                <img 
                  src={activeImage} 
                  alt={product.name} 
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", fontSize: "72px" }}>💍</div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {allImages.length > 1 && (
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                {allImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt=""
                    onClick={() => setActiveImage(img)}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      cursor: "pointer",
                      border: activeImage === img ? `2.5px solid ${RUST}` : `2.5px solid ${BEIGE}`,
                      boxShadow: "0 4px 10px rgba(255,93,143,0.04)",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Column Right: Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Category / Name */}
            <div>
              <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: "800", color: RUST, letterSpacing: "1.5px", textTransform: "uppercase" }}>
                {product.categories?.name || product.category}
              </p>
              <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "800", color: BROWN, lineHeight: 1.25 }}>
                {product.name}
              </h1>
            </div>

            {/* Price and Stock Row */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "28px", fontWeight: "800", color: BROWN }}>
                ৳{displayPrice}
              </span>
              {product.is_sale && product.sale_price && (
                <span style={{ fontSize: "16px", color: "#ccc", textDecoration: "line-through" }}>
                  ৳{product.price}
                </span>
              )}

              {/* Stock status pill */}
              {stock && (
                <span style={{
                  padding: "4px 14px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: "700",
                  background: stock.color + "12",
                  color: stock.color,
                  border: `1px solid ${stock.color}33`
                }}>
                  {stock.text}
                </span>
              )}
            </div>

            {/* Description */}
            <p style={{ margin: 0, fontSize: "14px", color: "#6c5a62", lineHeight: 1.6 }}>
              {product.description}
            </p>

            {/* Design Specifications (if any) */}
            {product.design && (
              <div style={{ background: "#fff", padding: "16px 20px", borderRadius: "18px", border: `1.5px solid ${BEIGE}` }}>
                <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "800", color: RUST, letterSpacing: "1px", textTransform: "uppercase" }}>
                  Design Details ✨
                </p>
                <p style={{ margin: 0, fontSize: "13px", color: "#5c3d4c" }}>
                  {product.design}
                </p>
              </div>
            )}

            {/* Options Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "800", color: BROWN, letterSpacing: "0.5px" }}>
                  SELECT COLOR:
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {product.colors.map((col) => (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      style={{
                        padding: "6px 16px",
                        borderRadius: "999px",
                        border: selectedColor === col ? `2px solid ${RUST}` : "2.5px solid #eee",
                        background: selectedColor === col ? "#fff5f8" : "#fff",
                        color: selectedColor === col ? RUST : "#666",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {(product.stock > 0 || product.is_preorder) && (
              <div>
                <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "800", color: BROWN, letterSpacing: "0.5px" }}>
                  QUANTITY:
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    onClick={() => setQty((q) => Math.max(q - 1, 1))}
                    style={{ width: "36px", height: "36px", border: "1.5px solid #ddd", borderRadius: "10px", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyBox: "center", justifyContent: "center" }}
                  >
                    <FiMinus size={14} />
                  </button>
                  <span style={{ fontSize: "16px", fontWeight: "800", color: BROWN, minWidth: "24px", textAlign: "center" }}>
                    {qty}
                  </span>
                  <button
                    onClick={() => {
                      const maxQty = product.is_preorder ? 99 : (product.stock || Infinity);
                      setQty((q) => Math.min(q + 1, maxQty));
                    }}
                    disabled={qty >= (product.is_preorder ? 99 : (product.stock || Infinity))}
                    style={{ width: "36px", height: "36px", border: "1.5px solid #ddd", borderRadius: "10px", background: qty >= (product.is_preorder ? 99 : (product.stock || Infinity)) ? "#f5f5f5" : "#fff", cursor: qty >= (product.is_preorder ? 99 : (product.stock || Infinity)) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Actions: Add to Cart / Wishlist */}
            <div style={{ display: "flex", gap: "12px", marginTop: "12px", alignItems: "center" }}>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 && !product.is_preorder}
                className="cute-bubble-btn"
                style={{
                  flex: 1,
                  background: product.stock === 0 && !product.is_preorder ? "#ccc" : RUST,
                  color: "#fff",
                  border: "none",
                  borderRadius: "999px",
                  padding: "16px",
                  fontSize: "15px",
                  fontWeight: "800",
                  cursor: product.stock === 0 && !product.is_preorder ? "not-allowed" : "pointer",
                  boxShadow: product.stock === 0 && !product.is_preorder ? "none" : "0 8px 24px rgba(255,93,143,0.22)",
                  transition: "all 0.25s"
                }}
              >
                {product.stock === 0 && !product.is_preorder ? "SOLD OUT 🧸" : product.is_preorder ? "PREORDER NOW 📦" : "ADD TO CART 🛍️"}
              </button>

              <button
                onClick={toggleWishlist}
                style={{
                  background: wishlisted ? "#ffe4ef" : "#fff",
                  border: `2px solid ${wishlisted ? RUST : "#eee"}`,
                  borderRadius: "16px",
                  width: "52px",
                  height: "52px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                  transition: "all 0.2s"
                }}
              >
                <FiHeart size={20} fill={wishlisted ? "#e74c3c" : "none"} stroke={wishlisted ? "#e74c3c" : RUST} />
              </button>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div style={{ marginTop: "80px", paddingTop: "48px", borderTop: `1.5px solid ${BEIGE}` }}>
            <h2 style={{ textAlign: "center", color: BROWN, fontSize: "26px", fontWeight: "800", marginBottom: "36px" }}>
              You May Also Love 🌸
            </h2>
            <Products products={similarProducts} />
          </div>
        )}
      </div>

      {/* Lightbox / Zoomed image Modal with Arrow keys & buttons support */}
      {isZoomed && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setIsZoomed(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setIsZoomed(false)}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "#fff",
              borderRadius: "50%",
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "22px",
              fontWeight: "bold",
              zIndex: 10005,
              transition: "background 0.2s"
            }}
          >
            <FiX size={20} />
          </button>

          {/* Left Navigation Arrow */}
          {allImages.length > 1 && (
            <button
              onClick={handlePrevImage}
              style={{
                position: "absolute",
                left: "24px",
                background: "rgba(255,255,255,0.15)",
                border: "none",
                color: "#fff",
                borderRadius: "50%",
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 10005,
                transition: "background 0.2s"
              }}
            >
              <FiChevronLeft size={24} />
            </button>
          )}

          {/* Next Navigation Arrow */}
          {allImages.length > 1 && (
            <button
              onClick={handleNextImage}
              style={{
                position: "absolute",
                right: "24px",
                background: "rgba(255,255,255,0.15)",
                border: "none",
                color: "#fff",
                borderRadius: "50%",
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 10005,
                transition: "background 0.2s"
              }}
            >
              <FiChevronRight size={24} />
            </button>
          )}

          {/* Lightbox Main Image */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <img
              src={allImages[zoomIndex]}
              alt={product.name}
              style={{
                maxWidth: "85vw",
                maxHeight: "85vh",
                objectFit: "contain",
                borderRadius: "16px",
                boxShadow: "0 24px 50px rgba(0,0,0,0.5)",
                animation: "scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) ease",
              }}
              onClick={(e) => e.stopPropagation()}
            />
            {/* Index Counter Indicator */}
            {allImages.length > 1 && (
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", fontWeight: "700", background: "rgba(0,0,0,0.4)", padding: "4px 16px", borderRadius: "999px" }}>
                {zoomIndex + 1} of {allImages.length}
              </span>
            )}
          </div>

          <style>{`
            @keyframes scaleUp { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          `}</style>
        </div>
      )}

      <Footer />
    </div>
  );
}
