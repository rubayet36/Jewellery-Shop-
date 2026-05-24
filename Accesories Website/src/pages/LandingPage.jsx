import { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footers";
import Features from "../components/Features";
import Product from "../components/Products"

function LandingPage() {
  const [activeCategory, setActiveCategory] = useState("");

  // filterKey must EXACTLY match the category name stored in your Supabase DB
  const categories = [
    { image: "/ring.jpg",      name: "Rings",     filterKey: "Rings" },
    { image: "/neckless.jpg",  name: "Necklaces", filterKey: "Necklaces" },
    { image: "/bracelts.jpg",  name: "Bracelets", filterKey: "Bracelets" },
    { image: "/earerings.jpg", name: "Earrings",  filterKey: "Earrings" },
  ];

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
