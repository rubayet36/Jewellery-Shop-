import "./App.css";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Shop from "./pages/Shop";
import Sale from "./pages/Sale";
import AdminDashboard from "./pages/Admin/AdminDashboard";

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/"      element={<LandingPage />} />
        <Route path="/shop"  element={<Shop />} />
        <Route path="/sale"  element={<Sale />} />
        <Route path="/admin" element={<AdminDashboard />} />
        {/* legacy redirect */}
        <Route path="/admin/add-product" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
