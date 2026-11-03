export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  compare_price: number | null;
  image: string;
  description: string;
  stock: number;
  badge: string;
  sizes: string[];
  active: boolean;
  created_at?: string;
};
export type Category = {
  id: string;
  name: string;
  slug: string;
  image: string;
  color: string;
};
export type Profile = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  created_at?: string;
};
export type CartItem = { product_id: string; size: string; quantity: number };
export type Order = {
  id: string;
  user_id?: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  total: number;
  shipping: number;
  discount: number;
  status: string;
  payment_method: string;
  created_at: string;
  items: {
    product_id: string;
    name: string;
    size: string;
    quantity: number;
    price: number;
    image: string;
  }[];
};
export type Coupon = {
  id: string;
  code: string;
  percent: number;
  active: boolean;
};
export const photo = (id: string, width = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
export const categories: Category[] = [
  {
    id: "clothing",
    name: "Clothing",
    slug: "clothing",
    image: photo("photo-1522771930-78848d9293e8"),
    color: "#f5e9e5",
  },
  {
    id: "nursery",
    name: "Nursery",
    slug: "nursery",
    image: photo("photo-1773243086631-962baefccd8a"),
    color: "#eeeae0",
  },
  {
    id: "toys",
    name: "Toys & play",
    slug: "toys",
    image: photo("photo-1574661570553-be40c85891e5"),
    color: "#f2e5df",
  },
  {
    id: "feeding",
    name: "Feeding",
    slug: "feeding",
    image: photo("photo-1692477230414-e491bdcebc76"),
    color: "#e9eee5",
  },
  {
    id: "bath",
    name: "Bath & care",
    slug: "bath",
    image: photo("photo-1515488042361-ee00e0ddd4e4"),
    color: "#f3e9e1",
  },
  {
    id: "gifts",
    name: "Gifts & bundles",
    slug: "gifts",
    image: photo("photo-1512909006721-3d6018887383"),
    color: "#f5e7eb",
  },
];
export const products: Product[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "The everyday knit set",
    slug: "everyday-knit-set",
    category: "clothing",
    price: 2800,
    compare_price: 3500,
    image: photo("photo-1522771930-78848d9293e8"),
    description:
      "A little softness for every day. Our beautifully textured knit set keeps tiny explorers comfortable, from sleepy mornings to afternoon adventures. Made with breathable cotton and gentle, easy-change details.",
    stock: 24,
    badge: "Bestseller",
    sizes: ["0–3 months", "3–6 months", "6–12 months", "12–18 months"],
    active: true,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Bunny cuddle companion",
    slug: "bunny-cuddle-companion",
    category: "toys",
    price: 1650,
    compare_price: null,
    image: photo("photo-1574661570553-be40c85891e5"),
    description:
      "Meet their new best friend. A wonderfully soft plush companion for cuddles, imaginative play, and all of life’s little adventures. Follow the included age and care guidance; keep soft toys out of an infant’s sleep space.",
    stock: 18,
    badge: "Little favorite",
    sizes: ["One size"],
    active: true,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Cloud-soft muslin swaddle",
    slug: "cloud-soft-muslin-swaddle",
    category: "nursery",
    price: 1200,
    compare_price: 1500,
    image: photo("photo-1773243086631-962baefccd8a"),
    description:
      "Light, airy, and oh-so-soft. A generous cotton muslin wrap for supervised cuddles and everyday outings. Wash before first use and follow age-appropriate safe sleep guidance.",
    stock: 32,
    badge: "Organic cotton",
    sizes: ["120 × 120 cm"],
    active: true,
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Little moments gift box",
    slug: "little-moments-gift-box",
    category: "gifts",
    price: 4500,
    compare_price: null,
    image: photo("photo-1512909006721-3d6018887383"),
    description:
      "A thoughtful welcome to the world. A beautifully wrapped collection of little essentials, ready to celebrate a new arrival. Includes a cotton wrap, bib, and a handwritten gift note.",
    stock: 12,
    badge: "Gift-ready",
    sizes: ["Newborn"],
    active: true,
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    name: "Tiny toes cotton booties",
    slug: "tiny-toes-cotton-booties",
    category: "clothing",
    price: 850,
    compare_price: null,
    image: photo("photo-1515488042361-ee00e0ddd4e4"),
    description:
      "Soft cotton booties to keep those tiny toes cozy. Gentle ribbed cuffs stay comfortably in place.",
    stock: 28,
    badge: "New",
    sizes: ["0–3 months", "3–6 months"],
    active: true,
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    name: "First little feeding set",
    slug: "first-little-feeding-set",
    category: "feeding",
    price: 2400,
    compare_price: 2800,
    image: photo("photo-1692477230414-e491bdcebc76"),
    description:
      "Make mealtimes a little easier with this coordinated bowl, spoon, and bib set. Always supervise feeding and inspect before use.",
    stock: 16,
    badge: "New",
    sizes: ["One size"],
    active: true,
  },
  {
    id: "77777777-7777-4777-8777-777777777777",
    name: "Gentle days bath bundle",
    slug: "gentle-days-bath-bundle",
    category: "bath",
    price: 1950,
    compare_price: null,
    image: photo("photo-1515488042361-ee00e0ddd4e4"),
    description:
      "A soft cotton hooded towel and matching washcloths for cozy after-bath cuddles. Machine washable for easy everyday care.",
    stock: 20,
    badge: "Extra soft",
    sizes: ["One size"],
    active: true,
  },
  {
    id: "88888888-8888-4888-8888-888888888888",
    name: "Dreamy nursery blanket",
    slug: "dreamy-nursery-blanket",
    category: "nursery",
    price: 3200,
    compare_price: null,
    image: photo("photo-1773243086631-962baefccd8a"),
    description:
      "A beautifully textured blanket for supervised stroller trips and cozy cuddles. Keep loose blankets out of an infant’s sleep space.",
    stock: 14,
    badge: "Made with love",
    sizes: ["90 × 110 cm"],
    active: true,
  },
];
export const money = (value: number) => `KSh ${value.toLocaleString("en-KE")}`;
