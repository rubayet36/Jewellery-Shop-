import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import OverviewTab from "./OverviewTab";
import ProductsTab from "./ProductsTab";
import TransactionsTab from "./TransactionsTab";
import AnalyticsTab from "./AnalyticsTab";

// ── AdminDashboard ────────────────────────────────────────────────────────────
// Sidebar shell that checks authentication with Supabase Auth.
// Shows a beautiful, cute marshmallow solid-colored AdminLogin card when signed out.
// Shows dashboard tabs when authenticated.
//
// Tab files (each self-contained):
//   OverviewTab     → OverviewTab.jsx      (stats + stock sync)
//   ProductsTab     → ProductsTab.jsx      (add / edit / delete products)
//   TransactionsTab → TransactionsTab.jsx  (pending & delivered orders)
//
// Shared constants → adminConstants.js

const BROWN = "#831843"; // Deep Berry/Plum
const RUST = "#db2777";  // Active Blush Rose
const LIGHT = "#fff1f6"; // Soft Rose Tinted

function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCheckingAuth(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const tabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "analytics", label: "📈 Analytics" },
    { id: "products", label: "💎 Products" },
    { id: "transactions", label: "📦 Transactions" },
  ];

  // Auth checking loader
  if (checkingAuth) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff9fb",
          fontFamily: "'Fredoka', system-ui, sans-serif",
          color: BROWN,
          fontWeight: "800",
          fontSize: "18px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "44px", marginBottom: "10px", animation: "bounce 1s infinite" }}>🔑</div>
          Checking keyhole...
        </div>
      </div>
    );
  }

  // Render Login Card if not authenticated
  if (!session) {
    return <AdminLogin />;
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#fff9fb", // Gorgeous minimal rose tint background
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: "260px",
          background: "#fff",
          borderRight: "1px solid #fce7f3", // Soft pink border line
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "24px", borderBottom: "1px solid #fce7f3" }}>
          <h2
            style={{
              margin: 0,
              color: BROWN,
              fontSize: "20px",
              fontWeight: "800",
            }}
          >
            Admin Portal 🧸
          </h2>
        </div>
        <nav
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                background: activeTab === tab.id ? LIGHT : "transparent",
                color: activeTab === tab.id ? RUST : "#555",
                fontWeight: activeTab === tab.id ? "700" : "500",
                textAlign: "left",
                fontSize: "14px",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        
        {/* Sidebar Footer with Logout option */}
        <div
          style={{
            marginTop: "auto",
            padding: "16px",
            borderTop: "1px solid #fce7f3",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "1.5px solid #ffccd5",
              background: "#fff5f8",
              color: "#ff5d8f",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ff5d8f";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff5f8";
              e.currentTarget.style.color = "#ff5d8f";
            }}
          >
            Sign Out 🔒
          </button>
          <a
            href="/"
            style={{
              color: "#888",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            ← Back to Store
          </a>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main
        style={{
          flex: 1,
          padding: "32px 40px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "products" && <ProductsTab />}
        {activeTab === "transactions" && <TransactionsTab />}
      </main>
    </div>
  );
}

// ── AdminLogin Component ──────────────────────────────────────────────────────
function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });
    
    if (error) {
      setErrorMsg(error.message);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff9fb",
        fontFamily: "'Fredoka', system-ui, sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#fff",
          borderRadius: "28px",
          border: "3px solid #ffccd5",
          boxShadow: "0 16px 36px rgba(255, 93, 143, 0.08)",
          padding: "36px 28px",
          textAlign: "center",
          animation: "scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) ease",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: "52px", marginBottom: "12px" }}>🧸🔒</div>
        <h2 style={{ color: BROWN, fontSize: "24px", fontWeight: "800", margin: "0 0 8px" }}>
          Admin Login
        </h2>
        <p style={{ color: "#5c3d4c", fontSize: "14px", margin: "0 0 24px" }}>
          Please enter your credentials to open the door ✨
        </p>

        {errorMsg && (
          <div
            style={{
              background: "#ffeef2",
              border: "1.5px solid #ffccd5",
              borderRadius: "14px",
              padding: "10px 14px",
              color: "#ff5d8f",
              fontSize: "13px",
              fontWeight: "700",
              marginBottom: "18px",
              textAlign: "left",
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ textAlign: "left" }}>
            <label style={{ fontSize: "12px", fontWeight: "800", color: BROWN, display: "block", marginBottom: "6px", letterSpacing: "0.5px" }}>
              EMAIL ADDRESS 📧
            </label>
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #ffccd5",
                borderRadius: "14px",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                background: "#fff9fb",
                color: "#5c3d4c",
                fontWeight: "600",
              }}
            />
          </div>

          <div style={{ textAlign: "left" }}>
            <label style={{ fontSize: "12px", fontWeight: "800", color: BROWN, display: "block", marginBottom: "6px", letterSpacing: "0.5px" }}>
              PASSWORD 🔑
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #ffccd5",
                borderRadius: "14px",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                background: "#fff9fb",
                color: "#5c3d4c",
                fontWeight: "600",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="cute-bubble-btn"
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#ccc" : "#ff5d8f",
              color: "#fff",
              border: "none",
              borderRadius: "999px",
              fontSize: "14px",
              fontWeight: "800",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 6px 14px rgba(255, 93, 143, 0.2)",
              marginTop: "8px",
            }}
          >
            {loading ? "Opening Door..." : "Sign In ✨"}
          </button>
        </form>

        <a
          href="/"
          style={{
            display: "inline-block",
            marginTop: "20px",
            color: "#888",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          ← Return to Storefront
        </a>
      </div>
    </div>
  );
}

export default AdminDashboard;
