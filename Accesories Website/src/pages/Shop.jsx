import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import Navbar from "../components/Navbar";
import Products from "../components/Products";

const BROWN = "#9d174d";
const BEIGE = "#ffe4ef";
const RUST = "#ec4899";
const LIGHT_BEIGE = "#fffafd";

export default function Shop() {
  const [products, setProducts]                 = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy]                     = useState("default");
  const [searchQuery, setSearchQuery]           = useState("");
  const [wishlistOnly, setWishlistOnly]         = useState(false);
  const [filters, setFilters]                   = useState({
    priceMin: "",
    priceMax: "",
    category: "",
    availability: "",
  });

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => { applyFilters(); }, [products, filters, sortBy, searchQuery, wishlistOnly]);

  const fetchProducts = async () => {
    // Select categories(name) to support joined category filtering & dynamic pills
    const { data, error } = await supabase.from("products").select("*, categories(name)");
    if (error) {
      console.error("Error fetching products:", error);
    } else {
      // Map category name to p.category
      const enriched = (data || []).map(p => ({
        ...p,
        category: p.categories?.name
      }));
      setProducts(enriched);
    }
  };

  const applyFilters = () => {
    let f = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      f = f.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // Wishlist filter
    if (wishlistOnly) {
      const wl = JSON.parse(localStorage.getItem("jewel_wishlist") || "[]");
      f = f.filter((p) => wl.includes(p.id));
    }

    if (filters.priceMin)        f = f.filter((p) => p.price >= parseFloat(filters.priceMin));
    if (filters.priceMax)        f = f.filter((p) => p.price <= parseFloat(filters.priceMax));
    if (filters.category)        f = f.filter((p) => p.category === filters.category);
    if (filters.availability === "in-stock")    f = f.filter((p) => p.stock > 0);
    if (filters.availability === "out-of-stock") f = f.filter((p) => p.stock === 0);
    
    if (sortBy === "price-asc")  f.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") f.sort((a, b) => b.price - a.price);
    if (sortBy === "name-asc")   f.sort((a, b) => a.name?.localeCompare(b.name));
    
    setFilteredProducts(f);
  };

  const set = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));
  const clear = () => {
    setFilters({ priceMin: "", priceMax: "", category: "", availability: "" });
    setSearchQuery("");
    setWishlistOnly(false);
  };

  const categories      = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const hasActiveFilter = filters.priceMin || filters.priceMax || filters.category || filters.availability || searchQuery || wishlistOnly;

  /* ── shared pill style ─────────────────────────────────────────────────── */
  const pill = (active) => ({
    padding: "7px 18px",
    borderRadius: "999px",
    border: `1.5px solid ${active ? RUST : "#ddd"}`,
    background: active ? RUST : "#fff",
    color: active ? "#fff" : BROWN,
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
          backgroundColor: RUST,
          paddingTop: "80px",
          paddingBottom: "40px",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 40px" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", letterSpacing: "1.5px", marginBottom: "6px" }}>
            HOME &nbsp;/&nbsp; SHOP
          </p>
          <h1 style={{ color: "#fff", fontSize: "34px", fontWeight: "700", margin: 0 }}>
            All Collections
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px", marginTop: "6px", marginBottom: "18px" }}>
            {products.length} curated pieces, handpicked for you
          </p>

          {/* Search bar integration */}
          <div style={{ maxWidth: "450px", position: "relative" }}>
            <input
              type="text"
              placeholder="Search accessories, rings, pearls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 18px",
                paddingLeft: "38px",
                borderRadius: "999px",
                border: "none",
                background: "rgba(255, 255, 255, 0.22)",
                color: "#fff",
                fontSize: "13px",
                outline: "none",
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 24px rgba(157, 23, 77, 0.1)",
                transition: "all 0.2s",
              }}
            />
            <span style={{ position: "absolute", left: "14px", top: "10px", color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "8px",
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "700",
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${BEIGE}`, boxShadow: "0 8px 24px rgba(236,72,153,0.08)" }}>
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
          {/* Label */}
          <span style={{ fontSize: "12px", fontWeight: "700", color: BROWN, letterSpacing: "1px", marginRight: "4px" }}>
            FILTER:
          </span>

          {/* Category pills */}
          <button style={pill(!filters.category)} onClick={() => set("category", "")}>All</button>
          {categories.map((cat) => (
            <button key={cat} style={pill(filters.category === cat)} onClick={() => set("category", cat)}>
              {cat}
            </button>
          ))}

          {/* Divider */}
          <div style={{ width: "1px", height: "24px", background: BEIGE, margin: "0 4px" }} />

          {/* Wishlist Pill */}
          <button
            style={{
              ...pill(wishlistOnly),
              borderColor: wishlistOnly ? "#e74c3c" : "#ddd",
              background: wishlistOnly ? "#e74c3c" : "#fff",
              color: wishlistOnly ? "#fff" : "#e74c3c",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onClick={() => setWishlistOnly(!wishlistOnly)}
          >
            <span>♥</span> {wishlistOnly ? "Wishlist Only" : "My Wishlist"}
          </button>

          {/* Availability pills */}
          <button style={pill(filters.availability === "in-stock")}    onClick={() => set("availability", filters.availability === "in-stock" ? "" : "in-stock")}>In Stock</button>
          <button style={pill(filters.availability === "out-of-stock")} onClick={() => set("availability", filters.availability === "out-of-stock" ? "" : "out-of-stock")}>Out of Stock</button>

          {/* Divider */}
          <div style={{ width: "1px", height: "24px", background: BEIGE, margin: "0 4px" }} />

          {/* Price range */}
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

          {/* Clear */}
          {hasActiveFilter && (
            <button
              onClick={clear}
              style={{ marginLeft: "4px", background: "none", border: "none", color: RUST, fontSize: "13px", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}
            >
              Clear
            </button>
          )}

          {/* Sort — push to right */}
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
        <Products products={filteredProducts} />
      ) : (
        <div style={{ textAlign: "center", padding: "100px 20px" }}>
          <div style={{ fontSize: "52px", marginBottom: "16px" }}>🛍️</div>
          <h3 style={{ color: BROWN, fontSize: "22px", fontWeight: "700", marginBottom: "8px" }}>
            No products found
          </h3>
          <p style={{ color: "#999", marginBottom: "24px" }}>
            Try adjusting your filters or search terms.
          </p>
          <button
            onClick={clear}
            style={{
              background: RUST,
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
