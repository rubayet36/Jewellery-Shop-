import "./App.css";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AddProduct from "./pages/Admin/AddProduct";

function App() {
  return (
    <div className="bg-brand-beige min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/add-product" element={<AddProduct />} />
      </Routes>
    </div>
  );
}

export default App;
