"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { CartItem, CartContextType } from "./cart/types";

import { addToCart as addToCartAction } from "./cart/actions/add-to-cart";
import { increaseQuantity as increaseQuantityAction } from "./cart/actions/increase-quantity";
import { decreaseQuantity as decreaseQuantityAction } from "./cart/actions/decrease-quantity";
import { removeFromCart as removeFromCartAction } from "./cart/actions/remove-from-cart";
import { clearCart as clearCartAction } from "./cart/actions/clear-cart";

import { getCartCount } from "./cart/selectors/cart-count";
import { getCartTotal } from "./cart/selectors/cart-total";

import { loadCart } from "./cart/storage/load-cart";
import { saveCart } from "./cart/storage/save-cart";

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
  // LOAD CART
  // =====================================

  useEffect(() => {
    setCartItems(loadCart());
  }, []);

  // =====================================
  // SAVE CART
  // =====================================

  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  // =====================================
  // ADD TO CART
  // =====================================

  function addToCart(product: any) {
    setCartItems((currentItems) =>
      addToCartAction({
        currentItems,
        product,
      }),
    );
  }

  // =====================================
  // INCREASE QUANTITY
  // =====================================

  function increaseQuantity(id: string) {
    setCartItems((currentItems) =>
      increaseQuantityAction({
        currentItems,
        id,
      }),
    );
  }

  // =====================================
  // DECREASE QUANTITY
  // =====================================

  function decreaseQuantity(id: string) {
    setCartItems((currentItems) =>
      decreaseQuantityAction({
        currentItems,
        id,
      }),
    );
  }

  // =====================================
  // REMOVE FROM CART
  // =====================================

  function removeFromCart(id: string) {
    setCartItems((currentItems) =>
      removeFromCartAction({
        currentItems,
        id,
      }),
    );
  }

  // =====================================
  // CLEAR CART
  // =====================================

  function clearCart() {
    setCartItems(clearCartAction());
  } // =====================================
  // CART COUNT
  // =====================================

  const cartCount = getCartCount(cartItems);

  // =====================================
  // CART TOTAL
  // =====================================

  const cartTotal = getCartTotal(cartItems);

  // =====================================
  // PROVIDER
  // =====================================

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
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
