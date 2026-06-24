import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { BROWN, RUST } from "./adminConstants";

export default function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" }); // { text: "", type: "success" | "error" }
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch (e) {
      showMsg(e.message || "Failed to fetch categories", "error");
    } finally {
      setLoading(false);
    }
  }

  function showMsg(text, type = "success") {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 4000);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      // Check if it already exists
      const exists = categories.some(c => c.name.toLowerCase() === name.trim().toLowerCase());
      if (exists) {
        showMsg("This category already exists! 🌸", "error");
        return;
      }

      const { error } = await supabase.from("categories").insert([
        {
          name: name.trim(),
          image_url: imageUrl.trim() || null
        }
      ]);

      if (error) throw error;

      showMsg("Category added successfully! ✨", "success");
      setName("");
      setImageUrl("");
      fetchCategories();
    } catch (e) {
      showMsg(e.message || "Failed to add category", "error");
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This could leave products under this category uncategorized!`)) {
      return;
    }

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;

      showMsg(`Deleted "${name}" successfully! 🗑️`, "success");
      fetchCategories();
    } catch (e) {
      showMsg(e.message || "Failed to delete category", "error");
    }
  }

  return (
    <div style={{ fontFamily: "'Fredoka', system-ui, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ color: BROWN, fontSize: "28px", fontWeight: "800", margin: 0 }}>📂 Categories</h1>
          <p style={{ color: "#5c3d4c", fontSize: "14px", marginTop: "4px" }}>Manage circular storefront filters and inventory groupings 🌸</p>
        </div>
        <button
          onClick={fetchCategories}
          style={{
            background: "none",
            border: "1px solid #ffccd5",
            borderRadius: "12px",
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            color: RUST,
            background: "#fff",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#fff1f6"}
          onMouseLeave={e => e.currentTarget.style.background = "#fff"}
        >
          ↻ Refresh List
        </button>
      </div>

      {msg.text && (
        <div
          style={{
            background: msg.type === "success" ? "#eafaf1" : "#ffeef2",
            border: `1.5px solid ${msg.type === "success" ? "#2ecc71" : "#ffccd5"}`,
            borderRadius: "14px",
            padding: "12px 18px",
            color: msg.type === "success" ? "#2ecc71" : "#ff5d8f",
            fontSize: "14px",
            fontWeight: "700",
            marginBottom: "20px",
            animation: "scaleIn 0.3s ease"
          }}
        >
          {msg.type === "success" ? "✨" : "⚠️"} {msg.text}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 340px", gap: "28px", alignItems: "start" }}>
        
        {/* Category List */}
        <div style={{ background: "#fff", border: "1px solid #fce7f3", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 24px rgba(255,93,143,0.03)" }}>
          <h3 style={{ margin: "0 0 16px", color: BROWN, fontSize: "18px", fontWeight: "800" }}>Active Storefront Categories</h3>
          {loading && categories.length === 0 ? (
            <p style={{ color: "#999", fontSize: "14px" }}>Loading categories...</p>
          ) : categories.length === 0 ? (
            <p style={{ color: "#999", fontSize: "14px" }}>No categories found in the database. Add your first one on the right! 🧸</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {categories.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: "#fff9fb",
                    borderRadius: "16px",
                    border: "1.5px solid #ffccd5",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <img
                      src={c.image_url || "/ring.jpg"}
                      alt={c.name}
                      style={{
                        width: "48px",
                        height: "48px",
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: `2px solid ${RUST}`,
                        background: "#fff"
                      }}
                      onError={(e) => {
                        e.target.src = "/ring.jpg"; // Graceful fallback
                      }}
                    />
                    <div>
                      <p style={{ margin: 0, fontWeight: "800", color: BROWN, fontSize: "15px" }}>{c.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#888", wordBreak: "break-all" }}>
                        Image Path: {c.image_url || "None (uses fallback)"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    style={{
                      background: "#fff0f0",
                      color: "#e74c3c",
                      border: "1px solid #fbc4c4",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "#e74c3c";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "#fff0f0";
                      e.currentTarget.style.color = "#e74c3c";
                    }}
                  >
                    🗑 Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Category Form */}
        <div
          style={{
            background: "#fff",
            border: "3px solid #ffccd5",
            borderRadius: "24px",
            padding: "24px",
            boxShadow: "0 12px 30px rgba(255,93,143,0.05)",
            boxSizing: "border-box"
          }}
        >
          <div style={{ fontSize: "36px", marginBottom: "8px", textAlign: "center" }}>🧸🎀</div>
          <h3 style={{ margin: "0 0 4px", color: BROWN, fontSize: "18px", fontWeight: "800", textAlign: "center" }}>Add Category</h3>
          <p style={{ color: "#5c3d4c", fontSize: "12px", margin: "0 0 18px", textAlign: "center" }}>Create a dynamic filter option</p>

          <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ textAlign: "left" }}>
              <label style={{ fontSize: "11px", fontWeight: "800", color: BROWN, display: "block", marginBottom: "4px" }}>CATEGORY NAME *</label>
              <input
                required
                type="text"
                placeholder="e.g. Anklets, Tiara"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "2px solid #ffccd5",
                  borderRadius: "10px",
                  fontSize: "13px",
                  background: "#fff9fb",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ textAlign: "left" }}>
              <label style={{ fontSize: "11px", fontWeight: "800", color: BROWN, display: "block", marginBottom: "4px" }}>IMAGE PATH OR URL</label>
              <input
                type="text"
                placeholder="e.g. /anklets.jpg or internet link"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "2px solid #ffccd5",
                  borderRadius: "10px",
                  fontSize: "13px",
                  background: "#fff9fb",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
              <span style={{ fontSize: "10px", color: "#999", marginTop: "4px", display: "block" }}>
                💡 Place images in <code>public/</code> and write like <code>/anklets.jpg</code>
              </span>
            </div>

            <button
              type="submit"
              className="cute-bubble-btn"
              style={{
                width: "100%",
                padding: "11px",
                background: RUST,
                color: "#fff",
                border: "none",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: "800",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(255, 93, 143, 0.15)",
                marginTop: "8px"
              }}
            >
              Save Category ✨
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
