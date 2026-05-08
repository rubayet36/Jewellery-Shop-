import React, { useState } from "react";
import OverviewTab      from "./OverviewTab";
import ProductsTab      from "./ProductsTab";
import TransactionsTab  from "./TransactionsTab";

// ── AdminDashboard ────────────────────────────────────────────────────────────
// Sidebar shell that switches between the three admin tabs.
//
// Tab files (each self-contained):
//   OverviewTab     → OverviewTab.jsx      (stats + stock sync)
//   ProductsTab     → ProductsTab.jsx      (add / edit / delete products)
//   TransactionsTab → TransactionsTab.jsx  (pending & delivered orders)
//
// Shared constants → adminConstants.js

const BROWN = "#752700";
const RUST  = "#a44f31";
const LIGHT = "#fdf6f0";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview",      label: "📊 Overview" },
    { id: "products",      label: "💎 Products" },
    { id: "transactions",  label: "📦 Transactions" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fa", fontFamily: "system-ui, sans-serif" }}>
      {/* ── Sidebar ── */}
      <aside style={{ width: "260px", background: "#fff", borderRight: "1px solid #eaeaea", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "24px", borderBottom: "1px solid #eaeaea" }}>
          <h2 style={{ margin: 0, color: BROWN, fontSize: "20px", fontWeight: "800" }}>Admin Portal</h2>
        </div>
        <nav style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "12px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
                background: activeTab === tab.id ? LIGHT : "transparent",
                color: activeTab === tab.id ? RUST : "#555",
                fontWeight: activeTab === tab.id ? "700" : "500",
                textAlign: "left", fontSize: "14px", transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: "auto", padding: "16px", borderTop: "1px solid #eaeaea" }}>
          <a href="/" style={{ color: "#888", textDecoration: "none", fontSize: "13px", fontWeight: "600" }}>← Back to Store</a>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, padding: "32px 40px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {activeTab === "overview"     && <OverviewTab />}
        {activeTab === "products"     && <ProductsTab />}
        {activeTab === "transactions" && <TransactionsTab />}
      </main>
    </div>
  );
}

export default AdminDashboard;
