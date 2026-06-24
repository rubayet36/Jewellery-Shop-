import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footers";
import Features from "../components/Features";
import Product from "../components/Products";
import { supabase } from "../utils/supabase";

function LandingPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("");
  const defaultCategories = [
    { image: "/ring.jpg",      name: "Rings",     filterKey: "Rings" },
    { image: "/neckless.jpg",  name: "Necklaces", filterKey: "Necklaces" },
    { image: "/bracelts.jpg",  name: "Bracelets", filterKey: "Bracelets" },
    { image: "/earerings.jpg", name: "Earrings",  filterKey: "Earrings" },
  ];
  const [categories, setCategories] = useState(defaultCategories);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase.from("categories").select("*");
        if (!error && data && data.length > 0) {
          const mapped = data.map((cat) => ({
            image: cat.image_url || "/ring.jpg",
            name: cat.name,
            filterKey: cat.name,
          }));
          setCategories(mapped);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }
    fetchCategories();
  }, []);

  const handleCategorySelect = (filterKey) => {
    setActiveCategory((prev) => (prev === filterKey ? "" : filterKey));
    setTimeout(() => {
      document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="soft-pink-surface">
      <Navbar />
      <Hero />
      <Features categories={categories} activeCategory={activeCategory} onSelect={handleCategorySelect} />
      <div id="products-section">
        <Product categoryFilter={activeCategory} limit={8} />
        <div style={{ display: "flex", justifyContent: "center", padding: "32px 0 64px", background: "#fff5f8" }}>
          <button
            onClick={() => navigate("/shop")}
            className="cute-bubble-btn bouncy-hover"
            style={{
              background: "#db2777",
              color: "#fff",
              border: "none",
              borderRadius: "999px",
              padding: "14px 44px",
              fontSize: "14px",
              fontWeight: "800",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(255,93,143,0.22)",
              transition: "all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px) scale(1.03)";
              e.currentTarget.style.boxShadow = "0 14px 30px rgba(255,93,143,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(255,93,143,0.22)";
            }}
          >
            Explore Full Collection ✨
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
export default LandingPage;
