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

const RUST = "#db2777";
const BROWN = "#831843";

function Navbar({ solid = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { totalItems, openCart } = useCart();

  useEffect(() => {
    if (solid) return;
    const fn = () => setScrolled(window.scrollY > window.innerHeight * 0.85);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, [solid]);

  const bg = solid || scrolled ? "rgba(255, 244, 249, 0.94)" : "rgba(255, 255, 255, 0.18)";
  const shadow = solid || scrolled ? "0 14px 34px rgba(236,72,153,0.16)" : "none";

  const links = [
    { label: "Home", path: "/" },
    { label: "Shop", path: "/shop" },
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
        className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-5 md:px-10 py-1 md:py-1.5"
        style={{
          backgroundColor: bg,
          boxShadow: shadow,
          color: solid || scrolled ? BROWN : "#fff",
          backdropFilter: "blur(18px)",
          transition: solid
             ? "none"
             : "background-color 0.4s ease, box-shadow 0.4s ease, color 0.4s ease",
          borderBottom: solid || scrolled ? "1px solid rgba(244,114,182,0.22)" : "1px solid rgba(255,255,255,0.22)",
          borderRadius: solid
            ? "0 0 24px 24px"
            : scrolled
              ? "0 0 24px 24px"
              : "0",
        }}
      >
        {/* Logo */}
        <div className="cursor-pointer" onClick={() => navigate("/")}>
          <img src="/logo.png" alt="Logo" className="h-14 md:h-16 w-auto" />
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-4 md:gap-8 text-[14px] md:text-[15px]">
          {links.map(({ label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                fontFamily: "'Stardom-Regular', serif",
                fontWeight: location.pathname === path ? "700" : "400",
                paddingBottom: "2px",
                background: "none",
                border: "none",
                borderBottom:
                  location.pathname === path
                    ? `2px solid ${solid || scrolled ? RUST : "rgba(255,255,255,0.9)"}`
                    : "2px solid transparent",
                color: solid || scrolled ? BROWN : "white",
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
          className="relative flex items-center p-2 rounded-full transition-colors"
          style={{
            background: solid || scrolled ? "rgba(252,231,243,0.72)" : "rgba(255,255,255,0.22)",
            color: solid || scrolled ? BROWN : "#fff",
            border: solid || scrolled ? "1px solid rgba(244,114,182,0.28)" : "1px solid rgba(255,255,255,0.25)",
          }}
        >
          <FiShoppingCart size={20} />
          {totalItems > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-1px",
                right: "-1px",
                background: solid || scrolled ? RUST : "#fff",
                color: solid || scrolled ? "#fff" : RUST,
                borderRadius: "999px",
                fontSize: "10px",
                fontWeight: "800",
                minWidth: "17px",
                height: "17px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 3px",
              }}
            >
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
