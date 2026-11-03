"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { StoreShell } from "@/components/storefront";
export default function Reset() {
  const [message, setMessage] = useState(""),
    [done, setDone] = useState(false),
    [ready, setReady] = useState(false);
  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => setReady(!!data.session));
    const sub = supabase?.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => sub?.data.subscription.unsubscribe();
  }, []);
  return (
    <StoreShell>
      <form
        className="auth-card reset-card"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!supabase) return;
          const f = new FormData(e.currentTarget);
          const { error } = await supabase.auth.updateUser({
            password: String(f.get("password")),
          });
          setMessage(error ? error.message : "Your password has been updated.");
          if (!error) setDone(true);
        }}
      >
        <h2>A fresh little start</h2>
        {done ? (
          <Link href="/account" className="button primary">
            Return to your account
          </Link>
        ) : ready ? (
          <>
            <label>
              New password
              <input
                required
                name="password"
                minLength={8}
                type="password"
                autoComplete="new-password"
              />
            </label>
            <button className="button primary">Update password</button>
          </>
        ) : (
          <p>Open the password reset link from your email to continue.</p>
        )}
        {message && <p role="status">{message}</p>}
      </form>
    </StoreShell>
  );
}
