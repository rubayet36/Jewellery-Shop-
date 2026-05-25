import { useState } from "react";
import { FiX } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { supabase } from "../utils/supabase";
import { RUST, BROWN, BEIGE, LIGHT } from "./navbarConstants";

// ── CheckoutModal ─────────────────────────────────────────────────────────────
// Collects customer name, phone, and delivery address, submits the order to
// Supabase, decrements product stock, then reloads the page so stock is fresh.
export default function CheckoutModal({ onClose, isOutsideDhaka, setIsOutsideDhaka }) {
  const { cartItems, totalPrice, clearCart } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", address: "", transaction_id: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const deliveryCharge = isOutsideDhaka ? 150 : 80;
  const grandTotal = totalPrice + deliveryCharge;

  const sendGmailNotification = async (orderPayload) => {
    // 🌸 Configure your free EmailJS account variables here (Gmail Integration)
    const SERVICE_ID = "service_9u2mvd7";       // Your EmailJS Service ID
    const TEMPLATE_ID = "template_u2r84la";     // Your EmailJS Template ID
    const PUBLIC_KEY = "8521LBhipI56HjJ1d";     // Your EmailJS Public Key

    if (!PUBLIC_KEY || PUBLIC_KEY === "YOUR_EMAILJS_PUBLIC_KEY") {
      console.log("🌸 Gmail Alert: EmailJS is not configured yet! Register at emailjs.com and set SERVICE_ID, TEMPLATE_ID, and PUBLIC_KEY inside CheckoutModal.jsx to receive instant Gmail notifications! 🧸💖");
      return;
    }

    try {
      const itemsSummary = orderPayload.items
        .map((item) => `• ${item.name} ${item.color ? `(${item.color})` : ""} × ${item.qty} (৳${(item.price * item.qty).toFixed(0)})`)
        .join("\n");

      await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: SERVICE_ID,
          template_id: TEMPLATE_ID,
          user_id: PUBLIC_KEY,
          template_params: {
            customer_name: orderPayload.customer_name,
            customer_phone: orderPayload.customer_phone,
            delivery_address: orderPayload.delivery_address,
            customer_address: orderPayload.delivery_address, // Ensures both variables work!
            items_summary: itemsSummary,
            subtotal: `৳${orderPayload.total}`,
            delivery_charge: `৳${deliveryCharge}`,
            grand_total: `৳${grandTotal}`,
            shipping_region: isOutsideDhaka ? "Outside Dhaka" : "Inside Dhaka",
          },
        }),
      });
      console.log("📬 Gmail notification sent successfully via EmailJS!");
    } catch (err) {
      console.error("Error triggering Gmail notification:", err);
    }
  };

  const sendTelegramNotification = async (orderPayload) => {
    // 🌸 Paste your free Telegram Bot credentials here
    const BOT_TOKEN = "8903255568:AAHX0b2uxjtrRiHO7_A9q8-fBnjh2nBc3Ts"; // User's Telegram Bot Token
    const CHAT_ID = "8646993462";   // User's Telegram Chat ID

    if (!BOT_TOKEN || !CHAT_ID) {
      console.log("🌸 Telegram Alert: Telegram Bot credentials are not configured inside CheckoutModal.jsx yet! Set BOT_TOKEN and CHAT_ID to receive instant push alerts on Telegram! 🧸💖");
      return;
    }

    try {
      const itemsSummary = orderPayload.items
        .map((item) => `• ${item.name} ${item.color ? `(${item.color})` : ""} × ${item.qty} (৳${(item.price * item.qty).toFixed(0)})`)
        .join("\n");

      const txSummary = orderPayload.transaction_id 
        ? `\n🔑 *Transaction ID:* \`${orderPayload.transaction_id}\``
        : "";

      const text = `🛍️ *New Order Placed!* 🧸\n\n` +
        `👤 *Customer:* ${orderPayload.customer_name}\n` +
        `📞 *Phone:* \`${orderPayload.customer_phone}\`\n` +
        `📍 *Address:* ${orderPayload.delivery_address}\n` +
        `🚚 *Shipping:* ${isOutsideDhaka ? "Outside Dhaka (৳150)" : "Inside Dhaka (৳80)"}\n` +
        txSummary + `\n\n` +
        `📦 *Items:* \n${itemsSummary}\n\n` +
        `💳 *Product Price Subtotal:* ৳${orderPayload.total}\n` +
        `💰 *Grand Total Due:* ৳${orderPayload.total + orderPayload.delivery_charge}`;

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: text,
          parse_mode: "Markdown",
        }),
      });
      console.log("📬 Telegram notification sent successfully!");
    } catch (err) {
      console.error("Error triggering Telegram notification:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderPayload = {
        customer_name: form.name,
        customer_phone: form.phone,
        delivery_address: form.address,
        total: totalPrice, // ONLY product subtotal (revenue)
        delivery_charge: deliveryCharge, // Custom shipping column
        is_outside_dhaka: isOutsideDhaka, // Custom shipping region
        status: "pending",
        transaction_id: isOutsideDhaka ? form.transaction_id.trim() : "", // saved only if outside Dhaka
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

      // Trigger Email & Telegram Alerts
      await sendGmailNotification(orderPayload);
      await sendTelegramNotification(orderPayload);

      // Decrement stock for each purchased product
      await Promise.all(
        cartItems.map(async (item) => {
          const { data: prod } = await supabase.from("products").select("stock").eq("id", item.id).single();
          const newStock = Math.max(0, (prod?.stock ?? 0) - item.qty);
          await supabase.from("products").update({ stock: newStock }).eq("id", item.id);
        })
      );

      localStorage.removeItem("jewel_cart");
      clearCart();
      setSuccess(true);
      setForm({ name: "", phone: "", address: "", transaction_id: "" });
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
        style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "#fffafd", borderRadius: "24px", width: "min(480px, 92vw)", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 30px 80px rgba(157,23,77,0.25)", zIndex: 10001, overflow: "hidden", animation: "scaleIn 0.25s ease" }}
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

        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
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
                <div style={{ borderTop: `1px dashed ${BEIGE}`, marginTop: "8px", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#555" }}>
                  <span>Subtotal</span>
                  <span>৳{totalPrice.toFixed(0)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#555", marginTop: "2px" }}>
                  <span>Delivery ({isOutsideDhaka ? "Outside Dhaka" : "Inside Dhaka"})</span>
                  <span>৳{deliveryCharge}</span>
                </div>
                <div style={{ borderTop: `1px solid ${BEIGE}`, marginTop: "8px", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontWeight: "800", color: BROWN }}>
                  <span>Total Due</span>
                  <span>৳{grandTotal.toFixed(0)}</span>
                </div>
              </div>

              {isOutsideDhaka && (
                <div
                  style={{
                    background: "#fff0f3",
                    border: "2px dashed #ff85a1",
                    borderRadius: "14px",
                    padding: "14px 16px",
                    fontSize: "13px",
                    color: BROWN,
                    lineHeight: "1.5",
                    textAlign: "left",
                  }}
                >
                  🌸 <strong>Advance Payment Required:</strong> For orders outside Dhaka, please send the <strong>৳150 bkash send money</strong> delivery charge to the number below to confirm your order. After sending, enter your Transaction ID! 🧸💖
                  
                  <div
                    style={{
                      marginTop: "10px",
                      background: "#fff",
                      border: "1.5px solid #ffccd5",
                      borderRadius: "10px",
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      boxShadow: "0 2px 8px rgba(255,93,143,0.04)"
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "10px", color: RUST, fontWeight: "800", display: "block", letterSpacing: "0.5px" }}>BKASH </span>
                      <strong style={{ fontSize: "16px", color: BROWN, fontFamily: "monospace", letterSpacing: "0.5px" }}>01339659572</strong>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        navigator.clipboard.writeText("01339659572");
                        alert("Number copied! 📋🌸");
                      }}
                      style={{
                        background: RUST,
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px 14px",
                        fontSize: "11px",
                        fontWeight: "800",
                        cursor: "pointer",
                        boxShadow: "0 4px 10px rgba(219,39,119,0.15)"
                      }}
                    >
                      Copy 📋
                    </button>
                  </div>
                </div>
              )}
              {field("CUSTOMER NAME *", <input required type="text" placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputCss} />)}
              {field("PHONE NUMBER *",  <input required type="tel"  placeholder="e.g. 01XXXXXXXXX"  value={form.phone}   onChange={e => setForm({ ...form, phone: e.target.value })}   style={inputCss} />)}
              {field("DELIVERY ADDRESS *", <textarea required rows={3} placeholder="House, Road, Area, City" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={{ ...inputCss, resize: "vertical", fontFamily: "inherit" }} />)}
              {isOutsideDhaka && field(
                "TRANSACTION ID *",
                <input
                  required
                  type="text"
                  placeholder="Enter bKash/Nagad Transaction ID"
                  value={form.transaction_id}
                  onChange={e => setForm({ ...form, transaction_id: e.target.value })}
                  style={inputCss}
                />
              )}

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
