-- Run once in the Supabase SQL Editor on a new project.
-- Money is stored as whole Kenyan shillings. No service-role key is used in the app.
begin;
create extension if not exists pgcrypto;

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 name text not null check (length(name) between 1 and 100),
 email text not null,
 role text not null default 'customer' check (role in ('customer','admin')),
 created_at timestamptz not null default now()
);
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public
as $$ begin
 insert into public.profiles(id,name,email) values(new.id, left(coalesce(nullif(new.raw_user_meta_data->>'name',''),split_part(new.email,'@',1),'Customer'),100),new.email);
 return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create table public.categories (
 id text primary key,
 name text not null check(length(name) between 1 and 100),
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 image text not null check(image ~ '^https?://'),
 color text not null default '#f5e7eb' check(color ~ '^#[0-9a-fA-F]{6}$')
);
create table public.products (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(name) between 1 and 200),
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 category text not null references public.categories(slug) on update cascade on delete restrict,
 price integer not null check(price > 0 and price <= 10000000),
 compare_price integer check(compare_price > 0 and compare_price <= 10000000),
 image text not null check(image ~ '^https?://'),
 description text not null default '',
 stock integer not null default 0 check(stock >= 0 and stock <= 1000000),
 badge text not null default '',
 sizes text[] not null default array['One size'] check(cardinality(sizes) between 1 and 50),
 active boolean not null default true,
 created_at timestamptz not null default now()
);
create table public.coupons (
 id text primary key,
 code text not null unique check(code = upper(code) and code ~ '^[A-Z0-9_-]{1,40}$'),
 percent integer not null check(percent between 1 and 90),
 active boolean not null default true
);
create table public.orders (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id),
 customer_name text not null,
 email text not null,
 phone text not null,
 address text not null,
 city text not null,
 total integer not null check(total >= 0),
 shipping integer not null check(shipping >= 0),
 discount integer not null default 0 check(discount >= 0),
 status text not null default 'pending' check(status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
 payment_method text not null default 'cash_on_delivery' check(payment_method='cash_on_delivery'),
 created_at timestamptz not null default now()
);
create table public.order_items (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id) on delete cascade,
 product_id uuid references public.products(id) on delete set null,
 name text not null,
 size text not null,
 quantity integer not null check(quantity between 1 and 99),
 price integer not null check(price > 0),
 image text not null
);
create table public.newsletter_subscribers (
 email text primary key check(length(email) <= 254),
 created_at timestamptz not null default now()
);
create index products_category_idx on public.products(category);
create index orders_user_idx on public.orders(user_id);
create index order_items_order_idx on public.order_items(order_id);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.newsletter_subscribers enable row level security;

create policy profiles_read on public.profiles for select to authenticated using(id = auth.uid() or public.is_admin());
create policy categories_read on public.categories for select using(true);
create policy categories_manage on public.categories for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy products_read on public.products for select using(active or public.is_admin());
create policy products_manage on public.products for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy coupons_manage on public.coupons for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy orders_read on public.orders for select to authenticated using(user_id = auth.uid() or public.is_admin());
create policy orders_status on public.orders for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy order_items_read on public.order_items for select to authenticated using(exists(select 1 from public.orders where orders.id=order_id and (orders.user_id=auth.uid() or public.is_admin())));
create policy newsletter_admin_read on public.newsletter_subscribers for select to authenticated using(public.is_admin());

-- Explicit table grants prevent clients from writing order totals or escalating roles.
revoke all on public.profiles,public.categories,public.products,public.coupons,public.orders,public.order_items,public.newsletter_subscribers from anon,authenticated;
grant select on public.categories,public.products to anon,authenticated;
grant insert,update,delete on public.categories,public.products,public.coupons to authenticated;
grant select on public.profiles,public.coupons,public.orders,public.order_items,public.newsletter_subscribers to authenticated;
grant update(status) on public.orders to authenticated;

create or replace function public.set_user_role(target_user uuid,new_role text) returns void
language plpgsql security definer set search_path = public as $$
begin
 if not public.is_admin() then raise exception 'Admin access required'; end if;
 if target_user = auth.uid() then raise exception 'Cannot change your own role'; end if;
 if new_role not in ('customer','admin') then raise exception 'Invalid role'; end if;
 update public.profiles set role=new_role where id=target_user;
 if not found then raise exception 'User not found'; end if;
end; $$;

