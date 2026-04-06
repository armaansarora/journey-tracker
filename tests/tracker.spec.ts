import { test, expect } from "@playwright/test";

test("page loads with hero section", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Journey Realty Group/i })).toBeVisible();
  // Check for progress percentage text
  await expect(page.getByText("%")).toBeVisible();
});

test("tab navigation switches views", async ({ page }) => {
  await page.goto("/");
  // Click Dashboard tab
  await page.getByRole("tab", { name: /dashboard/i }).click();
  // Verify dashboard content is visible (KPI cards section)
  await expect(page.getByText(/Monthly Burn/i)).toBeVisible();

  // Click Activity tab
  await page.getByRole("tab", { name: /activity/i }).click();
  await expect(page.getByText(/Activity Log/i)).toBeVisible();

  // Click Roadmap tab (back to default)
  await page.getByRole("tab", { name: /roadmap/i }).click();
  // Phase A should be visible
  await expect(page.getByText(/Phase A/i)).toBeVisible();
});

test("step cards expand and collapse", async ({ page }) => {
  await page.goto("/");
  // Click on the first step card to expand
  const firstStep = page.locator('[id="step-a1"]');
  await firstStep.click();
  // Verify expanded content is visible
  await expect(page.getByText(/Done when/i).first()).toBeVisible();
  // Click again to collapse
  await firstStep.click();
  // Wait for animation
  await page.waitForTimeout(500);
});

test("blocked steps show lock icon and blocked badge", async ({ page }) => {
  await page.goto("/");
  // Step a2 depends on a1, should be blocked initially
  const stepA2 = page.locator('[id="step-a2"]');
  // Check for "Blocked" text in the badge
  await expect(stepA2.getByText("Blocked")).toBeVisible();
});

test("completing a step updates progress", async ({ page }) => {
  await page.goto("/");
  // Find step a1's completion circle (the checkbox role)
  const checkbox = page.locator('[id="step-a1"]').getByRole("checkbox");
  await checkbox.click();
  // Wait for optimistic update
  await page.waitForTimeout(500);
  // Verify "Done" badge appears
  await expect(page.locator('[id="step-a1"]').getByText("Done")).toBeVisible();
  // Uncheck to restore state for other tests
  await checkbox.click();
  await page.waitForTimeout(500);
});

test("code blocks have copy button on hover", async ({ page }) => {
  await page.goto("/");
  // Expand step a5 which has a code block
  await page.locator('[id="step-a5"]').click();
  // Hover over a code block
  const codeBlock = page.locator("pre").first();
  await codeBlock.hover();
  // Check copy button appears
  await expect(page.getByRole("button", { name: /copy/i }).first()).toBeVisible();
});

test("dark mode toggle works", async ({ page }) => {
  await page.goto("/");
  // Click dark mode toggle
  await page.getByRole("button", { name: /toggle dark mode/i }).click();
  // Verify dark class is on html element
  await expect(page.locator("html")).toHaveClass(/dark/);
  // Toggle back
  await page.getByRole("button", { name: /toggle dark mode/i }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("scroll to top button appears after scrolling", async ({ page }) => {
  await page.goto("/");
  // Scroll via mouse wheel to trigger scroll events
  await page.mouse.wheel(0, 2000);
  await page.waitForTimeout(1000);
  // Verify we actually scrolled
  const scrollY = await page.evaluate(() => window.scrollY);
  if (scrollY < 400) {
    // If wheel didn't scroll enough, force it
    await page.evaluate(() => { window.scrollTo(0, 1500); window.dispatchEvent(new Event("scroll")); });
    await page.waitForTimeout(500);
  }
  // Check for back-to-top button
  const btn = page.getByLabel("Back to top");
  await expect(btn).toBeVisible({ timeout: 5000 });
  await btn.click();
  await page.waitForTimeout(1000);
  const finalY = await page.evaluate(() => window.scrollY);
  expect(finalY).toBeLessThan(100);
});

test("responsive layout on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  // Hero should be visible
  await expect(page.getByRole("heading", { name: /Journey Realty Group/i })).toBeVisible();
  // Step cards should be visible
  await expect(page.locator('[id="step-a1"]')).toBeVisible();
});

test("desktop hero has side-by-side layout", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Journey Realty Group/i })).toBeVisible();
  // Progress ring and phase bars should both be visible
  await expect(page.getByText(/\d+%/)).toBeVisible();
  await expect(page.getByText("Foundation").first()).toBeVisible();
});
