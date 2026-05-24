import { FiX, FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { RUST, BROWN, BEIGE, LIGHT } from "./navbarConstants";

// ── CartDrawer ────────────────────────────────────────────────────────────────
// Slide-out drawer showing cart items with qty controls (stock-limited)
// and a "Proceed to Checkout" button.
export default function CartDrawer({ onCheckout }) {
  const navigate = useNavigate();
  const {
    cartItems,
    totalItems,
    totalPrice,
    removeFromCart,
    updateQty,
    isOpen,
    closeCart,
  } = useCart();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 9997,
            backdropFilter: "blur(2px)",
          }}
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "380px",
          height: "100vh",
          background: "#fffafd",
          zIndex: 9998,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.34,1.1,0.64,1)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-12px 0 44px rgba(157,23,77,0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            background: BROWN,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "17px",
              fontWeight: "700",
              fontFamily: "'Stardom-Regular', serif",
            }}
          >
            My Cart{" "}
            {totalItems > 0 && (
              <span style={{ opacity: 0.75, fontSize: "13px" }}>
                ({totalItems})
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: "60px" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🛍️</div>
              <p style={{ color: "#999" }}>Your cart is empty</p>
              <button
                onClick={() => {
                  closeCart();
                  navigate("/shop");
                }}
                style={{
                  marginTop: "16px",
                  background: RUST,
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 24px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Shop Now
              </button>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {cartItems.map((item) => {
                const price =
                  item.is_sale && item.sale_price
                    ? Number(item.sale_price)
                    : Number(item.price);
                const atMax = item.qty >= (item.stock ?? Infinity);
                return (
                  <div
                    key={item.key}
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "12px",
                      background: LIGHT,
                      borderRadius: "8px",
                      border: `1px solid ${BEIGE}`,
                    }}
                  >
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: "700",
                          color: BROWN,
                          fontSize: "13px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.name}
                      </p>
                      {item.color && (
                        <p
                          style={{
                            margin: "2px 0",
                            fontSize: "11px",
                            color: "#999",
                          }}
                        >
                          Color: {item.color}
                        </p>
                      )}
                      <p
                        style={{
                          margin: "4px 0",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: RUST,
                        }}
                      >
                        ৳{(price * item.qty).toFixed(0)}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <button
                          onClick={() => updateQty(item.key, -1)}
                          style={{
                            width: "24px",
                            height: "24px",
                            border: "1.5px solid #ddd",
                            borderRadius: "6px",
                            background: "#fff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FiMinus size={11} />
                        </button>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            minWidth: "16px",
                            textAlign: "center",
                          }}
                        >
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.key, 1)}
                          disabled={atMax}
                          style={{
                            width: "24px",
                            height: "24px",
                            border: "1.5px solid #ddd",
                            borderRadius: "6px",
                            background: atMax ? "#f5f5f5" : "#fff",
                            cursor: atMax ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: atMax ? 0.4 : 1,
                          }}
                        >
                          <FiPlus size={11} />
                        </button>
                        {atMax && (
                          <span
                            style={{
                              fontSize: "10px",
                              color: "#e67e22",
                              fontWeight: "700",
                            }}
                          >
                            Max
                          </span>
                        )}
                        <button
                          onClick={() => removeFromCart(item.key)}
                          style={{
                            marginLeft: "auto",
                            background: "none",
                            border: "none",
                            color: "#e74c3c",
                            cursor: "pointer",
                          }}
                        >
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
          <div
            style={{ padding: "18px 20px", borderTop: `1px solid ${BEIGE}` }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <span style={{ fontWeight: "600", color: "#555" }}>Total</span>
              <span
                style={{ fontSize: "20px", fontWeight: "800", color: BROWN }}
              >
                ৳{totalPrice.toFixed(0)}
              </span>
            </div>
            <button
              style={{
                width: "100%",
                padding: "13px",
                background: RUST,
                color: "#fff",
                border: "none",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                letterSpacing: "0.5px",
                fontFamily: "'Stardom-Regular', serif",
              }}
              onClick={onCheckout}
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
