import { FiShoppingCart } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";
import CheckoutModal from "./CheckoutModal";

// ── Navbar ────────────────────────────────────────────────────────────────────
// Top navigation bar with scroll-aware styling, cart icon badge,
// slide-out CartDrawer, and CheckoutModal.
//
// Sub-components:
//   CartDrawer    → src/components/CartDrawer.jsx
//   CheckoutModal → src/components/CheckoutModal.jsx
//   Constants     → src/components/navbarConstants.js

const RUST  = "#B5451B";
const BROWN = "#752700";

function Navbar({ solid = false }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { totalItems, openCart } = useCart();

  useEffect(() => {
    if (solid) return;
    const fn = () => setScrolled(window.scrollY > window.innerHeight * 0.85);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, [solid]);

  const bg     = solid ? RUST : scrolled ? RUST : "transparent";
  const shadow = solid || scrolled ? "0 2px 16px rgba(107,58,42,0.22)" : "none";

  const links = [
    { label: "Home",    path: "/" },
    { label: "Shop",    path: "/shop" },
    { label: "On Sale", path: "/sale" },
  ];

  return (
    <>
      {/* ── Stardom font ──────────────────────────────────────────────── */}
      <style>{`
        @font-face {
          font-family: 'Stardom-Regular';
          src: url('/fonts/Stardom-Regular.woff2') format('woff2'),
               url('/fonts/Stardom-Regular.woff') format('woff'),
               url('/fonts/Stardom-Regular.ttf') format('truetype');
          font-weight: 400;
          font-display: swap;
          font-style: normal;
        }
      `}</style>

      {/* ── Main Bar ──────────────────────────────────────────────────── */}
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
              style={{
                fontFamily: "'Stardom-Regular', serif",
                fontWeight: location.pathname === path ? "700" : "400",
                borderBottom: location.pathname === path ? "2px solid rgba(255,255,255,0.8)" : "2px solid transparent",
                paddingBottom: "2px", background: "none", border: "none",
                color: "white", cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Cart icon */}
        <button onClick={openCart} className="relative flex items-center p-3 rounded-full hover:bg-white/20 transition-colors">
          <FiShoppingCart size={22} />
          {totalItems > 0 && (
            <span style={{ position: "absolute", top: "4px", right: "4px", background: "#fff", color: RUST, borderRadius: "999px", fontSize: "10px", fontWeight: "800", minWidth: "17px", height: "17px", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Cart drawer (backdrop + drawer) */}
      <CartDrawer onCheckout={() => setShowCheckout(true)} />

      {/* Checkout modal */}
      {showCheckout && <CheckoutModal onClose={() => setShowCheckout(false)} />}
    </>
  );
}

export default Navbar;
