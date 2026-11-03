"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  products as seedProducts,
  categories as seedCategories,
  type Product,
  type Category,
  type CartItem,
  type Profile,
  type Order,
  type Coupon,
} from "@/lib/data";
type Checkout = {
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  coupon: string;
};
type Store = {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  wishlist: string[];
  user: Profile | null;
  ready: boolean;
  demo: boolean;
  error: string;
  toast: string;
  notify: (s: string) => void;
  addToCart: (p: Product, size?: string, quantity?: number) => void;
  setQuantity: (id: string, size: string, n: number) => void;
  toggleWish: (id: string) => void;
  signIn: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  demoAdmin: () => void;
  refresh: () => Promise<void>;
  saveProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  saveCategory: (c: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  orders: Order[];
  profiles: Profile[];
  coupons: Coupon[];
  placeOrder: (data: Checkout) => Promise<Order>;
  updateOrder: (id: string, status: string) => Promise<void>;
  updateRole: (id: string, role: string) => Promise<void>;
  saveCoupon: (c: Coupon) => Promise<void>;
  subscribe: (email: string) => Promise<void>;
};
const Context = createContext<Store | null>(null);
export function useShop() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Missing shop provider");
  return ctx;
}
function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(
      isSupabaseConfigured ? [] : seedProducts,
    ),
    [categories, setCategories] = useState<Category[]>(
      isSupabaseConfigured ? [] : seedCategories,
    ),
    [cart, setCart] = useState<CartItem[]>([]),
    [wishlist, setWishlist] = useState<string[]>([]),
    [user, setUser] = useState<Profile | null>(null),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [orders, setOrders] = useState<Order[]>([]),
    [profiles, setProfiles] = useState<Profile[]>([]),
    [coupons, setCoupons] = useState<Coupon[]>([
      { id: "welcome", code: "WELCOME10", percent: 10, active: true },
    ]);
  const notify = useCallback((message: string) => setToast(message), []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  const refresh = useCallback(async () => {
    if (!supabase) return;
    const [p, c] = await Promise.all([
      supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ]);
    if (p.error || c.error) {
      setError(p.error?.message || c.error?.message || "Unable to load shop");
      return;
    }
    setError("");
    setProducts(p.data || []);
    setCategories(c.data || []);
    const {
      data: { user: auth },
    } = await supabase.auth.getUser();
    if (auth) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", auth.id)
        .single();
      setUser(profile);
      const { data: o } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .order("created_at", { ascending: false });
      setOrders(o || []);
      if (profile?.role === "admin") {
        const [ps, cs] = await Promise.all([
          supabase.from("profiles").select("*"),
          supabase.from("coupons").select("*"),
        ]);
        setProfiles(ps.data || []);
        setCoupons(cs.data || []);
      } else {
        setProfiles([]);
        setCoupons([]);
      }
    } else {
      setUser(null);
      setOrders([]);
      setProfiles([]);
      setCoupons([]);
    }
  }, []);
  useEffect(() => {
    setCart(read("aj-cart", []));
    setWishlist(read("aj-wishlist", []));
    if (!supabase) {
      setProducts(read("aj-products", seedProducts));
      setCategories(read("aj-categories", seedCategories));
      setOrders(read("aj-orders", []));
      setCoupons(
        read("aj-coupons", [
          { id: "welcome", code: "WELCOME10", percent: 10, active: true },
        ]),
      );
      setUser(read("aj-user", null));
    }
    refresh()
      .catch((e) => setError(e.message))
      .finally(() => setReady(true));
    const subscription = supabase?.auth.onAuthStateChange(() => {
      setTimeout(() => refresh().catch((e) => setError(e.message)), 0);
    });
    return () => subscription?.data.subscription.unsubscribe();
  }, [refresh]);
  useEffect(() => {
    if (ready) {
      localStorage.setItem("aj-cart", JSON.stringify(cart));
      localStorage.setItem("aj-wishlist", JSON.stringify(wishlist));
      if (!supabase) {
        localStorage.setItem("aj-products", JSON.stringify(products));
        localStorage.setItem("aj-categories", JSON.stringify(categories));
        localStorage.setItem("aj-orders", JSON.stringify(orders));
        localStorage.setItem("aj-coupons", JSON.stringify(coupons));
        localStorage.setItem("aj-user", JSON.stringify(user));
      }
    }
  }, [cart, wishlist, products, categories, orders, coupons, user, ready]);
  function addToCart(p: Product, size = p.sizes[0], quantity = 1) {
    const current = cart
      .filter((x) => x.product_id === p.id)
      .reduce((s, x) => s + x.quantity, 0);
    if (current + quantity > p.stock) {
      notify("That quantity is not available in stock.");
      return;
    }
    setCart((prev) => {
      const exists = prev.find((x) => x.product_id === p.id && x.size === size);
      return exists
        ? prev.map((x) =>
            x === exists ? { ...x, quantity: x.quantity + quantity } : x,
          )
        : [...prev, { product_id: p.id, size, quantity }];
    });
    notify("A little lovely added to your bag");
  }
  function setQuantity(id: string, size: string, n: number) {
    const product = products.find((p) => p.id === id);
    const others = cart
      .filter((x) => x.product_id === id && x.size !== size)
      .reduce((s, x) => s + x.quantity, 0);
    if (n > 0 && (!product || n + others > product.stock)) {
      notify("That quantity is not available.");
      return;
    }
    setCart((prev) =>
      n <= 0
        ? prev.filter((x) => !(x.product_id === id && x.size === size))
        : prev.map((x) =>
            x.product_id === id && x.size === size ? { ...x, quantity: n } : x,
          ),
    );
  }
  async function signIn(email: string, password: string, name?: string) {
    if (!supabase)
      throw new Error(
        "Connect Supabase to create an account or sign in. You can explore the demo admin without an account.",
      );
    const result = name
      ? await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        })
      : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) throw result.error;
    if (name && !result.data.session)
      notify("Check your email to confirm your account.");
    else notify("Welcome to the AJ family");
    await refresh();
  }
  async function signOut() {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    setUser(null);
    setProfiles([]);
    if (supabase) setOrders([]);
  }
  function checkAdmin() {
    if (user?.role !== "admin") throw new Error("Admin access required");
  }
  async function saveProduct(p: Product) {
    checkAdmin();
    if (supabase) {
      const { error } = await supabase.from("products").upsert(p);
      if (error) throw error;
      await refresh();
    } else setProducts((prev) => [p, ...prev.filter((x) => x.id !== p.id)]);
    notify("Product saved");
  }
  async function deleteProduct(id: string) {
    checkAdmin();
    if (supabase) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      await refresh();
    } else setProducts((p) => p.filter((x) => x.id !== id));
    notify("Product deleted");
  }
  async function saveCategory(c: Category) {
    checkAdmin();
    if (supabase) {
      const { error } = await supabase.from("categories").upsert(c);
      if (error) throw error;
      await refresh();
    } else setCategories((p) => [...p.filter((x) => x.id !== c.id), c]);
    notify("Category saved");
  }
  async function deleteCategory(id: string) {
    checkAdmin();
    if (
      products.some(
        (p) => p.category === categories.find((c) => c.id === id)?.slug,
      )
    )
      throw new Error("Move products to another category first.");
    if (supabase) {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      await refresh();
    } else setCategories((p) => p.filter((x) => x.id !== id));
    notify("Category deleted");
  }
  async function placeOrder(data: Checkout) {
    if (!cart.length) throw new Error("Your bag is empty.");
    let order: Order;
    if (supabase) {
      if (!user) throw new Error("Please sign in before placing your order.");
      const { data: result, error } = await supabase.rpc("place_order", {
        cart_items: cart,
        shipping_details: data,
        coupon_code: data.coupon || null,
      });
      if (error) throw error;
      await refresh();
      order = result as Order;
    } else {
      const items = cart.map((i) => {
        const p = products.find((p) => p.id === i.product_id);
        if (!p || p.stock < i.quantity)
          throw new Error("An item is no longer available.");
        return { ...i, name: p.name, price: p.price, image: p.image };
      });
      const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
      const coupon = coupons.find(
        (c) => c.active && c.code === data.coupon.trim().toUpperCase(),
      );
      if (data.coupon && !coupon)
        throw new Error("This coupon is invalid or inactive.");
      const discount = Math.round((subtotal * (coupon?.percent || 0)) / 100);
      order = {
        id: crypto.randomUUID(),
        user_id: user?.id,
        ...data,
        total: subtotal - discount + (subtotal >= 5000 ? 0 : 350),
        shipping: subtotal >= 5000 ? 0 : 350,
        discount,
        status: "pending",
        payment_method: "cash_on_delivery",
        created_at: new Date().toISOString(),
        items,
      };
      setOrders((prev) => [order, ...prev]);
      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          stock:
            p.stock -
            items
              .filter((i) => i.product_id === p.id)
              .reduce((s, i) => s + i.quantity, 0),
        })),
      );
    }
    setCart([]);
    notify(
      supabase
        ? "Your order is placed. Thank you!"
        : "Demo order created — no real order or payment was sent.",
    );
    return order;
  }
  async function updateOrder(id: string, status: string) {
    checkAdmin();
    if (supabase) {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      await refresh();
    } else setOrders((p) => p.map((o) => (o.id === id ? { ...o, status } : o)));
    notify("Order updated");
  }
  async function updateRole(id: string, role: string) {
    checkAdmin();
    if (id === user?.id)
      throw new Error("You cannot change your own admin role.");
    if (supabase) {
      const { error } = await supabase.rpc("set_user_role", {
        target_user: id,
        new_role: role,
      });
      if (error) throw error;
      await refresh();
    } else
      throw new Error("User management requires connected Supabase accounts.");
    notify("User role updated");
  }
  async function saveCoupon(c: Coupon) {
    checkAdmin();
    if (supabase) {
      const { error } = await supabase.from("coupons").upsert(c);
      if (error) throw error;
      await refresh();
    } else setCoupons((p) => [...p.filter((x) => x.id !== c.id), c]);
    notify("Coupon saved");
  }
  async function subscribe(email: string) {
    if (supabase) {
      const { error } = await supabase.rpc("subscribe_newsletter", {
        subscriber_email: email,
      });
      if (error) throw error;
      notify("You’re on the list. Welcome to our little circle!");
    } else {
      const list = read<string[]>("aj-newsletter", []);
      localStorage.setItem(
        "aj-newsletter",
        JSON.stringify([...new Set([...list, email])]),
      );
      notify(
        "Saved in this demo browser. Connect Supabase for live subscriptions.",
      );
    }
  }
  return (
    <Context.Provider
      value={{
        products,
        categories,
        cart,
        wishlist,
        user,
        ready,
        demo: !isSupabaseConfigured,
        error,
        toast,
        notify,
        addToCart,
        setQuantity,
        toggleWish: (id) =>
          setWishlist((p) =>
            p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
          ),
        signIn,
        signOut,
        demoAdmin: () => {
          if (!supabase)
            setUser({
              id: "demo-admin",
              name: "Demo admin",
              email: "demo@ajbabyshop.local",
              role: "admin",
            });
        },
        refresh,
        saveProduct,
        deleteProduct,
        saveCategory,
        deleteCategory,
        orders,
        profiles,
        coupons,
        placeOrder,
        updateOrder,
        updateRole,
        saveCoupon,
        subscribe,
      }}
    >
      {children}
      {toast && (
        <div className="toast" role="status">
          ♡ &nbsp;{toast}
        </div>
      )}
    </Context.Provider>
  );
}
