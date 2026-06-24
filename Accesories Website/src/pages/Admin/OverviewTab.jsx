import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { BROWN, RUST } from "./adminConstants";

// ── Overview Tab ─────────────────────────────────────────────────────────────
// Shows key stats and a one-time "Sync Stock from All Orders" utility.
export default function OverviewTab() {
  const [stats, setStats] = useState({
    products: 0,
    lowStock: 0,
    orders: 0,
    revenue: 0,
  });
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const { count: prodCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });
    
    const { count: lowStockCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .lte("stock", 5);

    let ordCount = 0,
      rev = 0;
    try {
      const { data: orders, count: orderCount } = await supabase
        .from("orders")
        .select("total", { count: "exact" });
      if (orders) {
        ordCount = orderCount || orders.length;
        rev = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      }
    } catch (e) {
      console.log("Orders table might not exist yet.");
    }
    setStats({
      products: prodCount || 0,
      lowStock: lowStockCount || 0,
      orders: ordCount,
      revenue: rev,
    });
  }

  async function syncStockFromOrders() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const { data: orders, error: oErr } = await supabase
        .from("orders")
        .select("items");
      if (oErr) throw oErr;

      const soldMap = {};
      for (const order of orders || []) {
        for (const item of order.items || []) {
          if (!item.id) continue;
          soldMap[item.id] = (soldMap[item.id] || 0) + (item.qty || 0);
        }
      }

      const productIds = Object.keys(soldMap);
      if (productIds.length === 0) {
        setSyncResult({ updated: 0, log: ["No order items found to sync."] });
        return;
      }

      const { data: products, error: pErr } = await supabase
        .from("products")
        .select("id, name, stock")
        .in("id", productIds);
      if (pErr) throw pErr;

      const log = [];
      let updated = 0;
      await Promise.all(
        (products || []).map(async (prod) => {
          const sold = soldMap[prod.id] || 0;
          const newStock = Math.max(0, (prod.stock || 0) - sold);
          if (newStock !== prod.stock) {
            await supabase
              .from("products")
              .update({ stock: newStock })
              .eq("id", prod.id);
            log.push(
              `✅ ${prod.name}: ${prod.stock} → ${newStock} (sold ${sold})`,
            );
            updated++;
          } else {
            log.push(`— ${prod.name}: stock unchanged at ${prod.stock}`);
          }
        }),
      );
      setSyncResult({ updated, log });
      fetchStats();
    } catch (err) {
      setSyncResult({ updated: 0, log: [`❌ Error: ${err.message}`] });
    } finally {
      setSyncing(false);
    }
  }

  const Card = ({ title, value, color }) => (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid #eaeaea",
        flex: 1,
        minWidth: "140px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          fontSize: "13px",
          color: "#666",
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {title}
      </p>
      <p style={{ margin: 0, fontSize: "28px", fontWeight: "800", color }}>
        {value}
      </p>
    </div>
  );

  return (
    <div>
      <h1
        style={{
          margin: "0 0 24px",
          fontSize: "24px",
          color: BROWN,
          fontWeight: "800",
        }}
      >
        Dashboard Overview
      </h1>
      <div style={{ display: "flex", gap: "16px", marginBottom: "32px", flexWrap: "wrap" }}>
        <Card title="Total Products" value={stats.products} color={BROWN} />
        <Card
          title="Low Stock Alerts"
          value={stats.lowStock}
          color={stats.lowStock > 0 ? "#e74c3c" : "#27ae60"}
        />
        <Card title="Total Orders" value={stats.orders} color={RUST} />
        <Card
          title="Revenue"
          value={`৳${stats.revenue.toFixed(0)}`}
          color="#27ae60"
        />
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #eaeaea",
          borderRadius: "16px",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 4px",
                fontWeight: "700",
                color: BROWN,
                fontSize: "15px",
              }}
            >
              🔄 Sync Stock from All Orders
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>
              Scans every past order and subtracts sold quantities from current
              product stock. Run this once to fix historical orders.
            </p>
          </div>
          <button
            onClick={syncStockFromOrders}
            disabled={syncing}
            style={{
              padding: "10px 22px",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "13px",
              cursor: syncing ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
              background: syncing
                ? "#ccc"
                : BROWN,
              color: "#fff",
            }}
          >
            {syncing ? "Syncing..." : "Run Stock Sync"}
          </button>
        </div>
        {syncResult && (
          <div style={{ marginTop: "18px" }}>
            <p
              style={{
                margin: "0 0 10px",
                fontWeight: "700",
                fontSize: "13px",
                color: syncResult.updated > 0 ? "#27ae60" : "#888",
              }}
            >
              {syncResult.updated > 0
                ? `✅ Updated ${syncResult.updated} product(s)`
                : "No products needed updating"}
            </p>
            <div
              style={{
                background: "#f8f8f8",
                borderRadius: "10px",
                padding: "12px 16px",
                maxHeight: "180px",
                overflowY: "auto",
              }}
            >
              {syncResult.log.map((line, i) => (
                <p
                  key={i}
                  style={{
                    margin: "3px 0",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    color: "#444",
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
