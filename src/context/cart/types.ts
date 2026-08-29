// =====================================
// CART ITEM
// =====================================

export type CartItem = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  /** Included in the next checkout when true. Defaults true for new/legacy items. */
  selected: boolean;
};

// =====================================
// CART CONTEXT
// =====================================

export type CartContextType = {
  cartItems: CartItem[];

  addToCart: (product: any) => void;

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
