"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Trash2,
  Truck,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";
import { useShop } from "@/components/shop-provider";
import { StoreShell, Quantity, EmptyState } from "@/components/storefront";
import { money, type Order } from "@/lib/data";
export default function Cart() {
  const { cart, products, setQuantity, placeOrder, user, demo } = useShop();
  const [checkout, setCheckout] = useState(false),
    [coupon, setCoupon] = useState(""),
    [placed, setPlaced] = useState<Order | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const subtotal = cart.reduce(
      (s, i) =>
        s +
        (products.find((p) => p.id === i.product_id)?.price || 0) * i.quantity,
      0,
    ),
    shipping = subtotal >= 5000 ? 0 : 350;
  return (
    <StoreShell>
      <div className="wrap">
        <section className="page-title">
          <span className="eyebrow">A BAG FULL OF LITTLE JOYS</span>
          <h1>
            {placed
              ? "A little joy is on its way"
              : checkout
                ? "The finishing touches"
                : "Your shopping bag"}
            <span className="pink-period">.</span>
          </h1>
          <p>
            {placed
              ? "Thank you for letting us be part of your little world."
              : "Carefully chosen by you. Lovingly packed by us."}
          </p>
        </section>
        {placed ? (
          <div className="order-success">
            <CheckCircle2 size={50} />
            <h2>
              {demo ? "Your demo order is ready" : "Thank you for your order!"}
            </h2>
            <p>
              Order #{placed.id.slice(0, 8).toUpperCase()} ·{" "}
              <span className="currency-amount">{money(placed.total)}</span>
            </p>
            <p>
              {demo
                ? "This is a demonstration. No real order, payment, or delivery was initiated."
                : "Payment is due on delivery. Track progress in your account."}
            </p>
            <Link href="/account" className="button primary">
              View your orders <ArrowRight size={16} />
            </Link>
            <Link href="/shop" className="text-link">
              Keep exploring
            </Link>
          </div>
        ) : !cart.length ? (
          <EmptyState
            title="A little room for lovely things"
            text="Your bag is waiting for its first little treasure."
          />
        ) : (
          <div className="cart-layout">
            <div>
              {demo && (
                <div className="demo-banner">
                  You’re exploring demo mode. Orders and changes stay in this
                  browser.
                </div>
              )}
              {!checkout ? (
                <>
                  <div className="shipping-progress">
                    <Truck size={20} />
                    <div>
                      {subtotal >= 5000 ? (
                        "Lovely! You’ve unlocked free delivery."
                      ) : (
                        <>
                          You’re{" "}
                          <b>
                            <span className="currency-amount">
                              {money(5000 - subtotal)}
                            </span>
                          </b>{" "}
                          away from free delivery.
                        </>
                      )}
                      <div className="progress-track">
                        <span
                          style={{
                            width: `${Math.min((subtotal / 5000) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  {cart.map((i) => {
                    const p = products.find((p) => p.id === i.product_id);
                    return (
                      <div className="cart-item" key={i.product_id + i.size}>
                        {p ? (
                          <>
                            <Link href={`/product/${p.slug}`}>
                              <img src={p.image} alt={p.name} />
                            </Link>
                            <div className="cart-item-info">
                              <Link href={`/product/${p.slug}`}>{p.name}</Link>
                              <small>{i.size}</small>
                              <span>
                                <span className="currency-amount">
                                  {money(p.price)}
                                </span>
                              </span>
                              <Quantity
                                value={i.quantity}
                                max={p.stock}
                                onChange={(n) => setQuantity(p.id, i.size, n)}
                              />
                            </div>
                            <div className="cart-item-end">
                              <strong>
                                <span className="currency-amount">
                                  {money(p.price * i.quantity)}
                                </span>
                              </strong>
                              <button
                                className="icon-btn"
                                aria-label={`Remove ${p.name}`}
                                onClick={() => setQuantity(p.id, i.size, 0)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p>Item no longer available</p>
                            <button
                              onClick={() =>
                                setQuantity(i.product_id, i.size, 0)
                              }
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                  <Link href="/shop" className="text-link">
                    Continue discovering <ArrowRight size={15} />
                  </Link>
                </>
              ) : (
                <form
                  id="checkout-form"
                  className="checkout-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setError("");
                    setBusy(true);
                    const f = new FormData(e.currentTarget);
                    try {
                      setPlaced(
                        await placeOrder({
                          customer_name: String(f.get("name")),
                          email: String(f.get("email")),
                          phone: String(f.get("phone")),
                          address: String(f.get("address")),
                          city: String(f.get("city")),
                          coupon,
                        }),
                      );
                    } catch (err) {
                      setError((err as Error).message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <h2>Where shall we send the love?</h2>
                  {!user && !demo && (
                    <div className="notice">
                      Please{" "}
                      <Link href="/account?next=/cart">
                        sign in or create an account
                      </Link>{" "}
                      to place your order.
                    </div>
                  )}
                  <div className="form-grid">
                    <label>
                      Full name
                      <input
                        name="name"
                        autoComplete="name"
                        required
                        minLength={2}
                        maxLength={100}
                        defaultValue={user?.name}
                      />
                    </label>
                    <label>
                      Email address
                      <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        defaultValue={user?.email}
                      />
                    </label>
                    <label>
                      Phone number
                      <input
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        required
                        minLength={9}
                        maxLength={25}
                        placeholder="07XX XXX XXX"
                      />
                    </label>
                    <label>
                      City / town
                      <input
                        name="city"
                        autoComplete="address-level2"
                        required
                        placeholder="e.g. Nairobi"
                        maxLength={100}
                      />
                    </label>
                    <label className="span-2">
                      Delivery address
                      <textarea
                        name="address"
                        autoComplete="street-address"
                        required
                        minLength={8}
                        maxLength={500}
                        placeholder="Street, building, house number, and any helpful directions"
                      />
                    </label>
                  </div>
                  <h3>Payment method</h3>
                  <div className="payment-option">
                    <input
                      type="radio"
                      checked
                      readOnly
                      aria-label="Cash on delivery"
                    />
                    <div>
                      <strong>Cash on delivery</strong>
                      <p>
                        Pay when your little lovelies arrive. No payment is
                        taken online.
                      </p>
                    </div>
                  </div>
                  <label className="checkbox-line">
                    <input type="checkbox" required /> I agree to the{" "}
                    <Link href="/info/terms">terms & conditions</Link> and
                    delivery policy.
                  </label>
                  {error && (
                    <div role="alert" className="form-error">
                      {error}
                    </div>
                  )}
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => setCheckout(false)}
                  >
                    ← Back to your bag
                  </button>
                </form>
              )}
            </div>
            <aside className="order-summary">
              <span className="eyebrow">ALL THE LITTLE DETAILS</span>
              <h2>Order summary</h2>
              <div>
                <span>
                  Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)
                </span>
                <strong>
                  <span className="currency-amount">{money(subtotal)}</span>
                </strong>
              </div>
              <div>
                <span>Delivery</span>
                <strong>{shipping ? money(shipping) : "On us ♡"}</strong>
              </div>
              <label className="coupon-label">
                Have a little gift code?
                <input
                  placeholder="e.g. WELCOME10"
                  value={coupon}
                  maxLength={40}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                />
              </label>
              {coupon && (
                <p className="muted">
                  Your code is validated and any discount applied when the order
                  is placed.
                </p>
              )}
              <div className="summary-total">
                <span>Total before discount</span>
                <strong>
                  <span className="currency-amount">
                    {money(subtotal + shipping)}
                  </span>
                </strong>
              </div>
              {checkout ? (
                <button
                  disabled={busy || (!user && !demo)}
                  className="button primary"
                  form="checkout-form"
                >
                  {busy
                    ? "Placing your order…"
                    : demo
                      ? "Place demo order"
                      : "Place order · Pay on delivery"}{" "}
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setCheckout(true)}
                  className="button primary"
                >
                  Continue to checkout <ArrowRight size={16} />
                </button>
              )}
              <small className="secure-note">
                <LockKeyhole size={13} />{" "}
                {demo
                  ? "Demo checkout · No payment taken"
                  : "Secure checkout · Pay on delivery"}
              </small>
            </aside>
          </div>
        )}
      </div>
    </StoreShell>
  );
}
