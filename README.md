# AJ Baby Shop

A responsive light pink baby shop built with Next.js App Router, React, TypeScript, Lucide icons, and Supabase. Prices use Kenyan shillings.

## Run locally

Requires Node 20.9+ (Node 22 LTS recommended).

```powershell
npm install
npm run dev
```

Open http://localhost:3000. `/admin` opens the admin dashboard. With no Supabase environment variables, choose **Explore demo dashboard**. Catalogue edits, coupons, wishlist, bag, and demo orders persist in this browser. Demo mode does not create real accounts, payments, emails, or deliveries. Clear browser local storage to reset it.

## Connect Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` once in a fresh project's SQL Editor.
3. Optionally run `supabase/seed.sql` for the sample catalogue. Demo data is not used as a fallback when a configured database fails.
4. Copy `.env.example` to `.env.local`, add the project URL and publishable API key (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`), and restart Next.js. Never put a service-role key in a `NEXT_PUBLIC_` variable.
5. In Supabase Authentication → URL Configuration, set your Site URL and allow `http://localhost:3000/account/reset` plus your deployed `/account/reset` URL. Configure email delivery/SMTP and email confirmation according to your project requirements.
6. Register your account through `/account`, confirm the email if required, and make it an admin from the SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'YOUR_ACTUAL_EMAIL';
```

7. Sign out and back in. Open `/admin`. Admins can create/edit/delete products and categories, upload images, manage stock and active/draft visibility, create/disable coupons, view orders, update fulfilment status, export orders to CSV, and change other users' roles. Customers can read only their own profile and orders.

## Checkout and security

Checkout is **cash on delivery**. There is no online payment gateway or fake payment confirmation. Live checkout requires a Supabase user. The `place_order` Postgres function checks products, active status, size options, quantities, stock, contact details and coupon codes; calculates prices from database records; locks inventory rows; and writes the order and inventory changes in a single transaction. The browser cannot write order amounts or line items. Orders retain product snapshots even when a product is deleted.

Delivery is KSh 350, free when merchandise subtotal is at least KSh 5,000 before coupons. `WELCOME10` is the seeded 10% coupon and is reusable. Adjust the UI and SQL function together when changing delivery rules. Inventory is product-wide, shared across sizes. Cancelling an order does not restore stock automatically; the admin must review and adjust inventory. Revenue on the dashboard counts delivered orders and is not payment reconciliation.

The legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` variable is also supported as a fallback.

Auth uses the browser Supabase client and its persisted session. UI admin checks are backed by row-level security, explicit table grants, and restricted SQL functions. Role changes go through `set_user_role`; users cannot promote themselves. No service credentials are required by this application.

## Before launch

- Replace illustrative Unsplash photos and sample catalogue with actual product assets, materials, care details and prices. Some demo photos are lifestyle placeholders.
- Fill in verified business contact information and review the delivery, returns, privacy, and terms pages under `app/info/[slug]/page.tsx`. The current policy copy explicitly marks missing business details.
- Add your public email, phone, WhatsApp number, address, opening hours, and Instagram/Facebook/TikTok links in `lib/store-details.ts`. These populate the footer and contact page; empty fields and unconfigured social links are hidden.
- Confirm delivery coverage and fulfilment processes. Connect a payment provider only if online payments are required; provider credentials and verified webhook handling are not configured here.
- Newsletter signup saves subscribers in the database; it does not send campaigns or a welcome email. Add your email provider and unsubscribe workflow before sending marketing.
- Set public environment variables on your deployment host before building. Deploy using a Next.js-capable host (`npm run build`, `npm start`).
- Add production monitoring, backups, and rate limiting/CAPTCHA for public newsletter and auth endpoints as appropriate for your traffic.

## Validation

```powershell
npm run typecheck
npm run build
npm run test:db
# With npm run dev running in another terminal, and Google Chrome installed:
npm run test:e2e
```

Database tests execute the SQL against an isolated PGlite Postgres instance with mock Supabase auth/storage schemas. They cover RLS, role escalation, order ownership, checkout validation, coupon totals, stock deduction, and deleted-product order snapshots. Browser tests exercise the demo checkout, admin CRUD, and mobile navigation; they do not verify a live Supabase project's auth, storage service, or email configuration.

`package-lock.json` pins dependency versions. `supabase/schema.sql` is a fresh-project setup, not an idempotent upgrade migration. `node scripts/generate-seed.cjs` regenerates the seed from `lib/data.ts`. `node scripts/capture-preview.mjs` captures desktop/mobile previews from a running local server into `artifacts/`.
