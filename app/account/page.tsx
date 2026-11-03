"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Package, LogOut, LayoutDashboard } from "lucide-react";
import { useShop } from "@/components/shop-provider";
import { StoreShell, EmptyState } from "@/components/storefront";
import { supabase } from "@/lib/supabase";
import { money } from "@/lib/data";
export default function Account() {
  const { user, signIn, signOut, orders, demo, notify } = useShop();
  const [signup, setSignup] = useState(false),
    [reset, setReset] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [newPassword, setNewPassword] = useState(false);
  return (
    <StoreShell>
      <div className="wrap" style={{ paddingTop: 32 }}>
        {user ? (
          <section className="account-content">
            <div className="account-bar">
              <div>
                <strong>{user.name}</strong>
                <p>{user.email}</p>
              </div>
              <div>
                {user.role === "admin" && (
                  <Link className="button secondary" href="/admin">
                    <LayoutDashboard size={16} /> Admin panel
                  </Link>
                )}
                <button
                  className="button secondary"
                  onClick={() => {
                    signOut().catch((e) => notify(e.message));
                  }}
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            </div>
            <h2>Your orders</h2>
            {orders.filter((o) => o.user_id === user.id).length ? (
              orders
                .filter((o) => o.user_id === user.id)
                .map((o) => (
                  <details className="account-order" key={o.id}>
                    <summary>
                      <span>
                        <Package size={18} /> #{o.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span>
                        {new Date(o.created_at).toLocaleDateString("en-KE")}
                      </span>
                      <span className={`status status-${o.status}`}>
                        {o.status}
                      </span>
                      <strong>{money(o.total)}</strong>
                    </summary>
                    <div className="order-detail">
                      <p>
                        Deliver to: {o.address}, {o.city}
                      </p>
                      {o.items.map((i, n) => (
                        <div key={n}>
                          {i.name} · {i.size} × {i.quantity}
                          <strong>{money(i.price * i.quantity)}</strong>
                        </div>
                      ))}
                      <p>Payment: cash on delivery</p>
                    </div>
                  </details>
                ))
            ) : (
              <EmptyState
                title="Your story starts here"
                text="Your orders will appear here after your first little shopping adventure."
              />
            )}
            {!demo && (
              <button
                className="text-link"
                onClick={() => setNewPassword(!newPassword)}
              >
                Change password
              </button>
            )}
            {newPassword && (
              <form
                className="auth-card"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  const { error } = await supabase!.auth.updateUser({
                    password: String(f.get("password")),
                  });
                  if (error) notify(error.message);
                  else {
                    notify("Password updated");
                    setNewPassword(false);
                  }
                }}
              >
                <label>
                  New password
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </label>
                <button className="button primary">Save new password</button>
              </form>
            )}
          </section>
        ) : (
          <div className="auth-layout">
            <div className="auth-art">
              <span>♡</span>
              <h2>
                A softer start.
                <br />
                <em>A little more love.</em>
              </h2>
              <p>Your next chapter begins with the little things.</p>
            </div>
            <form
              className="auth-card"
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setError("");
                const f = new FormData(e.currentTarget);
                try {
                  if (reset) {
                    if (!supabase)
                      throw new Error(
                        "Connect Supabase to reset your password.",
                      );
                    const { error } = await supabase.auth.resetPasswordForEmail(
                      String(f.get("email")),
                      { redirectTo: `${window.location.origin}/account/reset` },
                    );
                    if (error) throw error;
                    notify("Check your email for a password reset link.");
                  } else
                    await signIn(
                      String(f.get("email")),
                      String(f.get("password")),
                      signup ? String(f.get("name")) : undefined,
                    );
                } catch (err) {
                  setError((err as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <span className="eyebrow">THE AJ FAMILY</span>
              <h2>
                {reset
                  ? "A fresh little start"
                  : signup
                    ? "Join our little circle"
                    : "Lovely to see you again"}
              </h2>
              <p>
                {reset
                  ? "We’ll email you a link to reset your password."
                  : signup
                    ? "Create an account for your little world."
                    : "Sign in to your account to keep the love going."}
              </p>
              {demo && (
                <div className="notice">
                  Account sign-in becomes available once Supabase is connected.{" "}
                  <Link href="/admin">Explore the demo admin</Link>.
                </div>
              )}
              {signup && !reset && (
                <label>
                  Your name
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                  />
                </label>
              )}
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </label>
              {!reset && (
                <label>
                  Password
                  <input
                    name="password"
                    type="password"
                    autoComplete={signup ? "new-password" : "current-password"}
                    required
                    minLength={8}
                  />
                </label>
              )}
              {error && (
                <div className="form-error" role="alert">
                  {error}
                </div>
              )}
              <button className="button primary" disabled={busy}>
                {busy
                  ? "One little moment…"
                  : reset
                    ? "Send reset link"
                    : signup
                      ? "Create your account"
                      : "Sign in"}{" "}
                <ArrowRight size={16} />
              </button>
              {!signup && (
                <button
                  type="button"
                  className="text-link"
                  onClick={() => {
                    setReset(!reset);
                    setError("");
                  }}
                >
                  {reset ? "Back to sign in" : "Forgot your password?"}
                </button>
              )}
              <div className="auth-switch">
                {signup
                  ? "Already part of the family?"
                  : "New to our little world?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setSignup(!signup);
                    setReset(false);
                    setError("");
                  }}
                >
                  {signup ? "Sign in" : "Create an account"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </StoreShell>
  );
}
