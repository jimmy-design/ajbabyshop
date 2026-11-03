"use client";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useShop } from "@/components/shop-provider";
import { StoreShell, ProductCard, EmptyState } from "@/components/storefront";
function Catalogue() {
  const params = useSearchParams();
  const { products, categories, ready } = useShop();
  const [query, setQuery] = useState(params.get("search") || ""),
    [category, setCategory] = useState(params.get("category") || "all"),
    [sort, setSort] = useState(params.get("sort") || "featured"),
    [inStock, setInStock] = useState(false);
  useEffect(() => {
    setQuery(params.get("search") || "");
    setCategory(params.get("category") || "all");
    setSort(params.get("sort") || "featured");
  }, [params]);
  let filtered = products.filter(
    (p) =>
      p.active &&
      (category === "all" || p.category === category) &&
      (!inStock || p.stock > 0) &&
      (p.name + " " + p.description)
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  filtered = [...filtered].sort((a, b) =>
    sort === "price-low"
      ? a.price - b.price
      : sort === "price-high"
        ? b.price - a.price
        : sort === "name"
          ? a.name.localeCompare(b.name)
          : sort === "new"
            ? a.created_at && b.created_at
              ? Date.parse(b.created_at) - Date.parse(a.created_at)
              : products.indexOf(b) - products.indexOf(a)
            : 0,
  );
  return (
    <StoreShell>
      <div className="wrap">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / The collection
        </div>
      </div>
      <div className="catalogue wrap">
        <aside className="filter-sidebar">
          <h3>
            <SlidersHorizontal size={17} /> Filter & discover
          </h3>
          <h4>Shop by category</h4>
          <button
            className={category === "all" ? "filter-active" : ""}
            onClick={() => setCategory("all")}
          >
            All little lovelies{" "}
            <span>{products.filter((p) => p.active).length}</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.slug)}
              className={category === c.slug ? "filter-active" : ""}
            >
              {c.name}
              <span>
                {
                  products.filter((p) => p.active && p.category === c.slug)
                    .length
                }
              </span>
            </button>
          ))}
          <hr />
          <h4>Availability</h4>
          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
            />{" "}
            In stock only
          </label>
          <div className="filter-note">
            A little gift from us ♡
            <p>Use WELCOME10 for 10% off your first order.</p>
          </div>
        </aside>
        <div className="catalogue-main">
          <div className="catalogue-toolbar">
            <div className="search-field">
              <Search size={17} />
              <input
                aria-label="Search collection"
                placeholder="Find a little lovely…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  className="icon-btn"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="new">Newest arrivals</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="name">Name: A–Z</option>
            </select>
          </div>
          <p className="result-count">
            {ready
              ? `${filtered.length} little lovelies to discover`
              : "Loading the collection…"}
          </p>
          {filtered.length ? (
            <div className="product-grid catalogue-grid">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : ready ? (
            <EmptyState
              title="No little lovelies here yet"
              text="Try another category or a different search."
            />
          ) : null}
        </div>
      </div>
    </StoreShell>
  );
}
export default function Shop() {
  return (
    <Suspense fallback={<div className="loading">Opening the collection…</div>}>
      <Catalogue />
    </Suspense>
  );
}
