import { useState } from "react";
import { FiX } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { supabase } from "../utils/supabase";
import { RUST, BROWN, BEIGE, LIGHT } from "./navbarConstants";

// ── CheckoutModal ─────────────────────────────────────────────────────────────
// Collects customer name, phone, and delivery address, submits the order to
// Supabase, decrements product stock, then reloads the page so stock is fresh.
export default function CheckoutModal({ onClose }) {
  const { cartItems, totalPrice, clearCart } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderPayload = {
        customer_name: form.name,
        customer_phone: form.phone,
        delivery_address: form.address,
        total: totalPrice,
        status: "pending",
        items: cartItems.map((i) => ({
          id: i.id,
          name: i.name,
          qty: i.qty,
          color: i.color,
          price: i.is_sale && i.sale_price ? Number(i.sale_price) : Number(i.price),
        })),
      };

      const { error } = await supabase.from("orders").insert([orderPayload]);
      if (error) throw error;

      // Decrement stock for each purchased product
      await Promise.all(
        cartItems.map(async (item) => {
          const { data: prod } = await supabase.from("products").select("stock").eq("id", item.id).single();
          const newStock = Math.max(0, (prod?.stock ?? 0) - item.qty);
          await supabase.from("products").update({ stock: newStock }).eq("id", item.id);
        })
      );

      clearCart();
      setSuccess(true);
      setForm({ name: "", phone: "", address: "" });
      // Reload after 2.5s so updated stock is applied across the page
      setTimeout(() => window.location.reload(), 2500);
    } catch (err) {
      alert("Failed to place order. Please try again.\n" + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const field = (label, input) => (
    <div>
      <label style={{ fontSize: "11px", fontWeight: "700", color: BROWN, letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>{label}</label>
      {input}
    </div>
  );

  const inputCss = { width: "100%", padding: "10px 14px", border: "1.5px solid #ddd", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" };

  return (
    <>
      {/* Backdrop */}
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 10000, backdropFilter: "blur(4px)" }} onClick={onClose} />

      {/* Modal */}
      <div
        style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "#fffafd", borderRadius: "24px", width: "min(480px, 92vw)", boxShadow: "0 30px 80px rgba(157,23,77,0.25)", zIndex: 10001, overflow: "hidden", animation: "scaleIn 0.25s ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`@keyframes scaleIn { from { opacity:0; transform: translate(-50%,-50%) scale(0.92); } to { opacity:1; transform: translate(-50%,-50%) scale(1); } }`}</style>

        {/* Header */}
        <div style={{ padding: "20px 24px", background: BROWN, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", fontFamily: "'Stardom-Regular', serif" }}>Checkout</h2>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: "50%", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <FiX size={16} />
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
              <h3 style={{ color: BROWN, fontFamily: "'Stardom-Regular', serif", margin: "0 0 8px" }}>Order Placed!</h3>
              <p style={{ color: "#666", fontSize: "14px", margin: "0 0 24px" }}>Thank you! We'll contact you soon to confirm delivery.</p>
              <button onClick={onClose} style={{ background: RUST, color: "#fff", border: "none", borderRadius: "999px", padding: "12px 32px", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}>
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Order summary */}
              <div style={{ background: LIGHT, borderRadius: "10px", padding: "12px 16px", border: `1px solid ${BEIGE}` }}>
                <p style={{ margin: "0 0 8px", fontSize: "11px", fontWeight: "700", color: RUST, letterSpacing: "1px", textTransform: "uppercase" }}>Order Summary</p>
                {cartItems.map((item) => {
                  const price = item.is_sale && item.sale_price ? Number(item.sale_price) : Number(item.price);
                  return (
                    <div key={item.key} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#555", marginBottom: "4px" }}>
                      <span>{item.name} {item.color ? `(${item.color})` : ""} × {item.qty}</span>
                      <span style={{ fontWeight: "700", color: BROWN }}>৳{(price * item.qty).toFixed(0)}</span>
                    </div>
                  );
                })}
                <div style={{ borderTop: `1px solid ${BEIGE}`, marginTop: "8px", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontWeight: "800", color: BROWN }}>
                  <span>Total</span><span>৳{totalPrice.toFixed(0)}</span>
                </div>
              </div>

              {field("CUSTOMER NAME *", <input required type="text" placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputCss} />)}
              {field("PHONE NUMBER *",  <input required type="tel"  placeholder="e.g. 01XXXXXXXXX"  value={form.phone}   onChange={e => setForm({ ...form, phone: e.target.value })}   style={inputCss} />)}
              {field("DELIVERY ADDRESS *", <textarea required rows={3} placeholder="House, Road, Area, City" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={{ ...inputCss, resize: "vertical", fontFamily: "inherit" }} />)}

              <button
                type="submit" disabled={loading}
                style={{ padding: "13px", background: loading ? "#ccc" : RUST, color: "#fff", border: "none", borderRadius: "999px", fontSize: "14px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Stardom-Regular', serif", letterSpacing: "0.5px" }}
              >
                {loading ? "Placing Order..." : "Confirm Order →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
