"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Search,
  Heart,
  ShoppingBag,
  UserRound,
  Menu,
  X,
  Truck,
  ShieldCheck,
  Gift,
  Minus,
  Plus,
  Check,
  Star,
  Leaf,
  ChevronDown,
  Instagram,
  ArrowUpRight,
  PackageCheck,
} from "lucide-react";
import { useShop } from "./shop-provider";
import { HeroSlider } from "./hero-slider";
import { FooterContacts, FooterSocials } from "./footer-contact";
import { money, photo, type Product } from "@/lib/data";
export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="AJ Baby Shop home">
      <span className="logo-mark">
        aj<span>✿</span>
      </span>
      <span>
        baby shop<small>LITTLE THINGS. ENDLESS LOVE.</small>
      </span>
    </Link>
  );
}
export function Header() {
  const { cart, wishlist } = useShop();
  const [menu, setMenu] = useState(false);
  return (
    <>
      <div className="announcement">
        <span>A little love, delivered to your door</span>
        <span>
          Free delivery on orders over KSh 5,000 <Truck size={14} />
        </span>
        <Link href="/shop?category=gifts">
          Made for gifting <Gift size={13} />
        </Link>
      </div>
      <header className="header">
        <div className="header-main wrap">
          <button
            className="icon-btn mobile-menu"
            onClick={() => setMenu(!menu)}
            aria-label="Toggle menu"
          >
            {menu ? <X /> : <Menu />}
          </button>
          <Logo />
          <nav className="main-nav">
            <Link href="/shop">
              Shop all <ChevronDown size={12} />
            </Link>
            <Link href="/shop?sort=new">
              New arrivals <span className="nav-dot" />
            </Link>
            <Link href="/shop?category=clothing">Clothing</Link>
            <Link href="/shop?category=nursery">Nursery</Link>
            <Link href="/shop?category=gifts">Gifts & bundles</Link>
          </nav>
          <div className="header-actions">
            <Link href="/shop?search=" aria-label="Search products">
              <Search />
            </Link>
            <Link href="/account" aria-label="My account">
              <UserRound />
            </Link>
            <Link href="/wishlist" aria-label="Wishlist">
              <Heart />
              {wishlist.length > 0 && <i>{wishlist.length}</i>}
            </Link>
            <Link href="/cart" aria-label="Shopping bag">
              <ShoppingBag />
              <i>{cart.reduce((s, x) => s + x.quantity, 0)}</i>
            </Link>
          </div>
        </div>
        {menu && (
          <nav className="mobile-nav" onClick={() => setMenu(false)}>
            <Link href="/shop">Shop all</Link>
            <Link href="/shop?sort=new">New arrivals</Link>
            <Link href="/shop?category=clothing">Clothing</Link>
            <Link href="/shop?category=nursery">Nursery</Link>
            <Link href="/shop?category=gifts">Gifts & bundles</Link>
          </nav>
        )}
      </header>
    </>
  );
}
export function Footer() {
  return (
    <>
      <footer className="footer wrap">
        <div className="footer-grid">
          <div>
            <Logo />
            <p>
              Thoughtfully chosen for little ones.
              <br />
              Lovingly made for life’s big moments.
            </p>
            <FooterSocials />
          </div>
          <div>
            <h4>Find a little lovely</h4>
            <Link href="/shop">Shop all</Link>
            <Link href="/shop?sort=new">New arrivals</Link>
            <Link href="/shop?category=gifts">Gifts & bundles</Link>
            <Link href="/wishlist">Your wishlist</Link>
          </div>
          <div>
            <h4>Here to help</h4>
            <Link href="/info/delivery">Delivery & returns</Link>
            <Link href="/info/size-guide">Size guide</Link>
            <Link href="/info/contact">Contact us</Link>
            <Link href="/account">My account</Link>
          </div>
          <div>
            <h4>The AJ family</h4>
            <Link href="/info/about">Our little story</Link>
            <Link href="/info/care">Made with care</Link>
            <Link href="/admin">
              Admin dashboard <ArrowUpRight size={12} />
            </Link>
            <p>Based in Kenya. Made for love.</p>
          </div>
          <FooterContacts />
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} AJ Baby Shop. A little love in
            everything.
          </span>
          <div>
            <Link href="/info/privacy">Privacy policy</Link>
            <Link href="/info/terms">Terms & conditions</Link>
            <span>KES · Kenya</span>
          </div>
        </div>
      </footer>
    </>
  );
}
export function StoreShell({ children }: { children: React.ReactNode }) {
  const { error } = useShop();
  return (
    <>
      <Header />
      {error && (
        <div className="error-banner">
          We couldn’t load the shop: {error}. Check the Supabase configuration.
        </div>
      )}
      <main>{children}</main>
      <Footer />
    </>
  );
}
export function ProductCard({ product: p }: { product: Product }) {
  const { toggleWish, wishlist, addToCart } = useShop();
  return (
    <article className="product-card">
      <div className="product-image">
        <Link href={`/product/${p.slug}`}>
          <img src={p.image} alt={p.name} loading="lazy" />
        </Link>
        {p.badge && (
          <span
            className={`product-badge ${p.badge === "Bestseller" ? "pink" : ""}`}
          >
            {p.badge}
          </span>
        )}
        <button
          className={`wish-btn ${wishlist.includes(p.id) ? "selected" : ""}`}
          aria-label={`${wishlist.includes(p.id) ? "Remove" : "Save"} ${p.name} ${wishlist.includes(p.id) ? "from" : "to"} wishlist`}
          onClick={() => toggleWish(p.id)}
        >
          <Heart
            size={17}
            fill={wishlist.includes(p.id) ? "currentColor" : "none"}
          />
        </button>
        <button
          className="quick-add"
          type="button"
          aria-label={p.stock ? `Add ${p.name} to bag` : `${p.name} is sold out`}
          title={p.stock ? "Add to bag" : "Sold out"}
          disabled={!p.stock}
          onClick={() => addToCart(p)}
        >
          {p.stock ? "Add to bag" : "Sold out"}
          <span className="quick-add-plus" aria-hidden="true">
            <Plus size={16} />
          </span>
        </button>
      </div>
      <div className="product-meta">
        <span>
          {p.category === "clothing"
            ? "SOFT LITTLE ESSENTIALS"
            : p.category === "gifts"
              ? "A LITTLE SOMETHING SPECIAL"
              : "MADE FOR LITTLE MOMENTS"}
        </span>
        <span className="mini-rating">
          <Heart size={10} /> AJ pick
        </span>
      </div>
      <Link className="product-title" href={`/product/${p.slug}`}>
        {p.name}
      </Link>
      <div className="price">
        {money(p.price)}{" "}
        {p.compare_price && <del>{money(p.compare_price)}</del>}
      </div>
      <div className="swatches">
        <i style={{ background: "#ddbcac" }} />
        <i style={{ background: "#eee8db" }} />
        <i style={{ background: "#d9b9bc" }} />
        {p.sizes.length > 1 && <span>+{p.sizes.length} sizes</span>}
      </div>
    </article>
  );
}
export function Home() {
  const { products, categories } = useShop();
  const activeProducts = products.filter((p) => p.active);
  const featured = activeProducts.slice(0, 4);
  const moreProducts = activeProducts.slice(4);
  return (
    <StoreShell>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="tiny-line" /> FOR THEIR LITTLE WORLD
          </span>
          <h1>
            Little things.
            <br />
            <em>Endless love.</em>
          </h1>
          <p>
            Beautiful beginnings start with the little things. <br />
            Discover thoughtfully chosen essentials for your
            <br className="desktop-br" /> baby’s everyday magic.
          </p>
          <Link className="button primary" href="/shop">
            Explore the collection <ArrowRight size={17} />
          </Link>
          <div className="hero-proof">
            <div className="avatar-stack">
              {[
                "photo-1517841905240-472988babdf9",
                "photo-1438761681033-6461ffad8d80",
                "photo-1494790108377-be9c29b29330",
              ].map((id) => (
                <img key={id} src={photo(id, 80)} alt="" />
              ))}
            </div>
            <div>
              <div className="stars">★★★★★</div>
              <small>Little essentials. Lots of love.</small>
            </div>
          </div>
          <span className="hero-flower">✳</span>
        </div>
        <HeroSlider />
      </section>
      <div className="benefits">
        <div>
          <Truck />
          <span>
            Free delivery <small>On orders over KSh 5,000</small>
          </span>
        </div>
        <div>
          <Leaf />
          <span>
            Gentle on little ones{" "}
            <small>Soft, carefully selected materials</small>
          </span>
        </div>
        <div>
          <Gift />
          <span>
            Beautifully gift-ready{" "}
            <small>A little joy, perfectly wrapped</small>
          </span>
        </div>
        <div>
          <ShieldCheck />
          <span>
            Shop with confidence <small>Secure & easy shopping</small>
          </span>
        </div>
      </div>
      <section className="section wrap category-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">EVERY LITTLE NEED</span>
            <h2>
              Their world, <em>beautifully covered.</em>
            </h2>
          </div>
          <Link className="text-link" href="/shop">
            Discover all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="categories">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className="category-card"
            >
              <div style={{ background: c.color }}>
                <img src={c.image} alt={c.name} loading="lazy" />
              </div>
              <span>
                {c.name} <ArrowUpRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="section wrap featured-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LOVED BY LITTLE ONES</span>
            <h2>
              Small wonders. <em>Big favorites.</em>
            </h2>
          </div>
          <Link className="text-link" href="/shop">
            Shop the favorites <ArrowRight size={16} />
          </Link>
        </div>
        <div className="product-grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      {moreProducts.length > 0 && (
        <section
          className="section wrap more-products-section"
          aria-labelledby="more-products-title"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow">MORE LITTLE LOVELIES</span>
              <h2 id="more-products-title">
                A little more <em>to love.</em>
              </h2>
            </div>
            <Link className="text-link" href="/shop">
              Explore all products <ArrowRight size={16} />
            </Link>
          </div>
          <div className="product-grid">
            {moreProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
      <section className="section wrap love-section">
        <span className="eyebrow">THE LITTLE DETAILS THAT MATTER</span>
        <h2>
          A little more care. <em>A whole lot of love.</em>
        </h2>
        <div className="love-grid">
          <div>
            <Leaf />
            <h3>Soft by nature</h3>
            <p>
              Gentle textures and thoughtful materials for the most precious
              skin.
            </p>
          </div>
          <div>
            <Heart />
            <h3>Chosen with heart</h3>
            <p>
              Beautiful, practical pieces we’d choose for our own little ones.
            </p>
          </div>
          <div>
            <PackageCheck />
            <h3>Joy, delivered</h3>
            <p>
              Thoughtfully packed and ready for your family’s next little
              chapter.
            </p>
          </div>
        </div>
      </section>
    </StoreShell>
  );
}
export function Quantity({
  value,
  onChange,
  max = 99,
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
}) {
  return (
    <div className="quantity">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={13} />
      </button>
      <span>{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={13} />
      </button>
    </div>
  );
}
export function EmptyState({
  title,
  text,
  action = "Explore the collection",
  href = "/shop",
}: {
  title: string;
  text: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="empty-state">
      <Heart size={35} />
      <h2>{title}</h2>
      <p>{text}</p>
      <Link href={href} className="button primary">
        {action} <ArrowRight size={16} />
      </Link>
    </div>
  );
}
export function CheckLine({ children }: { children: React.ReactNode }) {
  return (
    <span className="check-line">
      <Check size={15} />
      {children}
    </span>
  );
}
