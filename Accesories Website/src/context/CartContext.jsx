import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("jewel_cart")) || []; }
    catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("jewel_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, color = "", qty = 1) => {
    const key = `${product.id}__${color}`;
    setCartItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) return prev.map((i) => i.key === key ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...product, key, color, qty }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (key) => setCartItems((prev) => prev.filter((i) => i.key !== key));

  const updateQty = (key, delta) => {
    setCartItems((prev) =>
      prev.map((i) => i.key === key ? { ...i, qty: i.qty + delta } : i).filter((i) => i.qty > 0)
    );
  };

  const clearCart = () => setCartItems([]);

  const totalItems = cartItems.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cartItems.reduce((s, i) => {
    const price = i.is_sale && i.sale_price ? Number(i.sale_price) : Number(i.price);
    return s + price * i.qty;
  }, 0);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQty, clearCart,
      isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
      totalItems, totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
