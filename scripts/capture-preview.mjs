import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
await mkdir("artifacts", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1050 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:3000/", {
  waitUntil: "networkidle",
  timeout: 90000,
});
await page.screenshot({
  path: "artifacts/storefront-desktop.png",
  fullPage: true,
});
const images = await page
  .locator("img")
  .evaluateAll((images) =>
    images
      .filter((i) => i.complete && i.naturalWidth === 0)
      .map((i) => ({ src: i.src, alt: i.alt })),
  );
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({
  path: "artifacts/storefront-mobile.png",
  fullPage: true,
});
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto("http://localhost:3000/admin");
await page.getByRole("button", { name: "Explore demo dashboard" }).click();
await page.screenshot({ path: "artifacts/admin-desktop.png", fullPage: true });
console.log(JSON.stringify({ pageErrors: errors, brokenImages: images }));
await browser.close();
