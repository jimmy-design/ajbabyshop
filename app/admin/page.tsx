"use client";
import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Shapes,
  Ticket,
  Settings,
  ArrowUpRight,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  TrendingUp,
  ArrowRight,
  LogOut,
  Menu,
  Download,
  ImagePlus,
} from "lucide-react";
import { useShop } from "@/components/shop-provider";
import { Logo } from "@/components/storefront";
import { money, type Product, type Category, type Coupon } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { useModalAccessibility } from "@/lib/use-modal";
const tabs = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Products", icon: Package },
  { name: "Categories", icon: Shapes },
  { name: "Orders", icon: ShoppingBag },
  { name: "Customers", icon: Users },
  { name: "Coupons", icon: Ticket },
  { name: "Settings", icon: Settings },
];
const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export default function Admin() {
  const shop = useShop();
  const {
    user,
    ready,
    demo,
    products,
    categories,
    orders,
    profiles,
    coupons,
    notify,
  } = shop;
  const [tab, setTab] = useState("Overview"),
    [query, setQuery] = useState(""),
    [product, setProduct] = useState<Partial<Product> | null>(null),
    [category, setCategory] = useState<Partial<Category> | null>(null),
    [coupon, setCoupon] = useState<Partial<Coupon> | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [mobile, setMobile] = useState(false),
    [orderFilter, setOrderFilter] = useState("all"),
    [deleteTarget, setDeleteTarget] = useState<{
      type: "product" | "category";
      id: string;
      name: string;
    } | null>(null);
  useModalAccessibility(
    !!(product || category || coupon || deleteTarget),
    () => {
      if (!busy) {
        setProduct(null);
        setCategory(null);
        setCoupon(null);
        setDeleteTarget(null);
      }
    },
  );
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  if (!ready) return <div className="loading">Opening your little shop…</div>;
  if (user?.role !== "admin")
    return (
      <div className="admin-gate">
        <Logo />
        <div className="auth-card">
          <span className="eyebrow">BEHIND THE LITTLE LOVELIES</span>
          <h1>Your shop, beautifully managed.</h1>
          <p>
            {demo
              ? "Explore the complete admin experience. Products, categories, orders, and coupons are saved in this browser."
              : "Sign in with your administrator account to manage your shop."}
          </p>
          {demo ? (
            <button className="button primary" onClick={shop.demoAdmin}>
              Explore demo dashboard <ArrowRight size={17} />
            </button>
          ) : (
            <Link href="/account" className="button primary">
              Sign in as administrator
            </Link>
          )}
          <Link href="/" className="text-link">
            ← Back to the storefront
          </Link>
        </div>
      </div>
    );
  const revenue = orders
      .filter((o) => o.status === "delivered")
      .reduce((s, o) => s + o.total, 0),
    pending = orders.filter((o) => o.status === "pending").length;
  const productRows = products.filter((p) =>
    (p.name + " " + p.category).toLowerCase().includes(query.toLowerCase()),
  );
  function exportOrders() {
    const rows = [
      ["Order", "Customer", "Email", "Total KES", "Status", "Date"],
      ...orders.map((o) => [
        o.id,
        o.customer_name,
        o.email,
        String(o.total),
        o.status,
        o.created_at,
      ]),
    ];
    const csv = rows
      .map((r) =>
        r
          .map(
            (v) => '"' + v.replace(/^[=+@\-]/, "'$&").replace(/"/g, '""') + '"',
          )
          .join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "aj-baby-shop-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="admin-app">
      <aside className={`admin-sidebar ${mobile ? "open" : ""}`}>
        <Logo />
        <span className="admin-sidebar-label">YOUR LITTLE BUSINESS</span>
        <nav>
          {tabs.map((t) => (
            <button
              key={t.name}
              className={tab === t.name ? "active" : ""}
              onClick={() => {
                setTab(t.name);
                setQuery("");
                setError("");
                setMobile(false);
              }}
            >
              <t.icon size={18} />
              {t.name}
              {t.name === "Orders" && pending > 0 && <b>{pending}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span>Made for big dreams ♡</span>
            <p>A little care goes a long way.</p>
          </div>
          <Link href="/">
            Visit your storefront <ArrowUpRight size={16} />
          </Link>
          <button
            onClick={() => {
              shop.signOut().catch((e) => notify(e.message));
            }}
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <button
              className="icon-btn admin-menu"
              aria-label="Toggle admin menu"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={20} />
            </button>
            <span>
              AJ Baby Shop <span className="muted">/ {tab}</span>
            </span>
          </div>
          <div>
            <span className={`connection ${demo ? "demo" : ""}`}>
              <i />
              {demo ? "Demo workspace" : "Supabase connected"}
            </span>
            <span className="admin-avatar">{user.name[0]}</span>
          </div>
        </header>
        <main className="admin-content">
          {demo && (
            <div className="demo-banner">
              Demo workspace · Your changes stay in this browser. Connect
              Supabase to run your live shop.
            </div>
          )}
          {shop.error && <div className="form-error">{shop.error}</div>}
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          {tab !== "Overview" && (
            <div className="admin-heading">
              <div>
                <h1>{tab}</h1>
                <p>
                  {tab === "Overview"
                    ? "Here’s what’s happening in your little shop today."
                    : tab === "Products"
                      ? "Every little lovely, all in one place."
                      : tab === "Categories"
                        ? "Make your collection easy to discover."
                        : tab === "Orders"
                          ? "From a little click to a lovely delivery."
                          : tab === "Customers"
                            ? "The people at the heart of your shop."
                            : tab === "Coupons"
                              ? "A little extra reason to smile."
                              : "The details behind your little business."}
                </p>
              </div>
              {tab === "Products" && (
                <button
                  className="button primary"
                  onClick={() => {
                    setProduct({
                      active: true,
                      stock: 0,
                      price: 0,
                      sizes: ["One size"],
                      badge: "",
                    });
                    setError("");
                  }}
                >
                  <Plus size={16} /> Add product
                </button>
              )}
              {tab === "Categories" && (
                <button
                  className="button primary"
                  onClick={() => setCategory({ color: "#f5e7eb" })}
                >
                  <Plus size={16} /> Add category
                </button>
              )}
              {tab === "Coupons" && (
                <button
                  className="button primary"
                  onClick={() => setCoupon({ active: true, percent: 10 })}
                >
                  <Plus size={16} /> Create coupon
                </button>
              )}
              {tab === "Orders" && (
                <button className="button secondary" onClick={exportOrders}>
                  <Download size={16} /> Export orders
                </button>
              )}
            </div>
          )}
          {tab === "Overview" && (
            <>
              <div className="stat-grid">
                {[
                  {
                    label: "Delivered revenue",
                    value: money(revenue),
                    icon: TrendingUp,
                    note: "Completed deliveries",
                  },
                  {
                    label: "Total orders",
                    value: orders.length,
                    icon: ShoppingBag,
                    note: `${pending} waiting for a little attention`,
                  },
                  {
                    label: "Active products",
                    value: products.filter((p) => p.active).length,
                    icon: Package,
                    note: `${products.filter((p) => p.stock <= 5).length} running low on stock`,
                  },
                  {
                    label: "Customers",
                    value: demo
                      ? new Set(orders.map((o) => o.email)).size
                      : profiles.filter((p) => p.role === "customer").length,
                    icon: Users,
                    note: "Your growing little family",
                  },
                ].map((s) => (
                  <div className="stat-card" key={s.label}>
                    <span>
                      {s.label}
                      <s.icon size={18} />
                    </span>
                    <strong>{s.value}</strong>
                    <small>{s.note}</small>
                  </div>
                ))}
              </div>
              <div className="dashboard-columns">
                <section className="admin-panel">
                  <div className="panel-heading">
                    <h2>Recent orders</h2>
                    <button
                      className="text-link"
                      onClick={() => setTab("Orders")}
                    >
                      View all <ArrowRight size={14} />
                    </button>
                  </div>
                  {orders.length ? (
                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>Order / customer</th>
                            <th>Status</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 6).map((o) => (
                            <tr key={o.id}>
                              <td>
                                <strong>
                                  #{o.id.slice(0, 8).toUpperCase()}
                                </strong>
                                <small>{o.customer_name}</small>
                              </td>
                              <td>
                                <span className={`status status-${o.status}`}>
                                  {o.status}
                                </span>
                              </td>
                              <td>
                                <span className="currency-amount">
                                  {money(o.total)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="admin-empty">
                      <ShoppingBag size={32} />
                      <h3>Your next chapter is waiting</h3>
                      <p>Orders will appear here when customers check out.</p>
                      <Link href="/shop" className="text-link">
                        Explore your storefront <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}
                </section>
                <section className="admin-panel">
                  <div className="panel-heading">
                    <h2>A little stock check</h2>
                    <Package size={18} />
                  </div>
                  {products
                    .slice()
                    .sort((a, b) => a.stock - b.stock)
                    .slice(0, 4)
                    .map((p) => (
                      <div className="inventory-row" key={p.id}>
                        <img src={p.image} alt="" />
                        <div>
                          <strong>{p.name}</strong>
                          <small>{p.stock} in stock</small>
                        </div>
                        <button
                          className="icon-btn"
                          aria-label={`Edit ${p.name}`}
                          onClick={() => setProduct(p)}
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    ))}
                </section>
              </div>
              <section className="admin-welcome">
                <div>
                  <span className="eyebrow">
                    YOUR LITTLE SHOP, READY TO BLOOM
                  </span>
                  <h2>
                    A beautiful collection starts
                    <br />
                    with a little inspiration.
                  </h2>
                  <p>Add something lovely. Make someone’s day.</p>
                  <button
                    className="button primary"
                    onClick={() =>
                      setProduct({
                        active: true,
                        stock: 0,
                        price: 0,
                        sizes: ["One size"],
                      })
                    }
                  >
                    Create a new product <Plus size={16} />
                  </button>
                </div>
                <span>✿</span>
              </section>
            </>
          )}
          {tab === "Products" && (
            <section className="admin-panel">
              <div className="panel-heading">
                <h2>
                  All products{" "}
                  <span className="count-pill">{products.length}</span>
                </h2>
                <div className="search-field">
                  <Search size={16} />
                  <input
                    aria-label="Search admin products"
                    placeholder="Search products…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Inventory</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productRows.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="table-product">
                            <img src={p.image} alt="" />
                            <div>
                              <strong>{p.name}</strong>
                              <small>{p.sizes.join(" · ")}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          {categories.find((c) => c.slug === p.category)
                            ?.name || p.category}
                        </td>
                        <td>
                          <span className="currency-amount">
                            {money(p.price)}
                          </span>
                        </td>
                        <td>
                          <span className={p.stock <= 5 ? "low-stock" : ""}>
                            {p.stock} in stock
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status ${p.active ? "status-delivered" : "status-cancelled"}`}
                          >
                            {p.active ? "Active" : "Draft"}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              aria-label={`Edit ${p.name}`}
                              onClick={() => {
                                setProduct(p);
                                setError("");
                              }}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              aria-label={`Delete ${p.name}`}
                              onClick={() =>
                                setDeleteTarget({
                                  type: "product",
                                  id: p.id,
                                  name: p.name,
                                })
                              }
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!productRows.length && (
                  <div className="admin-empty">
                    No products match your search.
                  </div>
                )}
              </div>
            </section>
          )}
          {tab === "Categories" && (
            <div className="admin-category-grid">
              {categories.map((c) => (
                <div className="admin-panel admin-category" key={c.id}>
                  <img src={c.image} alt={c.name} />
                  <div>
                    <h2>{c.name}</h2>
                    <p>
                      {products.filter((p) => p.category === c.slug).length}{" "}
                      products · /{c.slug}
                    </p>
                    <div className="row-actions">
                      <button onClick={() => setCategory(c)}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        aria-label={`Delete ${c.name}`}
                        onClick={() =>
                          setDeleteTarget({
                            type: "category",
                            id: c.id,
                            name: c.name,
                          })
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "Orders" && (
            <section className="admin-panel">
              <div className="panel-heading">
                <h2>
                  All orders <span className="count-pill">{orders.length}</span>
                </h2>
                <select
                  aria-label="Filter order status"
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                >
                  <option value="all">All statuses</option>
                  {[
                    "pending",
                    "confirmed",
                    "processing",
                    "shipped",
                    "delivered",
                    "cancelled",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              {orders
                .filter(
                  (o) => orderFilter === "all" || o.status === orderFilter,
                )
                .map((o) => (
                  <details className="admin-order" key={o.id}>
                    <summary>
                      <strong>#{o.id.slice(0, 8).toUpperCase()}</strong>
                      <span>
                        {o.customer_name}
                        <small>
                          {new Date(o.created_at).toLocaleDateString("en-KE")}
                        </small>
                      </span>
                      <span className={`status status-${o.status}`}>
                        {o.status}
                      </span>
                      <strong>
                        <span className="currency-amount">
                          {money(o.total)}
                        </span>
                      </strong>
                    </summary>
                    <div className="order-detail">
                      <p>
                        <b>{o.customer_name}</b> · {o.email} · {o.phone}
                      </p>
                      <p>
                        {o.address}, {o.city}
                      </p>
                      {o.items.map((i, n) => (
                        <div key={n}>
                          {i.name} · {i.size} × {i.quantity}
                          <strong>
                            <span className="currency-amount">
                              {money(i.price * i.quantity)}
                            </span>
                          </strong>
                        </div>
                      ))}
                      <p>
                        Delivery{" "}
                        <span className="currency-amount">
                          {money(o.shipping)}
                        </span>{" "}
                        · Discount{" "}
                        <span className="currency-amount">
                          {money(o.discount)}
                        </span>{" "}
                        · Cash on delivery
                      </p>
                      <label>
                        Update status
                        <select
                          disabled={busy}
                          value={o.status}
                          onChange={(e) =>
                            run(() => shop.updateOrder(o.id, e.target.value))
                          }
                        >
                          {[
                            "pending",
                            "confirmed",
                            "processing",
                            "shipped",
                            "delivered",
                            "cancelled",
                          ].map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </label>
                      <small>
                        Stock is deducted when an order is placed. For
                        cancellations, review and adjust inventory manually.
                      </small>
                    </div>
                  </details>
                ))}
              {!orders.length && (
                <div className="admin-empty">
                  <ShoppingBag size={32} />
                  <h3>No orders just yet</h3>
                  <p>
                    {demo
                      ? "Try placing a demo order from the storefront."
                      : "New customer orders will appear here."}
                  </p>
                </div>
              )}
            </section>
          )}
          {tab === "Customers" && (
            <section className="admin-panel">
              <div className="panel-heading">
                <h2>Your little community</h2>
                <div className="search-field">
                  <Search size={16} />
                  <input
                    aria-label="Search customers"
                    placeholder="Search name or email…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
              {demo ? (
                <div className="admin-empty">
                  <Users size={32} />
                  <h3>Real people. A real connection.</h3>
                  <p>
                    Connect Supabase to view registered customers and manage
                    account roles.
                  </p>
                </div>
              ) : (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Joined</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles
                        .filter((p) =>
                          (p.name + p.email)
                            .toLowerCase()
                            .includes(query.toLowerCase()),
                        )
                        .map((p) => (
                          <tr key={p.id}>
                            <td>
                              <strong>{p.name}</strong>
                            </td>
                            <td>{p.email}</td>
                            <td>
                              {p.created_at
                                ? new Date(p.created_at).toLocaleDateString(
                                    "en-KE",
                                  )
                                : "—"}
                            </td>
                            <td>
                              <select
                                aria-label={`Role for ${p.name}`}
                                disabled={busy || p.id === user.id}
                                value={p.role}
                                onChange={(e) =>
                                  run(() =>
                                    shop.updateRole(p.id, e.target.value),
                                  )
                                }
                              >
                                <option value="customer">Customer</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
          {tab === "Coupons" && (
            <div className="coupon-grid">
              {coupons.map((c) => (
                <div className="admin-panel coupon-card" key={c.id}>
                  <Ticket size={25} />
                  <strong>
                    {c.percent}% <span>off</span>
                  </strong>
                  <h3>{c.code}</h3>
                  <p>
                    <span
                      className={`status ${c.active ? "status-delivered" : "status-cancelled"}`}
                    >
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </p>
                  <button className="text-link" onClick={() => setCoupon(c)}>
                    Edit coupon <Pencil size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {tab === "Settings" && (
            <div className="settings-grid">
              <section className="admin-panel settings-panel">
                <h2>Store configuration</h2>
                <label>
                  Store name
                  <input value="AJ Baby Shop" readOnly />
                </label>
                <label>
                  Currency
                  <input value="KES — Kenyan shilling" readOnly />
                </label>
                <label>
                  Standard delivery
                  <input
                    value="KSh 350 · Free on orders ≥ KSh 5,000"
                    readOnly
                  />
                </label>
                <label>
                  Payment method
                  <input value="Cash on delivery" readOnly />
                </label>
                <p className="muted">
                  These settings are defined in the application and database
                  checkout function. Change both together when updating your
                  pricing policy.
                </p>
              </section>
              <section className="admin-panel settings-panel">
                <h2>Database & security</h2>
                <span className={`connection ${demo ? "demo" : ""}`}>
                  <i />
                  {demo ? "Demo mode" : "Supabase connected"}
                </span>
                <p>
                  {demo
                    ? "Copy .env.example to .env.local, add your Supabase project URL and public key, and run the SQL schema provided in supabase/schema.sql."
                    : "Your store uses Supabase Auth and database row-level security. Only admins can manage your catalogue and customer roles."}
                </p>
                <h3>Product images</h3>
                <p>
                  Use an image URL or upload directly from the product editor.
                  Connected uploads use the product-images storage bucket.
                </p>
                <h3>Go-live checklist</h3>
                <p>
                  Replace sample products and imagery. Confirm your delivery,
                  return, contact and privacy details. Test a complete order
                  with a customer account.
                </p>
              </section>
            </div>
          )}
        </main>
        <div className="admin-footer">
          A little love in everything. <span>AJ Baby Shop · Admin</span>
        </div>
      </div>
      {product && (
        <div className="modal-backdrop">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            className="modal"
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">A NEW LITTLE LOVELY</span>
                <h2 id="product-modal-title">
                  {product.id ? "Edit product" : "Create a product"}
                </h2>
              </div>
              <button
                aria-label="Close product editor"
                className="icon-btn"
                onClick={() => setProduct(null)}
              >
                <X />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const p: Product = {
                  id: product.id || crypto.randomUUID(),
                  name: String(f.get("name")).trim(),
                  slug: String(f.get("slug")).trim(),
                  category: String(f.get("category")),
                  price: Number(f.get("price")),
                  compare_price: f.get("compare_price")
                    ? Number(f.get("compare_price"))
                    : null,
                  image: String(f.get("image")),
                  description: String(f.get("description")),
                  stock: Number(f.get("stock")),
                  badge: String(f.get("badge")),
                  sizes: String(f.get("sizes"))
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                  active: f.get("active") === "on",
                };
                if (!p.sizes.length) {
                  setError("Enter at least one size or option.");
                  return;
                }
                if (await run(() => shop.saveProduct(p))) setProduct(null);
              }}
            >
              <div className="form-grid">
                <label className="span-2">
                  Product name
                  <input
                    name="name"
                    required
                    value={product.name || ""}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        name: e.target.value,
                        ...(!product.id
                          ? { slug: slugify(e.target.value) }
                          : {}),
                      })
                    }
                  />
                </label>
                <label>
                  URL slug
                  <input
                    name="slug"
                    required
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    value={product.slug || ""}
                    onChange={(e) =>
                      setProduct({ ...product, slug: e.target.value })
                    }
                  />
                </label>
                <label>
                  Category
                  <select
                    aria-label="Category"
                    name="category"
                    required
                    defaultValue={product.category || categories[0]?.slug}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Price (KES)
                  <input
                    name="price"
                    type="number"
                    min="1"
                    step="1"
                    required
                    defaultValue={product.price || ""}
                  />
                </label>
                <label>
                  Original price (optional)
                  <input
                    name="compare_price"
                    type="number"
                    min="1"
                    step="1"
                    defaultValue={product.compare_price || ""}
                  />
                </label>
                <label className="span-2">
                  Image URL
                  <input
                    name="image"
                    type="url"
                    required
                    value={product.image || ""}
                    onChange={(e) =>
                      setProduct({ ...product, image: e.target.value })
                    }
                  />
                </label>
                <label className="upload-label span-2">
                  <ImagePlus size={18} />
                  {busy
                    ? "Uploading…"
                    : demo
                      ? "Connect Supabase for image uploads (image URLs work now)"
                      : "Upload product image"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={demo || busy}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !supabase) return;
                      if (
                        !["image/jpeg", "image/png", "image/webp"].includes(
                          file.type,
                        ) ||
                        file.size > 5 * 1024 * 1024
                      ) {
                        setError("Choose a JPG, PNG or WebP image under 5 MB.");
                        return;
                      }
                      await run(async () => {
                        const path = `${crypto.randomUUID()}.${file.type.split("/")[1]}`;
                        const { error } = await supabase!.storage
                          .from("product-images")
                          .upload(path, file);
                        if (error) throw error;
                        setProduct((prev) => ({
                          ...prev,
                          image: supabase!.storage
                            .from("product-images")
                            .getPublicUrl(path).data.publicUrl,
                        }));
                      });
                    }}
                  />
                </label>
                {product.image && (
                  <img
                    className="upload-preview"
                    src={product.image}
                    alt="Product preview"
                  />
                )}
                <label className="span-2">
                  Description
                  <textarea
                    name="description"
                    required
                    rows={4}
                    defaultValue={product.description || ""}
                  />
                </label>
                <label>
                  Stock quantity
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    required
                    defaultValue={product.stock ?? 0}
                  />
                </label>
                <label>
                  Badge
                  <input
                    name="badge"
                    placeholder="e.g. Bestseller"
                    defaultValue={product.badge || ""}
                  />
                </label>
                <label className="span-2">
                  Sizes / options (separate with commas)
                  <input
                    name="sizes"
                    required
                    defaultValue={product.sizes?.join(", ") || "One size"}
                  />
                </label>
                <label className="checkbox-line span-2">
                  <input
                    name="active"
                    type="checkbox"
                    defaultChecked={product.active}
                  />{" "}
                  Active · visible on the storefront
                </label>
              </div>
              {error && (
                <div className="form-error" role="alert">
                  {error}
                </div>
              )}
              <div className="modal-footer">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setProduct(null)}
                >
                  Cancel
                </button>
                <button className="button primary" disabled={busy}>
                  {busy ? "Saving…" : "Save product"} <ArrowRight size={15} />
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {category && (
        <div className="modal-backdrop">
          <section
            className="modal small-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-title"
          >
            <div className="modal-heading">
              <h2 id="category-title">
                {category.id ? "Edit category" : "New category"}
              </h2>
              <button
                className="icon-btn"
                aria-label="Close category editor"
                onClick={() => setCategory(null)}
              >
                <X />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const c: Category = {
                  id: category.id || crypto.randomUUID(),
                  name: String(f.get("name")).trim(),
                  slug: category.slug || slugify(String(f.get("name"))),
                  image: String(f.get("image")),
                  color: String(f.get("color")),
                };
                if (await run(() => shop.saveCategory(c))) setCategory(null);
              }}
            >
              <label>
                Name
                <input name="name" required defaultValue={category.name} />
              </label>
              {category.id && (
                <p className="muted">
                  Slug: {category.slug}. Kept stable for product links.
                </p>
              )}
              <label>
                Image URL
                <input
                  type="url"
                  name="image"
                  required
                  defaultValue={category.image}
                />
              </label>
              <label>
                Background color
                <input
                  type="color"
                  name="color"
                  defaultValue={category.color}
                />
              </label>
              {error && <div className="form-error">{error}</div>}
              <button className="button primary" disabled={busy}>
                Save category
              </button>
            </form>
          </section>
        </div>
      )}
      {coupon && (
        <div className="modal-backdrop">
          <section
            className="modal small-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="coupon-title"
          >
            <div className="modal-heading">
              <h2 id="coupon-title">A little gift code</h2>
              <button
                aria-label="Close coupon editor"
                className="icon-btn"
                onClick={() => setCoupon(null)}
              >
                <X />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                if (
                  await run(() =>
                    shop.saveCoupon({
                      id: coupon.id || crypto.randomUUID(),
                      code: String(f.get("code")).trim().toUpperCase(),
                      percent: Number(f.get("percent")),
                      active: f.get("active") === "on",
                    }),
                  )
                )
                  setCoupon(null);
              }}
            >
              <label>
                Coupon code
                <input
                  name="code"
                  required
                  pattern="[A-Za-z0-9_-]+"
                  maxLength={40}
                  defaultValue={coupon.code}
                />
              </label>
              <label>
                Discount (%)
                <input
                  name="percent"
                  required
                  type="number"
                  min="1"
                  max="90"
                  step="1"
                  defaultValue={coupon.percent}
                />
              </label>
              <label className="checkbox-line">
                <input
                  name="active"
                  type="checkbox"
                  defaultChecked={coupon.active}
                />{" "}
                Active coupon
              </label>
              {error && <div className="form-error">{error}</div>}
              <button className="button primary" disabled={busy}>
                Save coupon
              </button>
            </form>
          </section>
        </div>
      )}
      {deleteTarget && (
        <div className="modal-backdrop">
          <section
            className="modal small-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <h2 id="delete-title">Remove this little lovely?</h2>
            <p>Delete “{deleteTarget.name}”? This action cannot be undone.</p>
            {error && <div className="form-error">{error}</div>}
            <div className="modal-footer">
              <button
                className="button secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Keep it
              </button>
              <button
                className="button danger"
                disabled={busy}
                onClick={async () => {
                  if (
                    await run(() =>
                      deleteTarget.type === "product"
                        ? shop.deleteProduct(deleteTarget.id)
                        : shop.deleteCategory(deleteTarget.id),
                    )
                  )
                    setDeleteTarget(null);
                }}
              >
                Delete {deleteTarget.type}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
