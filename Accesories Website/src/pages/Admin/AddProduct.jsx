import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";

function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    price: "",
    description: "",
    image_url: "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) console.error("Error fetching categories:", error);
    else setCategories(data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.from("products").insert([formData]);

    if (error) {
      setMessage("Error adding product: " + error.message);
    } else {
      setMessage("Product added successfully!");
      setFormData({
        name: "",
        category_id: "",
        price: "",
        description: "",
        image_url: "",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Add New Product
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Fill in the details to add a product to your inventory
          </p>
        </div>
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Product Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter product name"
              />
            </div>
            <div>
              <label
                htmlFor="category_id"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="category_id"
                name="category_id"
                required
                value={formData.category_id}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                Price
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Describe the product"
              />
            </div>
            <div>
              <label
                htmlFor="image_url"
                className="block text-sm font-medium text-gray-700"
              >
                Image URL
              </label>
              <input
                id="image_url"
                name="image_url"
                type="url"
                value={formData.image_url}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Adding Product..." : "Add Product"}
              </button>
            </div>
          </form>
          {message && (
            <div
              className={`mt-4 p-4 rounded-md ${message.includes("Error") ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}
            >
              <p className="text-sm">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddProduct;
