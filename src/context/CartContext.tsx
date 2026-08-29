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
import {
  removeItemsByIds as removeItemsByIdsAction,
  setAllSelected as setAllSelectedAction,
  toggleItemSelected as toggleItemSelectedAction,
} from "./cart/actions/selection";

import {
  areAllItemsSelected,
  getSelectedItems,
} from "./cart/normalize-cart-item";
import {
  getCartCount,
  getSelectedCartCount,
} from "./cart/selectors/cart-count";
import {
  getCartTotal,
  getSelectedCartTotal,
} from "./cart/selectors/cart-total";

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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setCartItems(loadCart());
  }, []);

  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  function addToCart(product: any) {
    setCartItems((currentItems) =>
      addToCartAction({
        currentItems,
        product,
      }),
    );
  }

  function increaseQuantity(id: string) {
    setCartItems((currentItems) =>
      increaseQuantityAction({
        currentItems,
        id,
      }),
    );
  }

  function decreaseQuantity(id: string) {
    setCartItems((currentItems) =>
      decreaseQuantityAction({
        currentItems,
        id,
      }),
    );
  }

  function removeFromCart(id: string) {
    setCartItems((currentItems) =>
      removeFromCartAction({
        currentItems,
        id,
      }),
    );
  }

  function clearCart() {
    setCartItems(clearCartAction());
  }

  function toggleItemSelected(id: string) {
    setCartItems((currentItems) =>
      toggleItemSelectedAction({
        currentItems,
        id,
      }),
    );
  }

  function setAllSelected(selected: boolean) {
    setCartItems((currentItems) =>
      setAllSelectedAction({
        currentItems,
        selected,
      }),
    );
  }

  function removeItemsByIds(ids: string[]) {
    setCartItems((currentItems) =>
      removeItemsByIdsAction({
        currentItems,
        ids,
      }),
    );
  }

  const cartCount = getCartCount(cartItems);
  const cartTotal = getCartTotal(cartItems);
  const selectedItems = getSelectedItems(cartItems);
  const selectedCartCount = getSelectedCartCount(cartItems);
  const selectedCartTotal = getSelectedCartTotal(cartItems);
  const allItemsSelected = areAllItemsSelected(cartItems);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        toggleItemSelected,
        setAllSelected,
        removeItemsByIds,
        cartCount,
        cartTotal,
        selectedItems,
        selectedCartCount,
        selectedCartTotal,
        allItemsSelected,
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
