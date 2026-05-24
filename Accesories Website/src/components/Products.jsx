import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { FiHeart } from "react-icons/fi";
import ProductModal from "./ProductModal";

const BROWN = "#831843";
const RUST = "#db2777";
const BEIGE = "#ffe4ef";

function Products({
  products: propProducts,
  showSaleOnly = false,
  categoryFilter = "",
}) {
  const [products, setProducts] = useState(propProducts || []);
  const [loading, setLoading] = useState(!propProducts);
  const [selected, setSelected] = useState(null);
  const [wishlist, setWishlist] = useState(() =>
    JSON.parse(localStorage.getItem("jewel_wishlist") || "[]"),
  );
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data } = await supabase.from("categories").select("id, name");
        if (data) setCategoriesList(data);
      } catch (err) {
        console.error("Error loading categories fallback:", err);
      }
    }
    loadCategories();
  }, []);


  useEffect(() => {
    if (propProducts) {
      setProducts(propProducts);
      setLoading(false);
      return;
    }
    fetchProducts();
    const sub = supabase
      .channel("products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        fetchProducts,
      )
      .subscribe();
    return () => sub.unsubscribe();
  }, [propProducts]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name)");
    if (!error)
      setProducts(
        showSaleOnly ? (data || []).filter((p) => p.is_sale) : data || [],
      );
    setLoading(false);
  };

  const toggleWishlist = (e, id) => {
    e.stopPropagation();
    const updated = wishlist.includes(id)
      ? wishlist.filter((w) => w !== id)
      : [...wishlist, id];
    setWishlist(updated);
    localStorage.setItem("jewel_wishlist", JSON.stringify(updated));
  };

  if (loading)
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: RUST }}
        />
      </div>
    );

  const list = (() => {
    let base = showSaleOnly ? products.filter((p) => p.is_sale) : products;
    if (categoryFilter) {
      base = base.filter((p) => {
        let catName = "";
        if (p.categories) {
          if (Array.isArray(p.categories)) {
            catName = p.categories[0]?.name || "";
          } else if (typeof p.categories === "object") {
            catName = p.categories.name || "";
          }
        }

        if (!catName && p.category_id && categoriesList.length > 0) {
          const found = categoriesList.find((c) => c.id === p.category_id);
          if (found) {
            catName = found.name;
          }
        }

        if (!catName && p.category) {
          catName = p.category;
        }

        return catName?.toLowerCase().trim() === categoryFilter.toLowerCase().trim();
      });
    }
    return base;
  })();

  return (
    <>
      <div
        style={{
          width: "100%",
          background: "#fff5f8",
          padding: "48px 0",
          borderRadius: "0 0 32px 32px",
        }}
      >
        <div
          style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 40px" }}
        >
          <h2
            style={{
              textAlign: "center",
              color: BROWN,
              fontSize: "32px",
              fontWeight: "800",
              marginBottom: "36px",
            }}
          >
            {categoryFilter
              ? `🌸 ${categoryFilter} 🌸`
              : showSaleOnly
                ? "Sparkly Sale Picks ✨💖"
                : "Cotton Candy Picks 🍬✨"}
          </h2>

          {list.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888", fontSize: "16px" }}>
              Oh no! No cute pieces here right now! 🎀
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "24px",
              }}
            >
              {list.map((product) => {
                const isWished = wishlist.includes(product.id);
                const displayPrice =
                  product.is_sale && product.sale_price
                    ? Number(product.sale_price)
                    : Number(product.price);
                return (
                  <div
                    key={product.id}
                    onClick={() => setSelected(product)}
                    className="bouncy-hover"
                    style={{
                      background: "#fff",
                      borderRadius: "24px",
                      boxShadow: "0 12px 28px rgba(255,93,143,0.06)",
                      overflow: "hidden",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      border: `3px solid ${BEIGE}`,
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
                      e.currentTarget.style.boxShadow =
                        "0 20px 36px rgba(255,93,143,0.18)";
                      e.currentTarget.style.borderColor = "#ff85a1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 28px rgba(255,93,143,0.06)";
                      e.currentTarget.style.borderColor = BEIGE;
                    }}
                  >
                    {product.is_sale && (
                      <div
                        style={{
                          position: "absolute",
                          top: "12px",
                          left: "12px",
                          background: RUST,
                          color: "#fff",
                          padding: "4px 12px",
                          borderRadius: "999px",
                          fontSize: "10px",
                          fontWeight: "800",
                          letterSpacing: "1px",
                          zIndex: 2,
                        }}
                      >
                        SALE ✨
                      </div>
                    )}

                    {/* Out of Stock overlay */}
                    {product.stock === 0 && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(92,61,76,0.35)",
                          zIndex: 3,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "20px",
                        }}
                      >
                        <span
                          style={{
                            background: "rgba(92,61,76,0.9)",
                            color: "#fff",
                            padding: "8px 18px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: "800",
                            letterSpacing: "1px",
                          }}
                        >
                          SOLD OUT 🧸
                        </span>
                      </div>
                    )}

                    {/* Wishlist btn */}
                    <button
                      onClick={(e) => toggleWishlist(e, product.id)}
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        zIndex: 2,
                        background: "rgba(255,250,253,0.94)",
                        border: "none",
                        borderRadius: "999px",
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 8px 18px rgba(255,93,143,0.12)",
                      }}
                    >
                      <FiHeart
                        size={15}
                        fill={isWished ? "#e74c3c" : "none"}
                        stroke={isWished ? "#e74c3c" : RUST}
                        style={{ transition: "transform 0.2s" }}
                      />
                    </button>

                    {/* Image */}
                    <div
                      style={{
                        height: "200px",
                        background: "#ffeef2",
                        overflow: "hidden",
                      }}
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.transform = "scale(1.08)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = "scale(1)")
                          }
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "44px",
                          }}
                        >
                          💍
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div
                      style={{
                        padding: "18px",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 4px",
                          fontSize: "10px",
                          fontWeight: "800",
                          color: RUST,
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                        }}
                      >
                        {product.categories?.name || product.category}
                      </p>
                      <h3
                        style={{
                          margin: "0 0 6px",
                          fontSize: "15px",
                          fontWeight: "700",
                          color: BROWN,
                          lineHeight: 1.3,
                        }}
                      >
                        {product.name}
                      </h3>
                      <p
                        style={{
                          margin: "0 0 12px",
                          fontSize: "12px",
                          color: "#6c5a62",
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          flex: 1,
                        }}
                      >
                        {product.description}
                      </p>

                      {/* Price + button */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingTop: "12px",
                          borderTop: `1.5px solid ${BEIGE}`,
                        }}
                      >
                        <div>
                          <span
                            style={{
                              fontSize: "18px",
                              fontWeight: "800",
                              color: BROWN,
                            }}
                          >
                            ৳{displayPrice}
                          </span>
                          {product.is_sale && product.sale_price && (
                            <span
                              style={{
                                fontSize: "12px",
                                color: "#ccc",
                                textDecoration: "line-through",
                                marginLeft: "6px",
                              }}
                            >
                              ৳{product.price}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (product.stock !== 0) setSelected(product);
                          }}
                          disabled={product.stock === 0}
                          className="cute-bubble-btn"
                          style={{
                            background:
                              product.stock === 0
                                ? "#ccc"
                                : RUST,
                            color: "#fff",
                            border: "none",
                            borderRadius: "999px",
                            padding: "8px 16px",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor:
                              product.stock === 0 ? "not-allowed" : "pointer",
                            boxShadow: product.stock === 0 ? "none" : "0 6px 14px rgba(255,93,143,0.18)",
                          }}
                        >
                          {product.stock === 0 ? "Sold Out" : "View Details ✨"}
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
      {selected && (
        <ProductModal product={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

export default Products;
