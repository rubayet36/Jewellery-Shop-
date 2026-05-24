import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footers";
import Features from "../components/Features";
import Product from "../components/Products";
import { supabase } from "../utils/supabase";

function LandingPage() {
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
        <Product categoryFilter={activeCategory} />
      </div>
      <Footer />
    </div>
  );
}
export default LandingPage;
