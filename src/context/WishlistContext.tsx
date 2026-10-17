"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  ReactNode,
} from "react";
import {
  getEffectiveProductPrice,
  getRegularProductPrice,
  isProductOnSale,
} from "@/lib/products/pricing";

// =====================================
// WISHLIST ITEM TYPE
// =====================================

// ეს არის მონაცემები,
// რომლებიც Wishlist-ში გვჭირდება.
//
// მთელი product ობიექტის შენახვა
// საჭირო არ არის.

export type WishlistItem = {
  id: string;
  title: string;
  price: number;
  salePrice: number | null;
  image: string;
  stock: number;
};

// =====================================
// WISHLIST CONTEXT TYPE
// =====================================

type WishlistContextType = {
  wishlistItems: WishlistItem[];

  addToWishlist: (product: any) => void;

  removeFromWishlist: (id: string) => void;

  toggleWishlist: (product: any) => void;

  isInWishlist: (id: string) => boolean;

  wishlistCount: number;
};

// =====================================
// CREATE CONTEXT
// =====================================

const WishlistContext =
  createContext<WishlistContextType | undefined>(
    undefined
  );

const WISHLIST_STORAGE_KEY = "wishlist";
const WISHLIST_CHANGE_EVENT = "blades-wishlist-change";
const EMPTY_WISHLIST: WishlistItem[] = [];

// undefined ნიშნავს, რომ წყარო localStorage-ია.
// სტრიქონი ინახება მხოლოდ მაშინ, როცა ჩაწერა ვერ მოხერხდა.
let memoryRaw: string | undefined;

function subscribeToWishlist(onStoreChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== WISHLIST_STORAGE_KEY) {
      return;
    }

    onStoreChange();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(WISHLIST_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(WISHLIST_CHANGE_EVENT, onStoreChange);
  };
}

function getWishlistSnapshot(): string | null {
  if (memoryRaw !== undefined) {
    return memoryRaw;
  }

  try {
    return localStorage.getItem(WISHLIST_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getWishlistServerSnapshot(): string | null {
  return null;
}

function parseWishlist(raw: string | null): WishlistItem[] {
  if (!raw) {
    return EMPTY_WISHLIST;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return EMPTY_WISHLIST;
    }

    return parsed as WishlistItem[];
  } catch {
    return EMPTY_WISHLIST;
  }
}

function readWishlistItems(): WishlistItem[] {
  return parseWishlist(getWishlistSnapshot());
}

function commitWishlist(items: WishlistItem[]) {
  const raw = JSON.stringify(items);

  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, raw);
    memoryRaw = undefined;
  } catch {
    memoryRaw = raw;
  }

  window.dispatchEvent(new Event(WISHLIST_CHANGE_EVENT));
}

function createWishlistItem(product: any): WishlistItem {
  const defaultImage =
    product.product_images?.find(
      (img: any) => img.is_main
    ) ||
    product.product_images?.[0];

  return {
    id: product.id,

    title: product.title,

    price: getRegularProductPrice(product),

    salePrice: isProductOnSale(product)
      ? getEffectiveProductPrice(product)
      : null,

    image:
      defaultImage?.image_url ||
      "/placeholder.png",

    stock: Number(product.stock ?? 0),
  };
}

// =====================================
// WISHLIST PROVIDER
// =====================================

export function WishlistProvider({
  children,
}: {
  children: ReactNode;
}) {
  const wishlistRaw = useSyncExternalStore(
    subscribeToWishlist,
    getWishlistSnapshot,
    getWishlistServerSnapshot,
  );

  const wishlistItems = useMemo(
    () => parseWishlist(wishlistRaw),
    [wishlistRaw],
  );

  // =====================================
  // ADD TO WISHLIST
  // =====================================

  function addToWishlist(product: any) {
    const currentItems = readWishlistItems();

    // ვამოწმებთ უკვე არის თუ არა
    // პროდუქტი Wishlist-ში.

    const existingItem =
      currentItems.find(
        (item) => item.id === product.id
      );

    // თუ უკვე არსებობს,
    // მეორედ აღარ ვამატებთ.

    if (existingItem) {
      return;
    }

    commitWishlist([
      ...currentItems,
      createWishlistItem(product),
    ]);
  }

  // =====================================
  // REMOVE FROM WISHLIST
  // =====================================

  function removeFromWishlist(id: string) {
    const currentItems = readWishlistItems();

    if (
      !currentItems.some(
        (item) => item.id === id
      )
    ) {
      return;
    }

    commitWishlist(
      currentItems.filter(
        (item) => item.id !== id
      )
    );
  }

  // =====================================
  // IS IN WISHLIST
  // =====================================

  function isInWishlist(id: string) {
    return wishlistItems.some(
      (item) => item.id === id
    );
  }

  // =====================================
  // TOGGLE WISHLIST
  // =====================================

  // თუ პროდუქტი უკვე Wishlist-შია,
  // წავშლით.
  //
  // თუ არ არის,
  // დავამატებთ.

  function toggleWishlist(product: any) {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);

      return;
    }

    addToWishlist(product);
  }

  // =====================================
  // WISHLIST COUNT
  // =====================================

  const wishlistCount =
    wishlistItems.length;

  // =====================================
  // PROVIDER
  // =====================================

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// =====================================
// USE WISHLIST HOOK
// =====================================

export function useWishlist() {
  const context =
    useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used inside WishlistProvider"
    );
  }

  return context;
}
