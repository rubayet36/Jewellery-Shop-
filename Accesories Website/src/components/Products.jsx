import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { FiHeart } from "react-icons/fi";
import ProductModal from "./ProductModal";

const BROWN = "#752700";
const RUST  = "#a44f31";
const BEIGE = "#f3e0d0";
const LIGHT = "#fdf6f0";

function Products({ products: propProducts, showSaleOnly = false, categoryFilter = "" }) {
  const [products, setProducts] = useState(propProducts || []);
  const [loading, setLoading]   = useState(!propProducts);
  const [selected, setSelected] = useState(null);
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem("jewel_wishlist") || "[]"));

  useEffect(() => {
    if (propProducts) { setProducts(propProducts); setLoading(false); return; }
    fetchProducts();
    const sub = supabase.channel("products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, fetchProducts)
      .subscribe();
    return () => sub.unsubscribe();
  }, [propProducts]);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*, categories(name)");
    if (!error) setProducts(showSaleOnly ? (data || []).filter((p) => p.is_sale) : data || []);
    setLoading(false);
  };

  const toggleWishlist = (e, id) => {
    e.stopPropagation();
    const updated = wishlist.includes(id) ? wishlist.filter((w) => w !== id) : [...wishlist, id];
    setWishlist(updated);
    localStorage.setItem("jewel_wishlist", JSON.stringify(updated));
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: RUST }} />
    </div>
  );

  const list = (() => {
    let base = showSaleOnly ? products.filter((p) => p.is_sale) : products;
    if (categoryFilter) {
      // match against categories.name (joined) OR category text field
      base = base.filter(
        (p) =>
          p.categories?.name?.toLowerCase() === categoryFilter.toLowerCase() ||
          p.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    return base;
  })();

  return (
    <>
      <div style={{ width: "100%", background: BEIGE, padding: "48px 0", borderRadius: "0 0 20px 20px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 40px" }}>
          <h2 style={{ textAlign: "center", color: BROWN, fontSize: "32px", fontWeight: "800", marginBottom: "36px" }}>
            {categoryFilter ? `${categoryFilter}` : showSaleOnly ? "🏷️ On Sale" : "Our Products"}
          </h2>

          {list.length === 0 ? (
            <p style={{ textAlign: "center", color: "#999" }}>No products available.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "24px" }}>
              {list.map((product) => {
                const isWished = wishlist.includes(product.id);
                const displayPrice = product.is_sale && product.sale_price ? Number(product.sale_price) : Number(product.price);
                return (
                  <div
                    key={product.id}
                    onClick={() => setSelected(product)}
                    style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(117,39,0,0.08)", overflow: "hidden", cursor: "pointer", transition: "transform 0.22s ease, box-shadow 0.22s ease", display: "flex", flexDirection: "column", border: `1px solid ${BEIGE}`, position: "relative" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(117,39,0,0.15)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(117,39,0,0.08)"; }}
                  >
                    {product.is_sale && (
                      <div style={{ position: "absolute", top: "12px", left: "12px", background: "#e74c3c", color: "#fff", padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "800", letterSpacing: "1px", zIndex: 2 }}>
                        SALE
                      </div>
                    )}

                    {/* Out of Stock overlay */}
                    {product.stock === 0 && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 3, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "16px" }}>
                        <span style={{ background: "rgba(0,0,0,0.75)", color: "#fff", padding: "8px 18px", borderRadius: "999px", fontSize: "13px", fontWeight: "800", letterSpacing: "1px" }}>
                          OUT OF STOCK
                        </span>
                      </div>
                    )}

                    {/* Wishlist btn */}
                    <button
                      onClick={(e) => toggleWishlist(e, product.id)}
                      style={{ position: "absolute", top: "10px", right: "10px", zIndex: 2, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "999px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                    >
                      <FiHeart size={15} fill={isWished ? "#e74c3c" : "none"} stroke={isWished ? "#e74c3c" : "#888"} />
                    </button>

                    {/* Image */}
                    <div style={{ height: "200px", background: LIGHT, overflow: "hidden" }}>
                      {product.image_url
                        ? <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.06)"}
                            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" }}>💍</div>
                      }
                    </div>

                    {/* Info */}
                    <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1 }}>
                      <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: RUST, letterSpacing: "1px", textTransform: "uppercase" }}>
                        {product.categories?.name || product.category}
                      </p>
                      <h3 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: "700", color: BROWN, lineHeight: 1.3 }}>
                        {product.name}
                      </h3>
                      <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#888", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>
                        {product.description}
                      </p>

                      {/* Price + button */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: `1px solid ${BEIGE}` }}>
                        <div>
                          <span style={{ fontSize: "18px", fontWeight: "800", color: BROWN }}>৳{displayPrice}</span>
                          {product.is_sale && product.sale_price && (
                            <span style={{ fontSize: "12px", color: "#bbb", textDecoration: "line-through", marginLeft: "6px" }}>৳{product.price}</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); if (product.stock !== 0) setSelected(product); }}
                          disabled={product.stock === 0}
                          style={{ background: product.stock === 0 ? "#ccc" : `linear-gradient(135deg, ${BROWN}, ${RUST})`, color: "#fff", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "12px", fontWeight: "700", cursor: product.stock === 0 ? "not-allowed" : "pointer" }}
                        >
                          {product.stock === 0 ? "Unavailable" : "View Details"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

export default Products;
