import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { BROWN, RUST, BEIGE, LIGHT, inputStyle } from "./adminConstants";

// ── Products Tab ─────────────────────────────────────────────────────────────
// Allows admins to add, edit, and delete products with all their details.
export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initForm = {
    name: "",
    category_id: "",
    price: "",
    buying_price: "",
    description: "",
    image_url: "",
    design: "",
    stock: 0,
    colors: "",
    is_sale: false,
    sale_price: "",
  };
  const [form, setForm] = useState(initForm);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("id", { ascending: false });
    if (data) setProducts(data);
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
      design: form.design,
      stock: Number(form.stock),
      colors: colorsArray,
      is_sale: form.is_sale,
      sale_price: form.sale_price ? Number(form.sale_price) : null,
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
      name: p.name,
      category_id: p.category_id,
      price: p.price,
      buying_price: p.buying_price || "",
      description: p.description || "",
      image_url: p.image_url || "",
      design: p.design || "",
      stock: p.stock || 0,
      colors: Array.isArray(p.colors) ? p.colors.join(", ") : "",
      is_sale: p.is_sale || false,
      sale_price: p.sale_price || "",
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      await supabase.from("products").delete().eq("id", id);
      fetchProducts();
    }
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

  return (
    <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
      {/* ── Add / Edit Form ── */}
      <div
        style={{
          width: "360px",
          background: "#fff",
          padding: "24px",
          borderRadius: "16px",
          border: "1px solid #eaeaea",
          flexShrink: 0,
          position: "sticky",
          top: "32px",
        }}
      >
        <h2 style={{ margin: "0 0 20px", fontSize: "18px", color: BROWN }}>
          {editingId ? "Edit Product" : "Add New Product"}
        </h2>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          <input
            placeholder="Product Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={inputStyle}
          />
          <select
            required
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            style={inputStyle}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#e74c3c",
                  letterSpacing: "0.5px",
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                BUYING PRICE (৳)
              </label>
              <input
                type="number"
                placeholder="Cost price"
                value={form.buying_price}
                onChange={(e) =>
                  setForm({ ...form, buying_price: e.target.value })
                }
                style={{ ...inputStyle, borderColor: "#f5c6c6" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#27ae60",
                  letterSpacing: "0.5px",
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                SELLING PRICE (৳)
              </label>
              <input
                type="number"
                placeholder="0.00"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                style={{ ...inputStyle, borderColor: "#b2dfdb" }}
              />
            </div>
          </div>
          {form.buying_price && form.price && (
            <div
              style={{
                padding: "10px 12px",
                background: "#f0fff4",
                borderRadius: "8px",
                border: "1px solid #c3f0d0",
                fontSize: "13px",
              }}
            >
              <span style={{ color: "#888" }}>Profit per unit: </span>
              <strong
                style={{
                  color:
                    Number(form.price) - Number(form.buying_price) >= 0
                      ? "#27ae60"
                      : "#e74c3c",
                }}
              >
                ৳{(Number(form.price) - Number(form.buying_price)).toFixed(2)}
              </strong>
              {Number(form.buying_price) > 0 && (
                <span style={{ color: "#aaa", marginLeft: "8px" }}>
                  (
                  {(
                    ((Number(form.price) - Number(form.buying_price)) /
                      Number(form.buying_price)) *
                    100
                  ).toFixed(1)}
                  % margin)
                </span>
              )}
            </div>
          )}
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: BROWN,
                  letterSpacing: "0.5px",
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                STOCK QTY
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                style={{
                  ...inputStyle,
                  borderColor: Number(form.stock) === 0 ? "#e74c3c" : "#ddd",
                }}
              />
              {Number(form.stock) === 0 && (
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "11px",
                    color: "#e74c3c",
                    fontWeight: "600",
                  }}
                >
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
            style={inputStyle}
          />
          <input
            placeholder="Design / Brand"
            value={form.design}
            onChange={(e) => setForm({ ...form, design: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Colors (comma separated)"
            value={form.colors}
            onChange={(e) => setForm({ ...form, colors: e.target.value })}
            style={inputStyle}
          />
          <textarea
            placeholder="Description"
            rows="3"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ ...inputStyle, resize: "vertical" }}
          />

          <div
            style={{
              padding: "12px",
              background: LIGHT,
              borderRadius: "8px",
              border: `1px solid ${BEIGE}`,
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: BROWN,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={form.is_sale}
                onChange={(e) =>
                  setForm({ ...form, is_sale: e.target.checked })
                }
              />
              Put on Sale
            </label>
            {form.is_sale && (
              <input
                type="number"
                placeholder="Sale Price"
                value={form.sale_price}
                onChange={(e) =>
                  setForm({ ...form, sale_price: e.target.value })
                }
                style={{ ...inputStyle, marginTop: "10px" }}
              />
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(initForm);
                }}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer",
                  fontWeight: "600",
                  flex: 1,
                }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                background: RUST,
                color: "#fff",
                cursor: "pointer",
                fontWeight: "700",
                flex: 2,
              }}
            >
              {loading ? "Saving..." : editingId ? "Update" : "Add Product"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Products Table ── */}
      <div
        style={{
          flex: 1,
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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt=""
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "6px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            background: "#eee",
                            borderRadius: "6px",
                          }}
                        />
                      )}
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontWeight: "600",
                            color: "#333",
                          }}
                        >
                          {p.name}
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: "12px",
                            color: "#888",
                          }}
                        >
                          {p.categories?.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td
                    style={{ ...tdStyle, color: "#e74c3c", fontWeight: "600" }}
                  >
                    {p.buying_price ? (
                      `৳${p.buying_price}`
                    ) : (
                      <span style={{ color: "#ccc" }}>—</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: "600" }}>৳{p.price}</td>
                  <td style={tdStyle}>
                    {profit !== null ? (
                      <span
                        style={{
                          color: profit >= 0 ? "#27ae60" : "#e74c3c",
                          fontWeight: "700",
                        }}
                      >
                        ৳{profit.toFixed(0)}
                      </span>
                    ) : (
                      <span style={{ color: "#ccc" }}>—</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        color: p.stock <= 5 ? "#e74c3c" : "#333",
                        fontWeight: p.stock <= 5 ? "700" : "400",
                      }}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {p.is_sale ? (
                      <span
                        style={{
                          background: "#ffe8e8",
                          color: "#e74c3c",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}
                      >
                        SALE
                      </span>
                    ) : (
                      <span style={{ color: "#999", fontSize: "12px" }}>
                        Normal
                      </span>
                    )}
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
                        fontWeight: "600",
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
                        fontWeight: "600",
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
                <td
                  colSpan="7"
                  style={{
                    padding: "32px",
                    textAlign: "center",
                    color: "#999",
                  }}
                >
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
