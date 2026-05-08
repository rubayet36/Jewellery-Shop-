import { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CategoryBox from "../components/Categorybox";
import Footer from "../components/Footers";
import Features from "../components/Features";
import Product from "../components/Products"

function LandingPage() {
  const [activeCategory, setActiveCategory] = useState("");

  // filterKey must EXACTLY match the category name stored in your Supabase DB
  const categories = [
    { image: "/ring.jpg",      name: "Rings",     filterKey: "Ring" },
    { image: "/neckless.jpg",  name: "Necklaces", filterKey: "Neckless" },
    { image: "/bracelts.jpg",  name: "Bracelets", filterKey: "Brcelets" },
    { image: "/earerings.jpg", name: "Earrings",  filterKey: "Earings" },
  ];

  const handleCategorySelect = (filterKey) => {
    setActiveCategory((prev) => (prev === filterKey ? "" : filterKey));
    setTimeout(() => {
      document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="bg-brand-brown">
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
