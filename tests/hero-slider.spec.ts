import { test, expect } from "@playwright/test";

test("hero rotates four images and supports navigation and pause", async ({
  page,
}) => {
  await page.goto("/");
  const slider = page.getByRole("region", { name: "Baby shop highlights" });
  const active = slider.locator(".hero-slide.is-active");
  await expect(slider.locator(".hero-slide img")).toHaveCount(4);
  await expect(active).toHaveAttribute("aria-label", "1 of 4");
  await expect(active).toHaveAttribute("aria-label", "2 of 4", {
    timeout: 8000,
  });
  await slider.getByRole("button", { name: "Show slide 4" }).click();
  await expect(active).toHaveAttribute("aria-label", "4 of 4");
  await slider.getByRole("button", { name: "Next slide" }).click();
  await expect(active).toHaveAttribute("aria-label", "1 of 4");
  await slider.getByRole("button", { name: "Previous slide" }).click();
  await expect(active).toHaveAttribute("aria-label", "4 of 4");
  await page.keyboard.press("ArrowRight");
  await expect(active).toHaveAttribute("aria-label", "1 of 4");
  await slider.getByRole("button", { name: "Pause slideshow" }).click();
  await page.getByRole("link", { name: "AJ Baby Shop home" }).first().focus();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(5500);
  await expect(active).toHaveAttribute("aria-label", "1 of 4");
  await slider.getByRole("button", { name: "Play slideshow" }).click();
  await page.getByRole("link", { name: "AJ Baby Shop home" }).first().focus();
  await page.mouse.move(0, 0);
  await expect(active).toHaveAttribute("aria-label", "2 of 4", {
    timeout: 8000,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    slider.getByRole("button", { name: "Show slide 4" }),
  ).toBeVisible();
  await slider.getByRole("button", { name: "Show slide 4" }).click();
  await expect(active).toHaveAttribute("aria-label", "4 of 4");
  expect(
    await page
      .locator(".hero")
      .evaluate((el) => el.getBoundingClientRect().height),
  ).toBe(430);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
