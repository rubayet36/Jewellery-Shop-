import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();

    // Set up real-time subscription
    const subscription = supabase
      .channel("products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          fetchProducts(); // Refetch when any change occurs
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name)");

    if (error) console.error("Error fetching products:", error);
    else setProducts(data);
    setLoading(false);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );

  return (
    <div className="w-full bg-brand-beige py-12 rounded-b-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-brand-brown text-center mb-10">
          Our Products
        </h2>
      {products.length === 0 ? (
        <p className="text-center text-gray-500">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-brand-rust mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-brand-brown font-medium mb-2">
                  {product.categories?.name}
                </p>
                <p className="text-gray-600 font-serif text-sm mb-4 line-clamp-3 flex-grow">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-200">
                  <span className="text-xl font-bold text-gray-900">
                    ${product.price}
                  </span>
                  <button className="bg-[#752700] text-white px-4 py-2 rounded-md hover:bg-[#f3e0d0] hover:text-[#752700] transition-colors duration-200 shadow-sm">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}

export default Products;
