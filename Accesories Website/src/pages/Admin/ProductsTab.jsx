import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { BROWN, RUST, BEIGE, LIGHT, inputStyle } from "./adminConstants";
import { FiX, FiPlus, FiSearch } from "react-icons/fi";

// ── Products Tab ─────────────────────────────────────────────────────────────
// Allows admins to add, edit, and delete products.
// Implements database pagination (20 per page), search, and category filters.
// Opens the Add/Edit form in a clean popup modal.
// Includes a Preorder option with shipping day estimate.
export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Pagination & Filter state
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchVal, setSearchVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const ITEMS_PER_PAGE = 20;

  const initForm = {
    name: "",
    category_id: "",
    price: "",
    buying_price: "",
    description: "",
    image_url: "",
    additional_images: "",
    design: "",
    stock: 0,
    colors: "",
    is_sale: false,
    sale_price: "",
    is_preorder: false,
    preorder_days: "",
  };
  const [form, setForm] = useState(initForm);

  // Fetch categories once on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Debounce search query
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchVal);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchVal]);

  // Reset pagination on filter change
  useEffect(() => {
    setPage(0);
  }, [searchQuery, filterCategory]);

  // Fetch products when page or filters change
  useEffect(() => {
    fetchProducts();
  }, [page, searchQuery, filterCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    const from = page * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    try {
      let query;
      if (filterCategory) {
        query = supabase
          .from("products")
          .select("*, categories!inner(name)", { count: "exact" })
          .eq("category_id", filterCategory);
      } else {
        query = supabase
          .from("products")
          .select("*, categories(name)", { count: "exact" });
      }

      if (searchQuery.trim()) {
        const q = `%${searchQuery.trim()}%`;
        query = query.or(`name.ilike.${q},description.ilike.${q}`);
      }

      query = query.order("id", { ascending: false }).range(from, to);

      const { data, count, error } = await query;
      if (error) {
        console.error("Error fetching products:", error);
      } else if (data) {
        setProducts(data);
        setTotalCount(count || data.length);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*");
    if (data) setCategories(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const colorsArray =
      typeof form.colors === "string"
        ? form.colors
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean)
        : form.colors;

    const payload = {
      name: form.name,
      category_id: form.category_id,
      price: Number(form.price),
      buying_price: form.buying_price ? Number(form.buying_price) : null,
      description: form.description,
      image_url: form.image_url,
      additional_images: form.additional_images || "",
      design: form.design,
      stock: Number(form.stock),
      colors: colorsArray,
      is_sale: form.is_sale,
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      is_preorder: form.is_preorder || false,
      preorder_days: form.is_preorder && form.preorder_days ? Number(form.preorder_days) : null,
    };

    if (editingId) {
      await supabase.from("products").update(payload).eq("id", editingId);
    } else {
      await supabase.from("products").insert([payload]);
    }

    setForm(initForm);
    setEditingId(null);
    setIsFormOpen(false);
    fetchProducts();
    setLoading(false);
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category_id: p.category_id,
      price: p.price,
      buying_price: p.buying_price || "",
      description: p.description || "",
      image_url: p.image_url || "",
      additional_images: p.additional_images || "",
      design: p.design || "",
      stock: p.stock || 0,
      colors: Array.isArray(p.colors) ? p.colors.join(", ") : "",
      is_sale: p.is_sale || false,
      sale_price: p.sale_price || "",
      is_preorder: p.is_preorder || false,
      preorder_days: p.preorder_days || "",
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product permanently?")) {
      await supabase.from("products").delete().eq("id", id);
      fetchProducts();
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(initForm);
    setIsFormOpen(true);
  };

  const thStyle = {
    padding: "16px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };
  const tdStyle = {
    padding: "16px",
    fontSize: "14px",
    color: "#333",
    verticalAlign: "middle",
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* ── Top Filters Row ── */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "center",
          flexWrap: "wrap",
          background: "#fff",
          padding: "16px 24px",
          borderRadius: "16px",
          border: "1px solid #eaeaea",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", position: "relative", width: "280px" }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 36px",
              border: "1.5px solid #ddd",
              borderRadius: "10px",
              fontSize: "13px",
              outline: "none",
            }}
          />
          <FiSearch size={16} style={{ position: "absolute", left: "12px", color: "#aaa" }} />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: "10px 14px",
            border: "1.5px solid #ddd",
            borderRadius: "10px",
            fontSize: "13px",
            outline: "none",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <span style={{ fontSize: "13px", color: "#888", fontWeight: "600", marginLeft: "8px" }}>
          {totalCount} products found
        </span>

        {/* Add Product Button - Top Right */}
        <button
          onClick={openAddModal}
          style={{
            marginLeft: "auto",
            background: RUST,
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "10px 20px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 12px rgba(255,93,143,0.15)",
          }}
        >
          <FiPlus size={16} /> Add Product
        </button>
      </div>

      {/* ── Products Table ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #eaeaea",
          overflowX: "auto",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
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
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Buy</th>
              <th style={thStyle}>Sell</th>
              <th style={thStyle}>Profit</th>
              <th style={thStyle}>Stock</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const profit = p.buying_price
                ? Number(p.price) - Number(p.buying_price)
                : null;
              return (
                <tr key={p.id} style={{ borderBottom: "1px solid #eaeaea" }}>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt=""
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            background: "#ffeef2",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px"
                          }}
                        >
                          💍
                        </div>
                      )}
                      <div>
                        <p style={{ margin: 0, fontWeight: "700", color: BROWN }}>
                          {p.name}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#888" }}>
                          {p.categories?.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, color: "#e74c3c", fontWeight: "600" }}>
                    {p.buying_price ? `৳${p.buying_price}` : <span style={{ color: "#ccc" }}>—</span>}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: "600" }}>৳{p.price}</td>
                  <td style={tdStyle}>
                    {profit !== null ? (
                      <span style={{ color: profit >= 0 ? "#27ae60" : "#e74c3c", fontWeight: "700" }}>
                        ৳{profit.toFixed(0)}
                      </span>
                    ) : (
                      <span style={{ color: "#ccc" }}>—</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: p.stock <= 5 ? "#e74c3c" : "#333", fontWeight: p.stock <= 5 ? "700" : "400" }}>
                      {p.stock}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {p.is_sale && (
                        <span style={{ background: "#ffe8e8", color: "#e74c3c", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>
                          SALE
                        </span>
                      )}
                      {p.is_preorder && (
                        <span style={{ background: "#fff2e0", color: "#e67e22", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>
                          PREORDER ({p.preorder_days}d)
                        </span>
                      )}
                      {!p.is_sale && !p.is_preorder && (
                        <span style={{ color: "#999", fontSize: "12px" }}>Normal</span>
                      )}
                    </div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <button
                      onClick={() => handleEdit(p)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#3498db",
                        cursor: "pointer",
                        marginRight: "12px",
                        fontWeight: "700",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#e74c3c",
                        cursor: "pointer",
                        fontWeight: "700",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#999" }}>
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Table Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", padding: "10px" }}>
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            style={{
              padding: "6px 14px",
              border: "1.5px solid #ddd",
              background: page === 0 ? "#f5f5f5" : "#fff",
              borderRadius: "8px",
              cursor: page === 0 ? "not-allowed" : "pointer",
              fontSize: "13px",
              fontWeight: "700",
              color: BROWN,
            }}
          >
            ← Prev
          </button>
          <span style={{ fontSize: "13px", fontWeight: "700", color: BROWN }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            style={{
              padding: "6px 14px",
              border: "1.5px solid #ddd",
              background: page >= totalPages - 1 ? "#f5f5f5" : "#fff",
              borderRadius: "8px",
              cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
              fontSize: "13px",
              fontWeight: "700",
              color: BROWN,
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Add / Edit Form Modal Popup ── */}
      {isFormOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setIsFormOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "680px",
              background: "#fff",
              borderRadius: "24px",
              boxShadow: "0 20px 50px rgba(157,23,77,0.18)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1.5px solid #fce7f3", background: "#fff5f8" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: BROWN, fontWeight: "800" }}>
                {editingId ? "✏️ Edit Product" : "💎 Add New Product"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                style={{ background: "none", border: "none", color: BROWN, cursor: "pointer" }}
              >
                <FiX size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px", flex: 1 }}
            >
              <input
                placeholder="Product Name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ ...inputStyle, flexShrink: 0 }}
              />
              <select
                required
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                style={{ ...inputStyle, flexShrink: 0 }}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#e74c3c", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>
                    BUYING PRICE (৳)
                  </label>
                  <input
                    type="number"
                    placeholder="Cost price"
                    value={form.buying_price}
                    onChange={(e) => setForm({ ...form, buying_price: e.target.value })}
                    style={{ ...inputStyle, borderColor: "#f5c6c6", flexShrink: 0 }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#27ae60", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>
                    SELLING PRICE (৳)
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    style={{ ...inputStyle, borderColor: "#b2dfdb", flexShrink: 0 }}
                  />
                </div>
              </div>

              {form.buying_price && form.price && (
                <div style={{ padding: "10px 12px", background: "#f0fff4", borderRadius: "8px", border: "1px solid #c3f0d0", fontSize: "13px", flexShrink: 0 }}>
                  <span style={{ color: "#888" }}>Profit per unit: </span>
                  <strong style={{ color: Number(form.price) - Number(form.buying_price) >= 0 ? "#27ae60" : "#e74c3c" }}>
                    ৳{(Number(form.price) - Number(form.buying_price)).toFixed(2)}
                  </strong>
                  {Number(form.buying_price) > 0 && (
                    <span style={{ color: "#aaa", marginLeft: "8px" }}>
                      ({(((Number(form.price) - Number(form.buying_price)) / Number(form.buying_price)) * 100).toFixed(1)}% margin)
                    </span>
                  )}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: BROWN, letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>
                    STOCK QTY
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    style={{ ...inputStyle, borderColor: Number(form.stock) === 0 ? "#e74c3c" : "#ddd", flexShrink: 0 }}
                  />
                  {Number(form.stock) === 0 && (
                    <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#e74c3c", fontWeight: "600" }}>
                      ⚠ Will show as Out of Stock
                    </p>
                  )}
                </div>
              </div>

              <input
                placeholder="Image URL"
                type="url"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                style={{ ...inputStyle, flexShrink: 0 }}
              />
              <textarea
                placeholder="Additional Image URLs (comma separated)"
                rows="2"
                value={form.additional_images || ""}
                onChange={(e) => setForm({ ...form, additional_images: e.target.value })}
                style={{ ...inputStyle, height: "72px", resize: "vertical", flexShrink: 0, fontFamily: "inherit" }}
              />
              <input
                placeholder="Design / Brand"
                value={form.design}
                onChange={(e) => setForm({ ...form, design: e.target.value })}
                style={{ ...inputStyle, flexShrink: 0 }}
              />
              <input
                placeholder="Colors (comma separated)"
                value={form.colors}
                onChange={(e) => setForm({ ...form, colors: e.target.value })}
                style={{ ...inputStyle, flexShrink: 0 }}
              />
              <textarea
                placeholder="Description"
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ ...inputStyle, height: "100px", resize: "vertical", flexShrink: 0, fontFamily: "inherit" }}
              />

              {/* Put on Sale option */}
              <div style={{ padding: "12px", background: LIGHT, borderRadius: "12px", border: `1px solid ${BEIGE}`, flexShrink: 0 }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "700", color: BROWN, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.is_sale}
                    onChange={(e) => setForm({ ...form, is_sale: e.target.checked })}
                  />
                  Put on Sale ✨
                </label>
                {form.is_sale && (
                  <input
                    type="number"
                    placeholder="Sale Price"
                    value={form.sale_price}
                    onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
                    style={{ ...inputStyle, marginTop: "10px", flexShrink: 0 }}
                  />
                )}
              </div>

              {/* Preorder option */}
              <div style={{ padding: "12px", background: "#fffaf0", borderRadius: "12px", border: "1px solid #ffd8a8", flexShrink: 0 }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "700", color: "#e67e22", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.is_preorder}
                    onChange={(e) => setForm({ ...form, is_preorder: e.target.checked })}
                  />
                  Enable Preorder 📦
                </label>
                {form.is_preorder && (
                  <div style={{ marginTop: "10px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "700", color: "#e67e22", display: "block", marginBottom: "4px" }}>
                      SHIPPING DELAY (DAYS)
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 15 days"
                      value={form.preorder_days}
                      onChange={(e) => setForm({ ...form, preorder_days: e.target.value })}
                      style={{ ...inputStyle, flexShrink: 0 }}
                    />
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div style={{ display: "flex", gap: "10px", marginTop: "8px", flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1.5px solid #ddd",
                    background: "#fff",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "13px",
                    color: "#666",
                    flex: 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    background: RUST,
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: "800",
                    fontSize: "13px",
                    flex: 2,
                    boxShadow: "0 4px 12px rgba(255,93,143,0.15)",
                  }}
                >
                  {loading ? "Saving..." : editingId ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
