"use client";
import { use, useState } from "react";
import Link from "next/link";
import { Heart, ArrowRight, Truck, ShieldCheck, Star } from "lucide-react";
import { useShop } from "@/components/shop-provider";
import {
  StoreShell,
  Quantity,
  ProductCard,
  EmptyState,
  CheckLine,
} from "@/components/storefront";
import { money } from "@/lib/data";
export default function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { products, ready, addToCart, wishlist, toggleWish } = useShop();
  const p = products.find((p) => p.slug === slug && p.active);
  const [size, setSize] = useState(""),
    [quantity, setQuantity] = useState(1);
  if (!p)
    return (
      <StoreShell>
        {ready ? (
          <EmptyState
            title="This little lovely has wandered off"
            text="Discover something else in our collection."
          />
        ) : (
          <div className="loading">Finding your little lovely…</div>
        )}
      </StoreShell>
    );
  return (
    <StoreShell>
      <div className="wrap">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / <Link href="/shop">The collection</Link>{" "}
          / {p.name}
        </div>
        <section className="product-detail">
          <div className="detail-image">
            <img src={p.image} alt={p.name} />
            {p.badge && <span className="product-badge pink">{p.badge}</span>}
          </div>
          <div className="detail-copy">
            <span className="eyebrow">A LITTLE EVERYDAY MAGIC</span>
            <div className="detail-rating">
              <span className="stars">★★★★★</span> Thoughtfully chosen with love
            </div>
            <h1>{p.name}</h1>
            <div className="price detail-price">
              {money(p.price)}{" "}
              {p.compare_price && <del>{money(p.compare_price)}</del>}
            </div>
            <p>{p.description}</p>
            <div className="stock-status">
              <span style={{ background: p.stock ? "#849b7d" : "#bb6e77" }} />
              {p.stock
                ? `In stock · ${p.stock} little lovelies available`
                : "Currently sold out"}
            </div>
            <label className="field-label">
              {p.category === "clothing" ? "Choose a size" : "Choose an option"}
            </label>
            <div className="size-options">
              {p.sizes.map((s) => (
                <button
                  key={s}
                  className={(size || p.sizes[0]) === s ? "active" : ""}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            {p.category === "clothing" && (
              <Link href="/info/size-guide" className="size-guide">
                Need a hand? View our size guide <ArrowRight size={12} />
              </Link>
            )}
            <div className="detail-add">
              <Quantity value={quantity} onChange={setQuantity} max={p.stock} />
              <button
                className="button primary"
                disabled={!p.stock}
                onClick={() => addToCart(p, size || p.sizes[0], quantity)}
              >
                Add to bag <ArrowRight size={17} />
              </button>
              <button
                className="outline-icon"
                aria-label="Toggle wishlist"
                onClick={() => toggleWish(p.id)}
              >
                <Heart
                  fill={wishlist.includes(p.id) ? "currentColor" : "none"}
                  size={20}
                />
              </button>
            </div>
            <div className="detail-promises">
              <CheckLine>Carefully selected for your little one</CheckLine>
              <CheckLine>Beautifully packed with love</CheckLine>
              <span>
                <Truck size={15} /> Free delivery over KSh 5,000
              </span>
            </div>
            <details open>
              <summary>The little details</summary>
              <p>
                {p.description} Please follow the care label included with your
                item.
              </p>
            </details>
            <details>
              <summary>Delivery & returns</summary>
              <p>
                Standard delivery is KSh 350, or free for orders of KSh 5,000
                and above. Please contact us before returning an item.{" "}
                <Link href="/info/delivery">Read our delivery policy.</Link>
              </p>
            </details>
          </div>
        </section>
        <section className="section">
          <div className="section-heading">
            <h2>
              A little more <em>to love.</em>
            </h2>
            <Link href="/shop" className="text-link">
              See everything <ArrowRight size={15} />
            </Link>
          </div>
          <div className="product-grid">
            {products
              .filter((x) => x.id !== p.id && x.active)
              .slice(0, 4)
              .map((x) => (
                <ProductCard key={x.id} product={x} />
              ))}
          </div>
        </section>
      </div>
    </StoreShell>
  );
}
