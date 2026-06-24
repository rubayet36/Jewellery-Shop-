import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import Navbar from "../components/Navbar";
import Products from "../components/Products";

const BROWN = "#9d174d";
const BEIGE = "#ffe4ef";
const RUST = "#ec4899";
const LIGHT_BEIGE = "#fffafd";

export default function Sale() {
  const [products, setProducts]                 = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [page, setPage]                         = useState(0);
  const [hasMore, setHasMore]                   = useState(true);
  const [totalCount, setTotalCount]             = useState(0);
  const [categories, setCategories]             = useState([]);
  const [sortBy, setSortBy]                     = useState("default");
  const [searchVal, setSearchVal]               = useState("");
  const [searchQuery, setSearchQuery]           = useState("");
  const [filters, setFilters]                   = useState({
    priceMin: "",
    priceMax: "",
    category: "",
    availability: "",
  });

  // Fetch categories list once on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const { data } = await supabase.from("categories").select("name");
        if (data) setCategories(data.map((c) => c.name));
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Debounce search query input (300ms delay)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearchQuery(searchVal);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchVal]);

  // Trigger reset and reload on filter/sort/search change
  useEffect(() => {
    setPage(0);
    setProducts([]);
    setHasMore(true);
    fetchProducts(0, true);
  }, [filters, sortBy, searchQuery]);

  const fetchProducts = async (currentPage, isReset = false) => {
    setLoading(true);
    const ITEMS_PER_PAGE = 12;
    const from = currentPage * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    try {
      // Build dynamic query
      let query;
      if (filters.category) {
        query = supabase
          .from("products")
          .select("*, categories!inner(name)", { count: "exact" })
          .eq("categories.name", filters.category)
          .eq("is_sale", true);
      } else {
        query = supabase
          .from("products")
          .select("*, categories(name)", { count: "exact" })
          .eq("is_sale", true);
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = `%${searchQuery.trim()}%`;
        query = query.or(`name.ilike.${q},description.ilike.${q}`);
      }

      // Price range (checks sale_price if it exists, otherwise price)
      if (filters.priceMin) {
        query = query.gte("price", parseFloat(filters.priceMin));
      }
      if (filters.priceMax) {
        query = query.lte("price", parseFloat(filters.priceMax));
      }

      // Availability filter
      if (filters.availability === "in-stock") {
        query = query.gt("stock", 0);
      } else if (filters.availability === "out-of-stock") {
        query = query.eq("stock", 0);
      }

      // Sort
      if (sortBy === "price-asc") {
        // Order by sale_price if available, fallback to price
        query = query.order("price", { ascending: true });
      } else if (sortBy === "price-desc") {
        query = query.order("price", { ascending: false });
      } else if (sortBy === "name-asc") {
        query = query.order("name", { ascending: true });
      } else {
        query = query.order("id", { ascending: false });
      }

      // Range limits for pagination
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        const enriched = (data || []).map((p) => ({
          ...p,
          category: p.categories?.name,
        }));
        setProducts((prev) => {
          const next = isReset ? enriched : [...prev, ...enriched];
          setHasMore(next.length < (count || 0));
          return next;
        });
        setTotalCount(count || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, false);
    }
  };

  const set = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));
  const clear = () => {
    setFilters({ priceMin: "", priceMax: "", category: "", availability: "" });
    setSearchVal("");
    setSearchQuery("");
  };

  const hasActiveFilter =
    filters.priceMin ||
    filters.priceMax ||
    filters.category ||
    filters.availability ||
    searchQuery;

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
            HOME &nbsp;/&nbsp; SALE
          </p>
          <h1 style={{ color: "#fff", fontSize: "34px", fontWeight: "700", margin: 0 }}>
            Special Offers
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px", marginTop: "6px", marginBottom: "18px" }}>
            {totalCount} discounted pieces, limited time only
          </p>

          {/* Search bar integration */}
          <div style={{ maxWidth: "450px", position: "relative" }}>
            <input
              type="text"
              placeholder="Search discounted pieces..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
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
            {searchVal && (
              <button
                onClick={() => {
                  setSearchVal("");
                  setSearchQuery("");
                }}
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
              {totalCount} products
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
      {products.length > 0 || loading ? (
        <>
          <Products products={products} showSaleOnly={true} loading={loading && products.length === 0} />
          {hasMore && products.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px 0 60px", background: "#fff5f8" }}>
              <button
                onClick={loadMore}
                disabled={loading}
                style={{
                  background: RUST,
                  color: "#fff",
                  border: "none",
                  borderRadius: "999px",
                  padding: "12px 36px",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 8px 24px rgba(236,72,153,0.25)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(236,72,153,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(236,72,153,0.25)";
                }}
              >
                {loading ? "Loading more cute offers... 🌸" : "Load More ✨"}
              </button>
            </div>
          )}
        </>
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
