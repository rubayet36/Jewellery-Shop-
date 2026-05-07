import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import Navbar from "../components/Navbar";
import Products from "../components/Products";

const BROWN      = "#752700";
const BEIGE      = "#f3e0d0";
const RUST       = "#a44f31";
const LIGHT_BEIGE = "#fdf6f0";

export default function Sale() {
  const [products, setProducts]                 = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy]                     = useState("default");
  const [filters, setFilters]                   = useState({
    priceMin: "",
    priceMax: "",
    category: "",
    availability: "",
  });

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => { applyFilters(); }, [products, filters, sortBy]);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) console.error("Error fetching products:", error);
    else setProducts((data || []).filter(p => p.is_sale));
  };

  const applyFilters = () => {
    let f = [...products];
    if (filters.priceMin)        f = f.filter((p) => (p.sale_price || p.price) >= parseFloat(filters.priceMin));
    if (filters.priceMax)        f = f.filter((p) => (p.sale_price || p.price) <= parseFloat(filters.priceMax));
    if (filters.category)        f = f.filter((p) => p.category === filters.category);
    if (filters.availability === "in-stock")    f = f.filter((p) => p.stock > 0);
    if (filters.availability === "out-of-stock") f = f.filter((p) => p.stock === 0);
    if (sortBy === "price-asc")  f.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
    if (sortBy === "price-desc") f.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
    if (sortBy === "name-asc")   f.sort((a, b) => a.name?.localeCompare(b.name));
    setFilteredProducts(f);
  };

  const set = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));
  const clear = () => setFilters({ priceMin: "", priceMax: "", category: "", availability: "" });

  const categories      = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const hasActiveFilter = filters.priceMin || filters.priceMax || filters.category || filters.availability;

  const pill = (active) => ({
    padding: "7px 18px",
    borderRadius: "999px",
    border: `1.5px solid ${active ? RUST : "#ddd"}`,
    background: active ? RUST : "#fff",
    color: active ? "#fff" : "#555",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
  });

  return (
    <div style={{ background: LIGHT_BEIGE, minHeight: "100vh" }}>
      <Navbar solid />

      {/* ── Page Banner ────────────────────────────────────────────────────── */}
      <div
        style={{
          background: `linear-gradient(135deg, #e74c3c 0%, ${RUST} 100%)`,
          paddingTop: "100px",
          paddingBottom: "36px",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 40px" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", letterSpacing: "1.5px", marginBottom: "6px" }}>
            HOME &nbsp;/&nbsp; SALE
          </p>
          <h1 style={{ color: "#fff", fontSize: "34px", fontWeight: "700", margin: 0 }}>
            Special Offers
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px", marginTop: "6px" }}>
            {products.length} discounted pieces, limited time only
          </p>
        </div>
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${BEIGE}`, boxShadow: "0 2px 12px rgba(117,39,0,0.06)" }}>
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "16px 40px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: "700", color: BROWN, letterSpacing: "1px", marginRight: "4px" }}>
            FILTER:
          </span>

          <button style={pill(!filters.category)} onClick={() => set("category", "")}>All</button>
          {categories.map((cat) => (
            <button key={cat} style={pill(filters.category === cat)} onClick={() => set("category", cat)}>
              {cat}
            </button>
          ))}

          <div style={{ width: "1px", height: "24px", background: BEIGE, margin: "0 4px" }} />

          <button style={pill(filters.availability === "in-stock")}    onClick={() => set("availability", filters.availability === "in-stock" ? "" : "in-stock")}>In Stock</button>
          <button style={pill(filters.availability === "out-of-stock")} onClick={() => set("availability", filters.availability === "out-of-stock" ? "" : "out-of-stock")}>Out of Stock</button>

          <div style={{ width: "1px", height: "24px", background: BEIGE, margin: "0 4px" }} />

          {["priceMin", "priceMax"].map((key) => (
            <input
              key={key}
              type="number"
              placeholder={key === "priceMin" ? "Min ৳" : "Max ৳"}
              value={filters[key]}
              onChange={(e) => set(key, e.target.value)}
              style={{
                width: "90px",
                padding: "7px 12px",
                border: `1.5px solid ${filters[key] ? RUST : "#ddd"}`,
                borderRadius: "999px",
                fontSize: "13px",
                background: LIGHT_BEIGE,
                color: BROWN,
                outline: "none",
              }}
            />
          ))}

          {hasActiveFilter && (
            <button
              onClick={clear}
              style={{ marginLeft: "4px", background: "none", border: "none", color: RUST, fontSize: "13px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}
            >
              Clear
            </button>
          )}

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#888", fontWeight: "600" }}>
              {filteredProducts.length} products
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "7px 14px",
                border: `1.5px solid #ddd`,
                borderRadius: "999px",
                fontSize: "13px",
                background: LIGHT_BEIGE,
                color: BROWN,
                fontWeight: "600",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="default">Featured</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="name-asc">Name: A–Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Products (full width) ─────────────────────── */}
      {filteredProducts.length > 0 ? (
        <Products products={filteredProducts} showSaleOnly={true} />
      ) : (
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <div style={{ fontSize: "52px", marginBottom: "16px" }}>🛍️</div>
          <h3 style={{ color: BROWN, fontSize: "22px", fontWeight: "700", marginBottom: "8px" }}>
            No products found
          </h3>
          <p style={{ color: "#999", marginBottom: "24px" }}>
            Try adjusting your filters.
          </p>
          <button
            onClick={clear}
            style={{
              background: `linear-gradient(135deg, ${BROWN}, ${RUST})`,
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "12px 28px",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
