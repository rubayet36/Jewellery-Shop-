import { FiShoppingCart } from "react-icons/fi"; // Feather icons
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleClick = (page) => {
    navigate(page);
  };

  return (
    <div className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-10 py-6 bg-transparent text-white">
      <div className="cursor-pointer">
        <img src="./logo.png" alt="Logo" className="h-12 w-auto" />
      </div>
      <div className="flex items-center gap-8 text-lg">
        <button
          onClick={() => handleClick("home")}
          className="hover:text-gray-300 transition-colors"
        >
          Home
        </button>
        <button
          onClick={() => handleClick("shop")}
          className="hover:text-gray-300 transition-colors"
        >
          Shop
        </button>
        <button
          onClick={() => handleClick("On Sale")}
          className="hover:text-gray-300 transition-colors"
        >
          On Sale
        </button>
      </div>

      <button className="flex items-center gap-2 p-3 rounded-full hover:bg-white/20 transition-colors">
        <FiShoppingCart size={24} />
      </button>
    </div>
  );
}

export default Navbar;
