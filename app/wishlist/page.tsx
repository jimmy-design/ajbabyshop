"use client";
import { useShop } from "@/components/shop-provider";
import { StoreShell, ProductCard, EmptyState } from "@/components/storefront";
export default function Wishlist() {
  const { wishlist, products } = useShop();
  const saved = products.filter((p) => wishlist.includes(p.id) && p.active);
  return (
    <StoreShell>
      <div className="wrap">
        <section className="page-title">
          <span className="eyebrow">KEEP A LITTLE LOVE FOR LATER</span>
          <h1>
            Your little wishlist<span className="pink-period">.</span>
          </h1>
          <p>All the things you’ve fallen a little in love with.</p>
        </section>
        {saved.length ? (
          <div className="product-grid section">
            {saved.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Love at first little sight"
            text="Tap the heart on anything you love. We’ll keep it right here."
          />
        )}
      </div>
    </StoreShell>
  );
}
