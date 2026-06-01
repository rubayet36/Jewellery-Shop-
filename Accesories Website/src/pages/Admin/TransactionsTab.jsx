import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { BROWN, RUST, thStyle, tdStyle } from "./adminConstants";

// ── Transactions Tab ──────────────────────────────────────────────────────────
// Shows all orders split into Pending Orders and Delivered Portal.
// Click any row to expand and see full item details, address, and phone.
export default function TransactionsTab() {
  const [orders, setOrders] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [view, setView] = useState("pending"); // "pending" | "delivered"
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchProductsMap();
  }, []);

  async function fetchProductsMap() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, image_url");
      if (!error && data) {
        const mapping = {};
        data.forEach((p) => {
          mapping[p.id] = p.image_url;
        });
        setProductsMap(mapping);
      }
    } catch (e) {
      console.log("Error fetching products map:", e);
    }
  }

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setOrders(data);
    } catch (e) {
      console.log(e);
    }
  }

  const updateStatus = async (id, status) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const deleteOrder = async (id) => {
    if (
      !window.confirm("Delete this order permanently? This cannot be undone.")
    )
      return;
    await supabase.from("orders").delete().eq("id", id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const pending = orders.filter((o) => o.status !== "delivered");
  const delivered = orders.filter((o) => o.status === "delivered");
  const list = view === "pending" ? pending : delivered;

  const TabBtn = ({ label, val, count }) => (
    <button
      onClick={() => setView(val)}
      style={{
        padding: "8px 20px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "13px",
        transition: "all 0.2s",
        background:
          view === val
            ? val === "pending"
              ? "#fef9e7"
              : "#e8f8f5"
            : "#f5f5f5",
        color:
          view === val ? (val === "pending" ? "#f39c12" : "#27ae60") : "#888",
      }}
    >
      {label}{" "}
      <span
        style={{
          background: view === val ? "rgba(0,0,0,0.08)" : "#e0e0e0",
          borderRadius: "999px",
          padding: "1px 7px",
          fontSize: "11px",
        }}
      >
        {count}
      </span>
    </button>
  );

  const OrderRow = ({ o }) => {
    const isExpanded = expanded === o.id;
    return (
      <>
        <tr
          style={{ borderBottom: "1px solid #eaeaea", cursor: "pointer" }}
          onClick={() => setExpanded(isExpanded ? null : o.id)}
        >
          <td
            style={{
              ...tdStyle,
              fontFamily: "monospace",
              fontSize: "12px",
              color: "#888",
            }}
          >
            {String(o.id).split("-")[0]}
          </td>
          <td style={tdStyle}>
            <p style={{ margin: 0, fontWeight: "700", color: BROWN }}>
              {o.customer_name}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#888" }}>
              {o.customer_phone || "—"}
            </p>
          </td>
          <td style={{ ...tdStyle, maxWidth: "180px" }}>
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                color: "#666",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {o.delivery_address || "—"}
            </p>
          </td>
          <td style={tdStyle}>
            <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>
              {(o.items || []).length} item(s)
            </p>
          </td>
          <td style={{ ...tdStyle, fontWeight: "800", color: BROWN }}>
            ৳{Number(o.total || 0) + Number(o.delivery_charge || 80)}
            <span style={{ fontSize: "10px", fontWeight: "600", color: "#888", display: "block", marginTop: "2px" }}>
              (৳{o.total} sub + ৳{o.delivery_charge || 80} del)
            </span>
          </td>
          <td style={{ ...tdStyle, fontSize: "12px", color: "#888" }}>
            {new Date(o.created_at).toLocaleDateString()}
          </td>
          <td style={{ ...tdStyle, textAlign: "right" }}>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              {o.status !== "delivered" ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateStatus(o.id, "delivered");
                  }}
                  style={{
                    background: "#27ae60",
                    color: "#fff",
                    border: "none",
                    padding: "7px 14px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  ✓ Delivered
                </button>
              ) : (
                <span
                  style={{
                    background: "#e8f8f5",
                    color: "#27ae60",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "700",
                  }}
                >
                  Delivered
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteOrder(o.id);
                }}
                style={{
                  background: "#fff0f0",
                  color: "#e74c3c",
                  border: "1px solid #fbc4c4",
                  padding: "7px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
                title="Delete this order"
              >
                🗑 Delete
              </button>
            </div>
          </td>
        </tr>

        {/* Expanded row — full order details */}
        {isExpanded && (
          <tr style={{ background: "#fafafa" }}>
            <td colSpan="7" style={{ padding: "12px 20px" }}>
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: RUST,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Order Items
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {(o.items || []).map((item, idx) => {
                  const imgUrl = item.image_url || productsMap[item.id];
                  return (
                    <div
                      key={idx}
                      style={{
                        background: "#fff",
                        border: "1px solid #ffccd5",
                        borderRadius: "12px",
                        padding: "8px 12px",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        boxShadow: "0 2px 6px rgba(255,93,143,0.02)",
                        minWidth: "220px",
                        flex: "1 1 calc(33.33% - 8px)",
                        boxSizing: "border-box",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          background: "#fff5f8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid #ffccd5",
                          flexShrink: 0,
                        }}
                      >
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={item.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: "20px" }}>💍</span>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "700", color: BROWN, lineHeight: "1.2" }}>
                          {item.name}
                          {item.color && (
                            <span style={{ color: "#999", fontSize: "11px", marginLeft: "4px" }}>
                              ({item.color})
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "10px", marginTop: "4px", fontSize: "12px" }}>
                          <span style={{ color: "#666" }}>
                            Qty: <strong style={{ color: BROWN }}>{item.qty}</strong>
                          </span>
                          <span style={{ fontWeight: "700", color: RUST }}>
                            ৳{(item.price * item.qty).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "24px", fontSize: "13px", background: "#fff9fb", border: "1px dashed #ffccd5", borderRadius: "12px", padding: "10px 16px", alignItems: "center" }}>
                <div>
                  <span style={{ color: "#888" }}>Product Revenue: </span>
                  <span style={{ fontWeight: "700", color: BROWN }}>৳{o.total}</span>
                </div>
                <div>
                  <span style={{ color: "#888" }}>Delivery Fee: </span>
                  <span style={{ fontWeight: "700", color: BROWN }}>
                    ৳{o.delivery_charge || 80} ({o.is_outside_dhaka ? "Outside Dhaka" : "Inside Dhaka"})
                  </span>
                </div>
                <div>
                  <span style={{ color: "#888" }}>Grand Total: </span>
                  <span style={{ fontWeight: "800", color: RUST }}>৳{Number(o.total || 0) + Number(o.delivery_charge || 80)}</span>
                </div>
                {o.transaction_id && (
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#888", fontWeight: "700" }}>🔑 TxID:</span>
                    <span
                      onClick={() => {
                        navigator.clipboard.writeText(o.transaction_id);
                        alert("Transaction ID copied! 📋💖");
                      }}
                      style={{
                        background: "#fff",
                        border: "1.5px solid #ffccd5",
                        color: BROWN,
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontFamily: "monospace",
                        fontWeight: "800",
                        cursor: "pointer",
                        boxShadow: "0 2px 5px rgba(255,93,143,0.03)",
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                      title="Click to copy Transaction ID"
                    >
                      {o.transaction_id} 📋
                    </span>
                  </div>
                )}
              </div>
              <p style={{ margin: "12px 0 0", fontSize: "12px", color: "#888" }}>
                📍 {o.delivery_address || "No address"} &nbsp;|&nbsp; 📞{" "}
                {o.customer_phone || "No phone"}
              </p>
            </td>
          </tr>
        )}
      </>
    );
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <TabBtn
          label="🕐 Pending Orders"
          val="pending"
          count={pending.length}
        />
        <TabBtn
          label="✅ Delivered Portal"
          val="delivered"
          count={delivered.length}
        />
        <button
          onClick={fetchOrders}
          style={{
            marginLeft: "auto",
            background: "none",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "7px 14px",
            fontSize: "12px",
            cursor: "pointer",
            color: "#666",
          }}
        >
          ↻ Refresh
        </button>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #eaeaea",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#fafafa",
                borderBottom: "1px solid #eaeaea",
              }}
            >
              <th style={thStyle}>Order ID</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Address</th>
              <th style={thStyle}>Items</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Date</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <OrderRow key={o.id} o={o} />
            ))}
            {list.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#999",
                  }}
                >
                  {view === "pending"
                    ? "No pending orders 🎉"
                    : "No delivered orders yet"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