create or replace function public.place_order(cart_items jsonb,shipping_details jsonb,coupon_code text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
 line record; prod public.products%rowtype; order_row public.orders%rowtype;
 subtotal bigint := 0; discount_amount integer := 0; shipping_amount integer := 350; coupon_percent integer := 0;
 total_quantity integer; result jsonb;
begin
 if auth.uid() is null then raise exception 'Please sign in before checking out'; end if;
 if jsonb_typeof(cart_items) is distinct from 'array' then raise exception 'Invalid shopping bag'; end if;
 if jsonb_array_length(cart_items) not between 1 and 50 then raise exception 'Your bag must contain between 1 and 50 lines'; end if;
 if coalesce(length(trim(shipping_details->>'customer_name')),0) not between 2 and 100
 or coalesce(length(trim(shipping_details->>'phone')),0) not between 9 and 25
 or coalesce(length(trim(shipping_details->>'address')),0) not between 8 and 500
 or coalesce(length(trim(shipping_details->>'city')),0) not between 1 and 100
 or coalesce(shipping_details->>'email','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
 or length(shipping_details->>'email') > 254 then raise exception 'Please enter valid contact and delivery details'; end if;
 if exists(select 1 from jsonb_to_recordset(cart_items) as x(product_id uuid,size text,quantity integer)
 where x.product_id is null or x.size is null or x.quantity is null or x.quantity not between 1 and 99)
 then raise exception 'Invalid item or quantity'; end if;
 -- Lock in UUID order to avoid overselling and deadlocks during simultaneous checkouts.
 for line in select x.product_id,sum(x.quantity)::integer as qty from jsonb_to_recordset(cart_items) as x(product_id uuid,size text,quantity integer) group by x.product_id order by x.product_id
 loop
  select * into prod from public.products where id=line.product_id for update;
  if not found or not prod.active then raise exception 'A product is no longer available'; end if;
  if line.qty > prod.stock or line.qty > 99 then raise exception 'Insufficient stock for %',prod.name; end if;
  if exists(select 1 from jsonb_to_recordset(cart_items) as x(product_id uuid,size text,quantity integer) where x.product_id=prod.id and not (x.size = any(prod.sizes))) then raise exception 'Invalid option for %',prod.name; end if;
  subtotal := subtotal + prod.price::bigint * line.qty;
 end loop;
 if subtotal > 100000000 then raise exception 'Order exceeds the maximum checkout amount'; end if;
 if nullif(trim(coupon_code),'') is not null then
  select percent into coupon_percent from public.coupons where code=upper(trim(coupon_code)) and active for share;
  if not found then raise exception 'This coupon is invalid or inactive'; end if;
  discount_amount := round(subtotal * coupon_percent / 100.0)::integer;
 end if;
 if subtotal >= 5000 then shipping_amount := 0; end if;
 insert into public.orders(user_id,customer_name,email,phone,address,city,total,shipping,discount)
 values(auth.uid(),trim(shipping_details->>'customer_name'),trim(shipping_details->>'email'),trim(shipping_details->>'phone'),trim(shipping_details->>'address'),trim(shipping_details->>'city'),subtotal-discount_amount+shipping_amount,shipping_amount,discount_amount) returning * into order_row;
 for line in select x.product_id,x.size,sum(x.quantity)::integer as qty from jsonb_to_recordset(cart_items) as x(product_id uuid,size text,quantity integer) group by x.product_id,x.size
 loop
  select * into prod from public.products where id=line.product_id;
  insert into public.order_items(order_id,product_id,name,size,quantity,price,image) values(order_row.id,prod.id,prod.name,line.size,line.qty,prod.price,prod.image);
  update public.products set stock=stock-line.qty where id=prod.id;
 end loop;
 select to_jsonb(order_row) || jsonb_build_object('items',coalesce(jsonb_agg(to_jsonb(i)),'[]'::jsonb)) into result from public.order_items i where i.order_id=order_row.id;
 return result;
end; $$;

create or replace function public.subscribe_newsletter(subscriber_email text) returns void
language plpgsql security definer set search_path = public as $$
begin
 if length(subscriber_email) > 254 or subscriber_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Please enter a valid email address'; end if;
 insert into public.newsletter_subscribers(email) values(lower(trim(subscriber_email))) on conflict do nothing;
end; $$;
revoke all on function public.place_order(jsonb,jsonb,text),public.set_user_role(uuid,text),public.subscribe_newsletter(text),public.handle_new_user() from public;
grant execute on function public.place_order(jsonb,jsonb,text),public.set_user_role(uuid,text) to authenticated;
grant execute on function public.subscribe_newsletter(text) to anon,authenticated;

-- Public product photos. Writes are limited to administrators.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy product_images_read on storage.objects for select using(bucket_id='product-images');
create policy product_images_insert on storage.objects for insert to authenticated with check(bucket_id='product-images' and public.is_admin());
create policy product_images_update on storage.objects for update to authenticated using(bucket_id='product-images' and public.is_admin()) with check(bucket_id='product-images' and public.is_admin());
create policy product_images_delete on storage.objects for delete to authenticated using(bucket_id='product-images' and public.is_admin());
commit;
