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

  cartCount: number;

  cartTotal: number;
};