"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { CartItem, CartContextType, type AddToCartResult } from "./cart/types";

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
  normalizeCartItem,
} from "./cart/normalize-cart-item";
import {
  getCartCount,
  getSelectedCartCount,
} from "./cart/selectors/cart-count";
import {
  getCartTotal,
  getSelectedCartTotal,
} from "./cart/selectors/cart-total";

import { saveCart } from "./cart/storage/save-cart";

// =====================================
// CREATE CONTEXT
// =====================================

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "cart";
const CART_CHANGE_EVENT = "blades-cart-change";
const EMPTY_CART: CartItem[] = [];

// წარუმატებელი ჩაწერისას კალათას დროებით ვინახავთ მეხსიერებაში.
let memoryRaw: string | undefined;
// მნიშვნელობა, რომელიც localStorage-ში იყო fallback-ის შექმნისას.
let memoryBaseRaw: string | null | undefined;

function subscribeToCart(onStoreChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== CART_STORAGE_KEY) {
      return;
    }

    onStoreChange();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(CART_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CART_CHANGE_EVENT, onStoreChange);
  };
}

function getCartSnapshot(): string | null {
  let storedRaw: string | null;

  try {
    storedRaw = localStorage.getItem(CART_STORAGE_KEY);
  } catch {
    return memoryRaw ?? null;
  }

  if (memoryRaw !== undefined) {
    if (storedRaw === memoryBaseRaw) {
      return memoryRaw;
    }

    // სხვა ჩანართში შენახული ახალი მონაცემი მოძველებულ fallback-ს ანაცვლებს.
    memoryRaw = undefined;
    memoryBaseRaw = undefined;
  }

  return storedRaw;
}

function getCartServerSnapshot(): string | null {
  return null;
}

function parseCart(raw: string | null): CartItem[] {
  if (!raw) {
    return EMPTY_CART;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return EMPTY_CART;
    }

    const items = parsed
      .map((item) => normalizeCartItem(item))
      .filter((item): item is CartItem => item !== null);

    return items.length === 0 ? EMPTY_CART : items;
  } catch {
    return EMPTY_CART;
  }
}

function readCartItems(): CartItem[] {
  return parseCart(getCartSnapshot());
}

function commitCart(items: CartItem[]) {
  const raw = JSON.stringify(items);

  // საწყის მდგომარეობას ვინახავთ, რათა სხვა ჩანართის ცვლილება ამოვიცნოთ.
  let baseRaw: string | null | undefined;

  try {
    baseRaw = localStorage.getItem(CART_STORAGE_KEY);
  } catch {
    baseRaw = undefined;
  }

  saveCart(items);

  let persisted = false;

  try {
    persisted = localStorage.getItem(CART_STORAGE_KEY) === raw;
  } catch {
    persisted = false;
  }

  if (persisted) {
    memoryRaw = undefined;
    memoryBaseRaw = undefined;
  } else {
    memoryRaw = raw;
    memoryBaseRaw = baseRaw;
  }

  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
}

function commitCartIfChanged(currentItems: CartItem[], nextItems: CartItem[]) {
  if (nextItems === currentItems) {
    return;
  }

  if (JSON.stringify(nextItems) === JSON.stringify(currentItems)) {
    return;
  }

  commitCart(nextItems);
}

// =====================================
// CART PROVIDER
// =====================================

export function CartProvider({ children }: { children: ReactNode }) {
  const cartRaw = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getCartServerSnapshot,
  );

  const cartItems = useMemo(() => parseCart(cartRaw), [cartRaw]);

  function addToCart(product: any): AddToCartResult {
    const currentItems = readCartItems();
    const next = addToCartAction({
      currentItems,
      product,
    });

    commitCartIfChanged(currentItems, next.items);

    return next.result;
  }

  function increaseQuantity(id: string) {
    const currentItems = readCartItems();

    commitCartIfChanged(
      currentItems,
      increaseQuantityAction({
        currentItems,
        id,
      }),
    );
  }

  function decreaseQuantity(id: string) {
    const currentItems = readCartItems();

    commitCartIfChanged(
      currentItems,
      decreaseQuantityAction({
        currentItems,
        id,
      }),
    );
  }

  function removeFromCart(id: string) {
    const currentItems = readCartItems();

    commitCartIfChanged(
      currentItems,
      removeFromCartAction({
        currentItems,
        id,
      }),
    );
  }

  function clearCart() {
    commitCartIfChanged(readCartItems(), clearCartAction());
  }

  function toggleItemSelected(id: string) {
    const currentItems = readCartItems();

    commitCartIfChanged(
      currentItems,
      toggleItemSelectedAction({
        currentItems,
        id,
      }),
    );
  }

  function setAllSelected(selected: boolean) {
    const currentItems = readCartItems();

    commitCartIfChanged(
      currentItems,
      setAllSelectedAction({
        currentItems,
        selected,
      }),
    );
  }

  function removeItemsByIds(ids: string[]) {
    const currentItems = readCartItems();

    commitCartIfChanged(
      currentItems,
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
