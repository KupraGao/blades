"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// =====================================
// CART ITEM TYPE
// =====================================
type CartItem = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
};

// =====================================
// CART CONTEXT TYPE
// =====================================
type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: any) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  removeFromCart: (id: string) => void;
  cartCount: number;
  cartTotal: number;
};

// =====================================
// CREATE CONTEXT
// =====================================
const CartContext = createContext<CartContextType | undefined>(undefined);

// =====================================
// CART PROVIDER
// =====================================
export function CartProvider({ children }: { children: ReactNode }) {
  // =====================================
  // CART STATE
  // =====================================
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // =====================================
  // LOAD CART FROM LOCAL STORAGE
  // =====================================
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.log("Cart load error:", error);
      }
    }
  }, []);

  // =====================================
  // SAVE CART TO LOCAL STORAGE
  // =====================================
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // =====================================
  // ADD TO CART
  // =====================================
  function addToCart(product: any) {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);
      const productStock = Number(product.stock) || 0;

      // პროდუქტი მარაგში აღარ არის.
      if (productStock <= 0) return currentItems;

      // თუ პროდუქტი უკვე კალათაშია.
      if (existingItem) {
        // Stock-ზე მეტს აღარ ვამატებთ.
        if (existingItem.quantity >= productStock) return currentItems;

        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, stock: productStock }
            : item
        );
      }

      // მთავარი სურათი.
      const defaultImage = product.product_images?.find((img: any) => img.is_main) || product.product_images?.[0];

      // ახალი პროდუქტი.
      const newItem: CartItem = {
        id: product.id,
        title: product.title,
        price: Number(product.price),
        image: defaultImage?.image_url || "/placeholder.png",
        quantity: 1,
        stock: productStock,
      };

      return [...currentItems, newItem];
    });
  }

  // =====================================
  // INCREASE QUANTITY
  // =====================================
  function increaseQuantity(id: string) {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== id) return item;

        // Stock-ზე მეტს აღარ ვზრდით.
        if (item.quantity >= item.stock) return item;

        return { ...item, quantity: item.quantity + 1 };
      })
    );
  }

  // =====================================
  // DECREASE QUANTITY
  // =====================================
  function decreaseQuantity(id: string) {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== id) return item;

        // 1-ზე ქვემოთ რაოდენობას არ ვუშვებთ.
        if (item.quantity <= 1) return item;

        return { ...item, quantity: item.quantity - 1 };
      })
    );
  }

  // =====================================
  // REMOVE FROM CART
  // =====================================
  function removeFromCart(id: string) {
    setCartItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }

  // =====================================
  // CART COUNT
  // =====================================
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // =====================================
  // CART TOTAL
  // =====================================
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // =====================================
  // PROVIDER
  // =====================================
  return (
    <CartContext.Provider value={{ cartItems, addToCart, increaseQuantity, decreaseQuantity, removeFromCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

// =====================================
// USE CART HOOK
// =====================================
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}