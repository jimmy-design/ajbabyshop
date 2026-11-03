import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const db = new PGlite();
await db.exec(`create role anon; create role authenticated;
create schema auth; create schema storage;
create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth,public to anon,authenticated;
grant execute on function auth.uid() to anon,authenticated;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text);
alter table storage.objects enable row level security;`);
await db.exec(
  readFileSync("supabase/schema.sql", "utf8").replace(
    "create extension if not exists pgcrypto;",
    "",
  ),
);
await db.exec(readFileSync("supabase/seed.sql", "utf8"));
const customer = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  admin = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  other = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
for (const [id, name] of [
  [customer, "Customer"],
  [admin, "Admin"],
  [other, "Other"],
])
  await db.query(
    "insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3)",
    [
      id,
      `${name.toLowerCase()}@example.com`,
      JSON.stringify({ name, role: "admin" }),
    ],
  );
assert.equal(
  (await db.query("select role from profiles where id=$1", [customer])).rows[0]
    .role,
  "customer",
  "Signup metadata must not grant admin",
);
await db.query("update profiles set role='admin' where id=$1", [admin]);
async function as(role, id = "") {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
  await db.exec(`set role ${role}`);
}
async function rejects(sql, args = [], pattern) {
  await assert.rejects(db.query(sql, args), pattern);
}
const cart = [
  {
    product_id: "11111111-1111-4111-8111-111111111111",
    size: "0–3 months",
    quantity: 2,
  },
];
const details = {
  customer_name: "Test Customer",
  email: "customer@example.com",
  phone: "0712345678",
  address: "Test street, House 10",
  city: "Nairobi",
};
const place = "select public.place_order($1::jsonb,$2::jsonb,$3) as result";
await as("anon");
assert.equal((await db.query("select * from products")).rows.length, 8);
await rejects("select * from profiles", [], /permission denied/);
await rejects(
  place,
  [JSON.stringify(cart), JSON.stringify(details), null],
  /permission denied/,
);
await as("authenticated", customer);
assert.equal((await db.query("select * from profiles")).rows.length, 1);
await rejects(
  "update profiles set role='admin' where id=$1",
  [customer],
  /permission denied/,
);
await rejects(
  "select set_user_role($1,$2)",
  [customer, "admin"],
  /Admin access required/,
);
await rejects(
  "insert into products(name,slug,category,price,image,stock) values('Bad','bad','clothing',1,'https://example.com/a.jpg',1)",
  [],
  /row-level security/,
);
await rejects(
  place,
  [
    JSON.stringify([{ ...cart[0], quantity: 99 }]),
    JSON.stringify(details),
    null,
  ],
  /Insufficient stock/,
);
await rejects(
  place,
  [
    JSON.stringify([{ ...cart[0], size: "fake" }]),
    JSON.stringify(details),
    null,
  ],
  /Invalid option/,
);
await rejects(
  place,
  [JSON.stringify(cart), JSON.stringify(details), "FAKE"],
  /invalid or inactive/,
);
await rejects(
  place,
  [
    JSON.stringify([{ ...cart[0], quantity: 0 }]),
    JSON.stringify(details),
    null,
  ],
  /Invalid item/,
);
await rejects(
  place,
  [JSON.stringify(cart), JSON.stringify({ ...details, address: "x" }), null],
  /valid contact/,
);
const order = (
  await db.query(place, [
    JSON.stringify(cart),
    JSON.stringify(details),
    "WELCOME10",
  ])
).rows[0].result;
assert.equal(order.total, 5040);
assert.equal(order.shipping, 0);
assert.equal(order.discount, 560);
assert.equal(order.items[0].price, 2800);
assert.equal(
  (
    await db.query("select stock from products where id=$1", [
      cart[0].product_id,
    ])
  ).rows[0].stock,
  22,
);
await rejects(
  "update orders set total=1 where id=$1",
  [order.id],
  /permission denied/,
);
await rejects(
  "insert into order_items(order_id,name,size,quantity,price,image) values($1,'Bad','One size',1,1,'x')",
  [order.id],
  /permission denied/,
);
const update = await db.query(
  "update orders set status='delivered' where id=$1 returning id",
  [order.id],
);
assert.equal(update.rows.length, 0, "Customer cannot update fulfilment");
assert.equal((await db.query("select * from orders")).rows.length, 1);
await as("authenticated", other);
assert.equal((await db.query("select * from orders")).rows.length, 0);
assert.equal((await db.query("select * from order_items")).rows.length, 0);
await as("authenticated", admin);
assert.equal((await db.query("select * from profiles")).rows.length, 3);
assert.equal((await db.query("select * from orders")).rows.length, 1);
await db.query("update orders set status='delivered' where id=$1", [order.id]);
await rejects("select set_user_role($1,$2)", [admin, "customer"], /own role/);
await db.query("select set_user_role($1,$2)", [other, "admin"]);
assert.equal(
  (await db.query("select role from profiles where id=$1", [other])).rows[0]
    .role,
  "admin",
);
await db.query("delete from products where id=$1", [cart[0].product_id]);
assert.equal(
  (
    await db.query(
      "select name,product_id from order_items where order_id=$1",
      [order.id],
    )
  ).rows[0].product_id,
  null,
  "Deleted products retain order snapshots",
);
await as("anon");
await db.query("select subscribe_newsletter($1)", ["hello@example.com"]);
await db.query("select subscribe_newsletter($1)", ["hello@example.com"]);
await rejects("select * from newsletter_subscribers", [], /permission denied/);
await as("authenticated", admin);
assert.equal(
  (await db.query("select * from newsletter_subscribers")).rows.length,
  1,
);
await db.close();
console.log(
  "Database checks passed: schema, seed, roles, RLS, secure checkout, validation, discounts, inventory, snapshots and newsletter.",
);
