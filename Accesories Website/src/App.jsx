import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

// Lazy-load page routes to split chunks
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Shop = lazy(() => import("./pages/Shop"));
const Sale = lazy(() => import("./pages/Sale"));
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));

// Cute marshmallow pink loader fallback
const PageLoader = () => (
  <div
    style={{
      display: "flex",
      minHeight: "100vh",
      alignItems: "center",
      justifyContent: "center",
      background: "#fff9fb",
      fontFamily: "system-ui, sans-serif",
      color: "#831843",
      fontWeight: "800",
      fontSize: "18px",
    }}
  >
    <div style={{ textAlign: "center" }}>
      <div
        className="animate-spin rounded-full h-12 w-12 border-b-2"
        style={{ borderColor: "#db2777", margin: "0 auto 16px" }}
      />
      Loading collection... 🌸
    </div>
  </div>
);

function App() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"      element={<LandingPage />} />
          <Route path="/shop"  element={<Shop />} />
          <Route path="/sale"  element={<Sale />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* legacy redirect */}
          <Route path="/admin/add-product" element={<AdminDashboard />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
