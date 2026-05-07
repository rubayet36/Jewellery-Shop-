import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";

const BROWN = "#752700";
const RUST  = "#a44f31";
const BEIGE = "#f3e0d0";
const LIGHT = "#fdf6f0";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fa", fontFamily: "system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: "260px", background: "#fff", borderRight: "1px solid #eaeaea", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "24px", borderBottom: "1px solid #eaeaea" }}>
          <h2 style={{ margin: 0, color: BROWN, fontSize: "20px", fontWeight: "800" }}>Admin Portal</h2>
        </div>
        <nav style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { id: "overview", label: "📊 Overview" },
            { id: "products", label: "💎 Products" },
            { id: "transactions", label: "📦 Transactions" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "12px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
                background: activeTab === tab.id ? LIGHT : "transparent",
                color: activeTab === tab.id ? RUST : "#555",
                fontWeight: activeTab === tab.id ? "700" : "500",
                textAlign: "left", fontSize: "14px", transition: "all 0.2s"
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

      {/* Main Content */}
      <main style={{ flex: 1, padding: "32px 40px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "products" && <ProductsTab />}
        {activeTab === "transactions" && <TransactionsTab />}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Overview Tab
function OverviewTab() {
  const [stats, setStats] = useState({ products: 0, lowStock: 0, orders: 0, revenue: 0 });
  
  useEffect(() => {
    async function fetchStats() {
      const { count: prodCount } = await supabase.from("products").select("*", { count: "exact", head: true });
      const { data: lowStockData } = await supabase.from("products").select("id").lte("stock", 5);
      
      let ordCount = 0;
      let rev = 0;
      try {
        const { data: orders } = await supabase.from("orders").select("total");
        if (orders) {
          ordCount = orders.length;
          rev = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        }
      } catch (e) { console.log("Orders table might not exist yet."); }

      setStats({ products: prodCount || 0, lowStock: lowStockData?.length || 0, orders: ordCount, revenue: rev });
    }
    fetchStats();
  }, []);

  const Card = ({ title, value, color }) => (
    <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #eaeaea", flex: 1, boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
      <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#666", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</p>
      <p style={{ margin: 0, fontSize: "32px", fontWeight: "800", color }}>{value}</p>
    </div>
  );

  return (
    <div>
      <h1 style={{ margin: "0 0 24px", fontSize: "24px", color: BROWN, fontWeight: "800" }}>Dashboard Overview</h1>
      <div style={{ display: "flex", gap: "20px", marginBottom: "32px" }}>
        <Card title="Total Products" value={stats.products} color={BROWN} />
        <Card title="Low Stock Alerts" value={stats.lowStock} color={stats.lowStock > 0 ? "#e74c3c" : "#27ae60"} />
        <Card title="Total Orders" value={stats.orders} color={RUST} />
        <Card title="Revenue" value={`৳${stats.revenue.toFixed(0)}`} color="#27ae60" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Products Tab
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initForm = { name: "", category_id: "", price: "", description: "", image_url: "", design: "", stock: 0, colors: "", is_sale: false, sale_price: "" };
  const [form, setForm] = useState(initForm);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*, categories(name)").order('id', { ascending: false });
    if (data) setProducts(data);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*");
    if (data) setCategories(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const colorsArray = typeof form.colors === "string" ? form.colors.split(",").map(c => c.trim()).filter(Boolean) : form.colors;
    
    const payload = {
      name: form.name,
      category_id: form.category_id,
      price: Number(form.price),
      description: form.description,
      image_url: form.image_url,
      design: form.design,
      stock: Number(form.stock),
      colors: colorsArray,
      is_sale: form.is_sale,
      sale_price: form.sale_price ? Number(form.sale_price) : null
    };

    if (editingId) {
      await supabase.from("products").update(payload).eq("id", editingId);
    } else {
      await supabase.from("products").insert([payload]);
    }

    setForm(initForm);
    setEditingId(null);
    fetchProducts();
    setLoading(false);
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name, category_id: p.category_id, price: p.price, description: p.description || "", image_url: p.image_url || "",
      design: p.design || "", stock: p.stock || 0, colors: Array.isArray(p.colors) ? p.colors.join(", ") : "",
      is_sale: p.is_sale || false, sale_price: p.sale_price || ""
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      await supabase.from("products").delete().eq("id", id);
      fetchProducts();
    }
  };

  return (
    <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
      {/* Form */}
      <div style={{ width: "360px", background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #eaeaea", flexShrink: 0, position: "sticky", top: "32px" }}>
        <h2 style={{ margin: "0 0 20px", fontSize: "18px", color: BROWN }}>{editingId ? "Edit Product" : "Add New Product"}</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <input placeholder="Product Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inputStyle} />
          <select required value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} style={inputStyle}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: BROWN, letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>PRICE (৳)</label>
              <input type="number" placeholder="0.00" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: BROWN, letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>STOCK QTY</label>
              <input type="number" min="0" placeholder="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} style={{ ...inputStyle, borderColor: Number(form.stock) === 0 ? "#e74c3c" : "#ddd" }} />
              {Number(form.stock) === 0 && (
                <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#e74c3c", fontWeight: "600" }}>⚠ Will show as Out of Stock</p>
              )}
            </div>
          </div>
          <input placeholder="Image URL" type="url" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} style={inputStyle} />
          <input placeholder="Design / Brand" value={form.design} onChange={e => setForm({...form, design: e.target.value})} style={inputStyle} />
          <input placeholder="Colors (comma separated)" value={form.colors} onChange={e => setForm({...form, colors: e.target.value})} style={inputStyle} />
          <textarea placeholder="Description" rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{...inputStyle, resize: "vertical"}} />
          
          <div style={{ padding: "12px", background: LIGHT, borderRadius: "8px", border: `1px solid ${BEIGE}` }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600", color: BROWN, cursor: "pointer" }}>
              <input type="checkbox" checked={form.is_sale} onChange={e => setForm({...form, is_sale: e.target.checked})} />
              Put on Sale
            </label>
            {form.is_sale && (
              <input type="number" placeholder="Sale Price" value={form.sale_price} onChange={e => setForm({...form, sale_price: e.target.value})} style={{...inputStyle, marginTop: "10px"}} />
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm(initForm); }} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontWeight: "600", flex: 1 }}>
                Cancel
              </button>
            )}
            <button type="submit" disabled={loading} style={{ padding: "12px", borderRadius: "8px", border: "none", background: RUST, color: "#fff", cursor: "pointer", fontWeight: "700", flex: 2 }}>
              {loading ? "Saving..." : editingId ? "Update" : "Add Product"}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div style={{ flex: 1, background: "#fff", borderRadius: "16px", border: "1px solid #eaeaea", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#fafafa", borderBottom: "1px solid #eaeaea" }}>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>Stock</th>
              <th style={thStyle}>Status</th>
              <th style={{...thStyle, textAlign: "right"}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: "1px solid #eaeaea" }}>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {p.image_url ? <img src={p.image_url} alt="" style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover" }} /> : <div style={{ width: "40px", height: "40px", background: "#eee", borderRadius: "6px" }} />}
                    <div>
                      <p style={{ margin: 0, fontWeight: "600", color: "#333" }}>{p.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#888" }}>{p.categories?.name}</p>
                    </div>
                  </div>
                </td>
                <td style={tdStyle}>৳{p.price}</td>
                <td style={tdStyle}>
                  <span style={{ color: p.stock <= 5 ? "#e74c3c" : "#333", fontWeight: p.stock <= 5 ? "700" : "400" }}>{p.stock}</span>
                </td>
                <td style={tdStyle}>
                  {p.is_sale ? <span style={{ background: "#ffe8e8", color: "#e74c3c", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>SALE</span> : <span style={{ color: "#999", fontSize: "12px" }}>Normal</span>}
                </td>
                <td style={{...tdStyle, textAlign: "right"}}>
                  <button onClick={() => handleEdit(p)} style={{ background: "none", border: "none", color: "#3498db", cursor: "pointer", marginRight: "12px", fontWeight: "600" }}>Edit</button>
                  <button onClick={() => handleDelete(p.id)} style={{ background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontWeight: "600" }}>Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan="5" style={{ padding: "32px", textAlign: "center", color: "#999" }}>No products found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Transactions Tab
function TransactionsTab() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
        if (!error && data) setOrders(data);
      } catch(e) { console.log(e); }
    }
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #eaeaea", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ background: "#fafafa", borderBottom: "1px solid #eaeaea" }}>
            <th style={thStyle}>Order ID</th>
            <th style={thStyle}>Customer</th>
            <th style={thStyle}>Items</th>
            <th style={thStyle}>Total</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Status</th>
            <th style={{...thStyle, textAlign: "right"}}>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id} style={{ borderBottom: "1px solid #eaeaea" }}>
              <td style={{...tdStyle, fontFamily: "monospace", fontSize: "12px", color: "#888" }}>{o.id.split("-")[0]}</td>
              <td style={tdStyle}>
                <p style={{ margin: 0, fontWeight: "600" }}>{o.customer_name}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{o.customer_email}</p>
              </td>
              <td style={tdStyle}>
                <p style={{ margin: 0, fontSize: "13px" }}>{(o.items || []).length} items</p>
              </td>
              <td style={{...tdStyle, fontWeight: "700" }}>৳{o.total}</td>
              <td style={{...tdStyle, fontSize: "13px", color: "#666" }}>{new Date(o.created_at).toLocaleDateString()}</td>
              <td style={tdStyle}>
                {o.status === 'delivered' 
                  ? <span style={{ background: "#e8f8f5", color: "#27ae60", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>Delivered</span>
                  : <span style={{ background: "#fef9e7", color: "#f39c12", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>Pending</span>
                }
              </td>
              <td style={{...tdStyle, textAlign: "right"}}>
                {o.status !== 'delivered' && (
                  <button onClick={() => updateStatus(o.id, "delivered")} style={{ background: "#27ae60", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                    Mark Delivered
                  </button>
                )}
              </td>
            </tr>
          ))}
          {orders.length === 0 && <tr><td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#999" }}>No orders found. Ensure 'orders' table exists in Supabase.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

// Helpers
const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" };
const thStyle = { padding: "16px", fontSize: "12px", fontWeight: "600", color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" };
const tdStyle = { padding: "16px", fontSize: "14px", color: "#333", verticalAlign: "middle" };

export default AdminDashboard;
