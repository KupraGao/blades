// =====================================
// CART ITEM
// =====================================

export type CartItem = {
  id: string;
  title: string;
  /** Effective unit price snapshotted at add time. Not authoritative for checkout. */
  price: number;
  regularPrice?: number | null;
  salePrice?: number | null;
  image: string;
  quantity: number;
  stock: number;
  /** Included in the next checkout when true. Defaults true for new/legacy items. */
  selected: boolean;
};

export type AddToCartResult =
  | { success: true }
  | { success: false; reason: "out_of_stock" | "stock_limit" };

// =====================================
// CART CONTEXT
// =====================================

export type CartContextType = {
  cartItems: CartItem[];

  addToCart: (product: any) => AddToCartResult;

  increaseQuantity: (id: string) => void;

  decreaseQuantity: (id: string) => void;

  removeFromCart: (id: string) => void;

  clearCart: () => void;

  toggleItemSelected: (id: string) => void;

  setAllSelected: (selected: boolean) => void;

  removeItemsByIds: (ids: string[]) => void;

  /** Quantity of ALL lines in cart (header badge). */
  cartCount: number;

  /** Total of ALL lines (legacy semantics preserved). */
  cartTotal: number;

  selectedItems: CartItem[];

  selectedCartCount: number;

  selectedCartTotal: number;

  allItemsSelected: boolean;
};
