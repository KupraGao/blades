export type Category = {
  title: string;
  description: string;
  count: number;
};

export type Product = {
  title: string;
  category: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  image: string;
};

export const categories: Category[] = [
  {
    title: "Everyday Carry",
    description: "ყოველდღიური გამოყენებისთვის შერჩეული კომპაქტური მოდელები.",
    count: 18,
  },
  {
    title: "Outdoor Gear",
    description: "სალაშქრო და outdoor აქსესუარები.",
    count: 24,
  },
  {
    title: "Accessories",
    description: "ქამრები, საფულეები, შალითები და დამატებითი ნივთები.",
    count: 31,
  },
  {
    title: "Collectors",
    description: "პრემიუმ სერიის პროდუქტები კოლექციონერებისთვის.",
    count: 9,
  },
];

export const products: Product[] = [
  {
    title: "Kansai Compact",
    category: "Everyday Carry",
    price: 189,
    oldPrice: 240,
    badge: "Sale",
    image: "https://images.unsplash.com/photo-1607703829739-c05b7beddf60?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Trail Master Kit",
    category: "Outdoor Gear",
    price: 320,
    badge: "New",
    image: "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Leather Wallet Pro",
    category: "Accessories",
    price: 115,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Premium Field Tool",
    category: "Collectors",
    price: 690,
    oldPrice: 790,
    badge: "Limited",
    image: "https://images.unsplash.com/photo-1598541264502-84dc6aa2fb87?auto=format&fit=crop&w=900&q=80",
  },
];
