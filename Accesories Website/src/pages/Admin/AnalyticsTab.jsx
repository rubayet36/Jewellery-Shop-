import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../utils/supabase";
import { BROWN, RUST, BEIGE, LIGHT } from "./adminConstants";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";

// ── Analytics Tab ─────────────────────────────────────────────────────────────
// Shows revenue + profit analytics with time-period filters and charts.

const PERIODS = [
  { id: "week",   label: "This Week" },
  { id: "month",  label: "This Month" },
  { id: "year",   label: "This Year" },
  { id: "custom", label: "Custom Range" },
];

function startOfDay(d) {
  const x = new Date(d); x.setHours(0,0,0,0); return x;
}
function endOfDay(d) {
  const x = new Date(d); x.setHours(23,59,59,999); return x;
}
function getWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const mon = new Date(now); mon.setDate(now.getDate() - ((day + 6) % 7));
  return { from: startOfDay(mon), to: endOfDay(now) };
}
function getMonthRange() {
  const now = new Date();
  return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now) };
}
function getYearRange() {
  const now = new Date();
  return { from: new Date(now.getFullYear(), 0, 1), to: endOfDay(now) };
}

function fmtLabel(dateStr, period) {
  const d = new Date(dateStr);
  if (period === "week")  return d.toLocaleDateString("en-BD", { weekday: "short", day: "numeric" });
  if (period === "month") return d.toLocaleDateString("en-BD", { day: "numeric", month: "short" });
  if (period === "year")  return d.toLocaleDateString("en-BD", { month: "short" });
  return d.toLocaleDateString("en-BD", { day: "numeric", month: "short" });
}

function groupByDay(orders, from, to) {
  // Build a bucket for every day in range
  const days = [];
  const cur = startOfDay(new Date(from));
  const end = endOfDay(new Date(to));
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  const map = {};
  for (const d of days) {
    map[d.toISOString().slice(0, 10)] = { revenue: 0, profit: 0, orders: 0 };
  }
  for (const o of orders) {
    const key = new Date(o.created_at).toISOString().slice(0, 10);
    if (map[key] !== undefined) {
      map[key].revenue += Number(o.total || 0);
      map[key].profit  += Number(o.profit || 0);
      map[key].orders  += 1;
    }
  }
  return Object.entries(map).map(([date, v]) => ({ date, ...v }));
}

