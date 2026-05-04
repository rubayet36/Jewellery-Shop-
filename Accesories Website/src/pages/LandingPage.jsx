import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CategoryBox from "../components/Categorybox";
import Footer from "../components/Footers";
import Features from "../components/Features";
import Product from "../components/Products"


function LandingPage() {
  const categories = [
    { image: "/ring.jpg", name: "Rings" },
    { image: "/neckless.jpg", name: "Necklaces" },
    { image: "/bracelts.jpg", name: "Bracelets" },
    { image: "/earerings.jpg", name: "Earrings" },
  ];


  return (
    <div>
      <Navbar />
      <Hero />
      <Features categories={categories} />
    <Product />
      <Footer />
    </div>
  );
}
export default LandingPage;
