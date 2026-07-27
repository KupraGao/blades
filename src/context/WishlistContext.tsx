"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

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

// =====================================
// WISHLIST PROVIDER
// =====================================

export function WishlistProvider({
  children,
}: {
  children: ReactNode;
}) {
  // =====================================
  // WISHLIST STATE
  // =====================================

  const [wishlistItems, setWishlistItems] =
    useState<WishlistItem[]>([]);

  // =====================================
  // STORAGE READY
  // =====================================

  // ეს გვჭირდება იმისთვის,
  // რომ პირველივე render-ზე ცარიელი Wishlist
  // localStorage-ში არ შევინახოთ.

  const [storageReady, setStorageReady] =
    useState(false);

  // =====================================
  // LOAD WISHLIST FROM LOCAL STORAGE
  // =====================================

  useEffect(() => {
    const savedWishlist =
      localStorage.getItem("wishlist");

    if (savedWishlist) {
      try {
        const parsedWishlist =
          JSON.parse(savedWishlist);

        setWishlistItems(parsedWishlist);
      } catch (error) {
        console.log(
          "Wishlist load error:",
          error
        );
      }
    }

    setStorageReady(true);
  }, []);

  // =====================================
  // SAVE WISHLIST TO LOCAL STORAGE
  // =====================================

  useEffect(() => {
    if (!storageReady) return;

    localStorage.setItem(
      "wishlist",
      JSON.stringify(wishlistItems)
    );
  }, [wishlistItems, storageReady]);

  // =====================================
  // ADD TO WISHLIST
  // =====================================

  function addToWishlist(product: any) {
    setWishlistItems((currentItems) => {
      // ვამოწმებთ უკვე არის თუ არა
      // პროდუქტი Wishlist-ში.

      const existingItem =
        currentItems.find(
          (item) => item.id === product.id
        );

      // თუ უკვე არსებობს,
      // მეორედ აღარ ვამატებთ.

      if (existingItem) {
        return currentItems;
      }

      // =====================================
      // PRODUCT IMAGE
      // =====================================

      const defaultImage =
        product.product_images?.find(
          (img: any) => img.is_main
        ) ||
        product.product_images?.[0];

      // =====================================
      // NEW WISHLIST ITEM
      // =====================================

      const newItem: WishlistItem = {
        id: product.id,

        title: product.title,

        price: Number(product.price),

        image:
          defaultImage?.image_url ||
          "/placeholder.png",

        stock: Number(product.stock ?? 0),
      };

      return [
        ...currentItems,
        newItem,
      ];
    });
  }

  // =====================================
  // REMOVE FROM WISHLIST
  // =====================================

  function removeFromWishlist(id: string) {
    setWishlistItems((currentItems) =>
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