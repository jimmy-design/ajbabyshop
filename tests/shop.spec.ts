import { test, expect } from "@playwright/test";
test("customer can discover, save, add, checkout and see a demo order in admin", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Little things. Endless love." }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Explore the collection", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search collection" })
    .fill("knit set");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Save The everyday knit set to wishlist" })
    .click();
  await page.getByRole("link", { name: "Wishlist", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page
    .locator(".product-title")
    .filter({ hasText: "The everyday knit set" })
    .click();
  await page.getByRole("button", { name: "3–6 months", exact: true }).click();
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await page
    .locator(".detail-copy")
    .getByRole("button", { name: "Add to bag", exact: true })
    .click();
  await page.getByRole("link", { name: "Shopping bag", exact: true }).click();
  await expect(page.locator(".cart-item")).toContainText("3–6 months");
  await expect(page.locator(".order-summary")).toContainText("KSh 5,600");
  await page.getByPlaceholder("e.g. WELCOME10").fill("WELCOME10");
  await page.getByRole("button", { name: "Continue to checkout" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill("Test Parent");
  await page
    .getByRole("textbox", { name: "Email address", exact: true })
    .first()
    .fill("parent@example.com");
  await page.getByRole("textbox", { name: "Phone number" }).fill("0712345678");
  await page.getByRole("textbox", { name: "City / town" }).fill("Nairobi");
  await page
    .getByRole("textbox", { name: "Delivery address" })
    .fill("Test Lane, House 12");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Place demo order" }).click();
  await expect(
    page.getByRole("heading", { name: "Your demo order is ready" }),
  ).toBeVisible();
  await expect(page.locator(".order-success")).toContainText("KSh 5,040");
  await page.goto("/admin");
  await page.getByRole("button", { name: "Explore demo dashboard" }).click();
  await page
    .getByRole("button", { name: "Orders", exact: false })
    .filter({ has: page.locator("svg") })
    .first()
    .click();
  await expect(page.locator(".admin-order")).toContainText("Test Parent");
  await page.locator(".admin-order summary").click();
  await page.getByLabel("Update status").selectOption("delivered");
  await expect(page.locator(".admin-order summary")).toContainText("delivered");
  await page.reload();
  await expect(page.locator(".stat-grid")).toContainText("KSh 5,040");
});
test("admin creates a category, product and coupon and can delete unused records", async ({
  page,
}) => {
  await page.goto("/admin");
  await page.getByRole("button", { name: "Explore demo dashboard" }).click();
  await page.getByRole("button", { name: "Categories", exact: true }).click();
  await page.getByRole("button", { name: "Add category" }).click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Name", { exact: true }).fill("Little accessories");
  await dialog
    .getByLabel("Image URL", { exact: true })
    .fill("https://images.unsplash.com/photo-1522771930-78848d9293e8");
  await dialog.getByRole("button", { name: "Save category" }).click();
  await expect(page.locator(".admin-category")).toHaveCount(7);
  await page.getByRole("button", { name: "Products", exact: true }).click();
  await page.getByRole("button", { name: "Add product" }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Product name").fill("Rosy little hat");
  await dialog
    .getByLabel("Category", { exact: true })
    .selectOption("little-accessories");
  await dialog.getByLabel("Price (KES)", { exact: true }).fill("900");
  await dialog
    .getByLabel("Image URL", { exact: true })
    .fill("https://images.unsplash.com/photo-1522771930-78848d9293e8");
  await dialog
    .getByLabel("Description", { exact: true })
    .fill("A very soft little cotton hat.");
  await dialog.getByLabel("Stock quantity").fill("8");
  await dialog.getByRole("button", { name: "Save product" }).click();
  await expect(page.locator("table")).toContainText("Rosy little hat");
  await page.goto("/shop");
  await page.getByRole("textbox", { name: "Search collection" }).fill("Rosy");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.goto("/admin");
  await page.getByRole("button", { name: "Discounts", exact: true }).click();
  await page.getByRole("button", { name: "Create discount" }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Discount code").fill("LITTLE20");
  await dialog.getByLabel("Discount (%)").fill("20");
  await dialog.getByRole("button", { name: "Save discount" }).click();
  await expect(page.locator(".coupon-grid")).toContainText("LITTLE20");
  await page.getByRole("button", { name: "Products", exact: true }).click();
  await page.getByRole("button", { name: "Delete Rosy little hat" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete product" })
    .click();
  await expect(page.locator("table")).not.toContainText("Rosy little hat");
  await page.getByRole("button", { name: "Categories", exact: true }).click();
  await page.getByRole("button", { name: "Delete Little accessories" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete category" })
    .click();
  await expect(page.locator(".admin-category")).toHaveCount(6);
});
test("mobile pages stay within the viewport and menu navigation works", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "/",
    "/shop",
    "/product/everyday-knit-set",
    "/cart",
    "/wishlist",
    "/account",
  ]) {
    await page.goto(route);
    await expect(page.locator("body")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
  }
  await page.getByRole("button", { name: "Toggle menu" }).click();
  await page
    .locator(".mobile-nav")
    .getByRole("link", { name: "Shop all", exact: true })
    .click();
  await expect(page).toHaveURL(/\/shop$/);
  await page.goto("/admin");
  await page.getByRole("button", { name: "Explore demo dashboard" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.getByRole("button", { name: "Toggle admin menu" }).click();
  await page.getByRole("button", { name: "Products", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Products", exact: true }),
  ).toBeVisible();
});
