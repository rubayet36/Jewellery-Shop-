import { FiShoppingCart, FiX, FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

const RUST = "#B5451B";
const BROWN = "#752700";
const BEIGE = "#f3e0d0";
const LIGHT = "#fdf6f0";

function Navbar({ solid = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { cartItems, totalItems, totalPrice, removeFromCart, updateQty, isOpen, openCart, closeCart } = useCart();

  useEffect(() => {
    if (solid) return;
    const fn = () => setScrolled(window.scrollY > window.innerHeight * 0.85);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, [solid]);

  const bg = solid ? RUST : scrolled ? RUST : "transparent";
  const shadow = solid || scrolled ? "0 2px 16px rgba(107,58,42,0.22)" : "none";

  const links = [
    { label: "Home", path: "/" },
    { label: "Shop", path: "/shop" },
    { label: "On Sale", path: "/sale" },
  ];

  return (
    <>
      {/* ── Main Bar ───────────────────────────────────────────────────── */}
      <div
        className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-10 py-3 text-white"
        style={{ backgroundColor: bg, boxShadow: shadow, transition: solid ? "none" : "background-color 0.4s ease, box-shadow 0.4s ease", borderRadius: solid ? "0 0 16px 16px" : scrolled ? "0 0 16px 16px" : "0" }}
      >
        {/* Logo */}
        <div className="cursor-pointer" onClick={() => navigate("/")}>
          <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-8 text-[15px]">
          {links.map(({ label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="hover:text-white/70 transition-colors"
              style={{
                fontWeight: location.pathname === path ? "700" : "400",
                borderBottom: location.pathname === path ? "2px solid rgba(255,255,255,0.8)" : "2px solid transparent",
                paddingBottom: "2px",
                background: "none",
                border: "none",
                borderBottom: location.pathname === path ? "2px solid rgba(255,255,255,0.8)" : "2px solid transparent",
                color: "white",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Cart icon */}
        <button
          onClick={openCart}
          className="relative flex items-center p-3 rounded-full hover:bg-white/20 transition-colors"
        >
          <FiShoppingCart size={22} />
          {totalItems > 0 && (
            <span style={{
              position: "absolute", top: "4px", right: "4px",
              background: "#fff", color: RUST,
              borderRadius: "999px", fontSize: "10px", fontWeight: "800",
              minWidth: "17px", height: "17px",
              display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px",
            }}>
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* ── Cart Overlay ────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9997, backdropFilter: "blur(2px)" }}
          onClick={closeCart}
        />
      )}

      {/* ── Cart Drawer ─────────────────────────────────────────────────── */}
      <div style={{
        position: "fixed", top: 0, right: 0, width: "380px", height: "100vh",
        background: "#fff", zIndex: 9998,
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.35s cubic-bezier(0.34,1.1,0.64,1)",
        display: "flex", flexDirection: "column",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
      }}>
        {/* Header */}
        <div style={{ padding: "18px 24px", background: RUST, color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: "17px", fontWeight: "700" }}>
            My Cart {totalItems > 0 && <span style={{ opacity: 0.75, fontSize: "13px" }}>({totalItems})</span>}
          </h2>
          <button onClick={closeCart} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
            <FiX size={20} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: "60px" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🛍️</div>
              <p style={{ color: "#999" }}>Your cart is empty</p>
              <button onClick={() => { closeCart(); navigate("/shop"); }}
                style={{ marginTop: "16px", background: RUST, color: "#fff", border: "none", borderRadius: "10px", padding: "10px 24px", fontWeight: "700", cursor: "pointer" }}>
                Shop Now
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {cartItems.map((item) => {
                const price = item.is_sale && item.sale_price ? Number(item.sale_price) : Number(item.price);
                return (
                  <div key={item.key} style={{ display: "flex", gap: "12px", padding: "12px", background: LIGHT, borderRadius: "12px", border: `1px solid ${BEIGE}` }}>
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: "700", color: BROWN, fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                      {item.color && <p style={{ margin: "2px 0", fontSize: "11px", color: "#999" }}>Color: {item.color}</p>}
                      <p style={{ margin: "4px 0", fontSize: "14px", fontWeight: "700", color: RUST }}>৳{(price * item.qty).toFixed(0)}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button onClick={() => updateQty(item.key, -1)} style={{ width: "24px", height: "24px", border: "1.5px solid #ddd", borderRadius: "6px", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <FiMinus size={11} />
                        </button>
                        <span style={{ fontSize: "13px", fontWeight: "700", minWidth: "16px", textAlign: "center" }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.key, 1)} style={{ width: "24px", height: "24px", border: "1.5px solid #ddd", borderRadius: "6px", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <FiPlus size={11} />
                        </button>
                        <button onClick={() => removeFromCart(item.key)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#e74c3c", cursor: "pointer" }}>
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div style={{ padding: "18px 20px", borderTop: `1px solid ${BEIGE}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ fontWeight: "600", color: "#555" }}>Total</span>
              <span style={{ fontSize: "20px", fontWeight: "800", color: BROWN }}>৳{totalPrice.toFixed(0)}</span>
            </div>
            <button
              style={{ width: "100%", padding: "13px", background: `linear-gradient(135deg, ${BROWN}, ${RUST})`, color: "#fff", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.5px" }}
              onClick={() => alert("Checkout coming soon!")}
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Navbar;