function groupByMonth(orders, from, to) {
  const map = {};
  // init all months in range
  const cur = new Date(new Date(from).getFullYear(), new Date(from).getMonth(), 1);
  while (cur <= to) {
    const key = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,"0")}`;
    map[key] = { date: key, revenue: 0, profit: 0, orders: 0 };
    cur.setMonth(cur.getMonth() + 1);
  }
  for (const o of orders) {
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    if (map[key]) {
      map[key].revenue += Number(o.total || 0);
      map[key].profit  += Number(o.profit || 0);
      map[key].orders  += 1;
    }
  }
  return Object.values(map);
}

export default function AnalyticsTab() {
  const [period,   setPeriod]   = useState("month");
  const [orders,   setOrders]   = useState([]);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [custom,   setCustom]   = useState({ from: "", to: "" });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [{ data: ord }, { data: prod }] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: true }),
        supabase.from("products").select("id, buying_price, price"),
      ]);
      // Attach profit to each order using product buying_price
      const priceMap = {};
      for (const p of prod || []) priceMap[p.id] = { buying: Number(p.buying_price || 0), selling: Number(p.price || 0) };

      const enriched = (ord || []).map(o => {
        let cost = 0;
        for (const item of o.items || []) {
          const bp = priceMap[item.id]?.buying || 0;
          cost += bp * (item.qty || 1);
        }
        return { ...o, profit: Number(o.total || 0) - cost };
      });
      setOrders(enriched);
      setProducts(prod || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  // Determine date range
  const { from, to } = useMemo(() => {
    if (period === "week")  return getWeekRange();
    if (period === "month") return getMonthRange();
    if (period === "year")  return getYearRange();
    // custom
    if (custom.from && custom.to) return { from: startOfDay(new Date(custom.from)), to: endOfDay(new Date(custom.to)) };
    return getMonthRange();
  }, [period, custom]);

  // Filter orders in range
  const filtered = useMemo(() =>
    orders.filter(o => {
      const d = new Date(o.created_at);
      return d >= from && d <= to;
    }),
  [orders, from, to]);

  // Totals
  const totalRevenue = filtered.reduce((s, o) => s + Number(o.total || 0), 0);
  const totalProfit  = filtered.reduce((s, o) => s + Number(o.profit || 0), 0);
  const totalOrders  = filtered.length;
  const totalCost    = totalRevenue - totalProfit;
  const allTimeRevenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const allTimeProfit  = orders.reduce((s, o) => s + Number(o.profit || 0), 0);

  // Chart data
  const chartData = useMemo(() => {
    const useMonths = period === "year";
    const raw = useMonths ? groupByMonth(filtered, from, to) : groupByDay(filtered, from, to);
    return raw.map(r => ({ ...r, label: fmtLabel(r.date + (useMonths ? "-01" : ""), period) }));
  }, [filtered, from, to, period]);

  const SummaryCard = ({ title, value, sub, color, icon }) => (
    <div style={{ background: "#fff", padding: "20px 24px", borderRadius: "16px", border: "1px solid #eaeaea", flex: 1, minWidth: "160px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <div style={{ fontSize: "22px", marginBottom: "6px" }}>{icon}</div>
      <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#888", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</p>
      <p style={{ margin: 0, fontSize: "26px", fontWeight: "800", color }}>{value}</p>
      {sub && <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#aaa" }}>{sub}</p>}
    </div>
  );

  const PeriodBtn = ({ p }) => (
    <button
      onClick={() => setPeriod(p.id)}
      style={{
        padding: "8px 18px", border: "none", borderRadius: "8px", cursor: "pointer",
        fontWeight: "700", fontSize: "13px", transition: "all 0.2s",
        background: period === p.id ? RUST : "#f0f0f0",
        color: period === p.id ? "#fff" : "#666",
      }}
    >
      {p.label}
    </button>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: "#fff", border: "1px solid #eaeaea", borderRadius: "10px", padding: "12px 16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <p style={{ margin: "0 0 8px", fontWeight: "700", color: BROWN, fontSize: "13px" }}>{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ margin: "3px 0", fontSize: "13px", color: p.color }}>
            {p.name === "revenue" ? "Revenue" : "Profit"}: ৳{Number(p.value).toFixed(0)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1 style={{ margin: "0 0 24px", fontSize: "24px", color: BROWN, fontWeight: "800" }}>📈 Analytics</h1>

      {/* Period filter */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
        {PERIODS.map(p => <PeriodBtn key={p.id} p={p} />)}
        {period === "custom" && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center", background: "#fff", padding: "8px 14px", borderRadius: "10px", border: "1px solid #eaeaea" }}>
            <input type="date" value={custom.from} onChange={e => setCustom(c => ({ ...c, from: e.target.value }))}
              style={{ border: "1px solid #ddd", borderRadius: "6px", padding: "6px 10px", fontSize: "13px", outline: "none" }} />
            <span style={{ color: "#aaa", fontSize: "13px" }}>→</span>
            <input type="date" value={custom.to} onChange={e => setCustom(c => ({ ...c, to: e.target.value }))}
              style={{ border: "1px solid #ddd", borderRadius: "6px", padding: "6px 10px", fontSize: "13px", outline: "none" }} />
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ padding: "60px", textAlign: "center", color: "#aaa" }}>Loading analytics…</div>
      ) : (
        <>
          {/* Summary cards */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "28px", flexWrap: "wrap" }}>
            <SummaryCard title="Revenue" value={`৳${totalRevenue.toLocaleString()}`} icon="💰" color={BROWN} sub={`${totalOrders} orders in period`} />
            <SummaryCard title="Cost" value={`৳${totalCost.toLocaleString()}`} icon="📦" color="#e74c3c" sub="Buying cost" />
            <SummaryCard title="Profit" value={`৳${totalProfit.toLocaleString()}`} icon="📊" color="#27ae60" sub={totalRevenue > 0 ? `Margin: ${((totalProfit/totalRevenue)*100).toFixed(1)}%` : ""} />
            <SummaryCard title="All-Time Cash Earned" value={`৳${allTimeProfit.toLocaleString()}`} icon="🏆" color={RUST} sub={`Total revenue: ৳${allTimeRevenue.toLocaleString()}`} />
          </div>

          {/* Revenue + Profit chart */}
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #eaeaea", padding: "24px", marginBottom: "24px" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: "700", color: BROWN }}>Revenue & Profit Over Time</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} barGap={4} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#888" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#888" }} tickFormatter={v => `৳${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={n => n === "revenue" ? "Revenue" : "Profit"} />
                  <Bar dataKey="revenue" name="revenue" fill={BROWN} radius={[4,4,0,0]} />
                  <Bar dataKey="profit"  name="profit"  fill="#27ae60" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: "#bbb" }}>
                No orders in this period
              </div>
            )}
          </div>

          {/* Orders per day line chart */}
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #eaeaea", padding: "24px", marginBottom: "24px" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: "700", color: BROWN }}>Orders Volume</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#888" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#888" }} />
                <Tooltip formatter={v => [`${v} order(s)`, "Orders"]} />
                <Line type="monotone" dataKey="orders" stroke={RUST} strokeWidth={2} dot={{ fill: RUST, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Profit breakdown table */}
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #eaeaea", padding: "24px" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "700", color: BROWN }}>💵 Cash Earned Summary</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              {[
                { label: "This Week's Revenue",  val: (() => { const r = getWeekRange();  return orders.filter(o => new Date(o.created_at) >= r.from && new Date(o.created_at) <= r.to).reduce((s,o)=>s+Number(o.total||0),0); })() },
                { label: "This Month's Revenue", val: (() => { const r = getMonthRange(); return orders.filter(o => new Date(o.created_at) >= r.from && new Date(o.created_at) <= r.to).reduce((s,o)=>s+Number(o.total||0),0); })() },
                { label: "This Year's Revenue",  val: (() => { const r = getYearRange();  return orders.filter(o => new Date(o.created_at) >= r.from && new Date(o.created_at) <= r.to).reduce((s,o)=>s+Number(o.total||0),0); })() },
                { label: "This Week's Profit",   val: (() => { const r = getWeekRange();  return orders.filter(o => new Date(o.created_at) >= r.from && new Date(o.created_at) <= r.to).reduce((s,o)=>s+Number(o.profit||0),0); })(), green: true },
                { label: "This Month's Profit",  val: (() => { const r = getMonthRange(); return orders.filter(o => new Date(o.created_at) >= r.from && new Date(o.created_at) <= r.to).reduce((s,o)=>s+Number(o.profit||0),0); })(), green: true },
                { label: "All-Time Profit",       val: allTimeProfit, green: true },
              ].map((item, i) => (
                <div key={i} style={{ padding: "16px", background: item.green ? "#f0fff4" : LIGHT, borderRadius: "12px", border: `1px solid ${item.green ? "#c3f0d0" : BEIGE}` }}>
                  <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#888", fontWeight: "600" }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: item.green ? "#27ae60" : BROWN }}>
                    ৳{item.val.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
