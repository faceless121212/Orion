import { expect, test } from "@playwright/test";

import { readE2ECredentials } from "./credentials";

async function signIn(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Work email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/missions/);
}

test("registration route renders the account form", async ({ page }) => {
  await page.goto("/register");

  await expect(page.getByRole("heading", { name: "Create your Orion account" })).toBeVisible();
  await expect(page.getByLabel("Full name")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
});

test("registration submission returns server validation without crashing", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Full name").fill("Ada Lovelace");
  await page.getByLabel("Work email").fill("ada@example.com");
  await page.getByLabel("Password", { exact: true }).fill("password");
  await page.getByLabel("Confirm password").fill("different");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByText("Use at least one uppercase letter.")).toBeVisible();
  await expect(page.getByText("Passwords do not match.")).toBeVisible();
});

test("an unauthenticated visitor is redirected away from the dashboard", async ({ page }) => {
  await page.goto("/missions");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Sign in to Orion" })).toBeVisible();
});

test("a regular user sees only employee navigation", async ({ page }) => {
  const credentials = readE2ECredentials(process.env);

  await signIn(page, credentials.user.email, credentials.user.password);
  await expect(page.getByRole("link", { name: "Missions" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Agents" })).toHaveCount(0);
  await page.goto("/users");
  await expect(page).toHaveURL(/\/missions\?error=forbidden/);
});

test("an administrator sees administration navigation", async ({ page }) => {
  const credentials = readE2ECredentials(process.env);

  await signIn(page, credentials.admin.email, credentials.admin.password);
  await expect(page.getByRole("link", { name: "Agents" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Company" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Users" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Integrations" })).toBeVisible();
  await page.goto("/users");
  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
});
