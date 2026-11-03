// Keep the optional SQL seed in sync with the demo catalogue.
const fs = require("node:fs");
const ts = require("typescript");
const vm = require("node:vm");
const compiled = ts.transpileModule(fs.readFileSync("lib/data.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const context = { exports: {} };
vm.runInNewContext(compiled, context);
const { categories, products } = context.exports;
const str = (s) => "'" + String(s).replaceAll("'", "''") + "'";
const categorySQL = categories
  .map(
    (c) => `(${[c.id, c.name, c.slug, c.image, c.color].map(str).join(",")})`,
  )
  .join(",\n");
const productSQL = products
  .map(
    (p) =>
      `(${[str(p.id), str(p.name), str(p.slug), str(p.category), p.price, p.compare_price ?? "null", str(p.image), str(p.description), p.stock, str(p.badge), "array[" + p.sizes.map(str).join(",") + "]", p.active].join(",")})`,
  )
  .join(",\n");
fs.writeFileSync(
  "supabase/seed.sql",
  `-- Optional illustrative catalogue. Run after schema.sql.\nbegin;\ninsert into public.categories(id,name,slug,image,color) values\n${categorySQL}\non conflict(id) do nothing;\ninsert into public.products(id,name,slug,category,price,compare_price,image,description,stock,badge,sizes,active) values\n${productSQL}\non conflict(id) do nothing;\ninsert into public.coupons(id,code,percent,active) values('welcome','WELCOME10',10,true) on conflict(id) do nothing;\ncommit;\n`,
);
console.log("Generated supabase/seed.sql");
