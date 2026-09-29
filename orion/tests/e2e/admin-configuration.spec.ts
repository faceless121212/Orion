import { expect, test } from "@playwright/test";

import { signedInClient, signInAs, uniqueName } from "./helpers";

const createdAgentNames: string[] = [];

test.afterAll(async () => {
  if (!createdAgentNames.length) return;

  const { supabase } = await signedInClient("admin");
  await supabase.from("agents").delete().in("name", createdAgentNames);
});

test("an admin configures an agent and the employee sees it in My Squad", async ({ browser }) => {
  const agentName = uniqueName("E2E Writer");
  createdAgentNames.push(agentName);
  const { userId } = await signedInClient("user");

  const adminPage = await (await browser.newContext()).newPage();
  await signInAs(adminPage, "admin");

  // Company context saves (only filling the name if the workspace has none).
  await adminPage.goto("/company");
  const companyName = adminPage.getByLabel("Company name");
  if (!(await companyName.inputValue())) {
    await companyName.fill("Orion E2E Company");
  }
  await adminPage.getByRole("button", { name: "Save company context" }).click();
  await expect(adminPage.getByText("Company context saved.")).toBeVisible();

  // Create an agent.
  await adminPage.goto("/agents/new");
  await adminPage.getByLabel("Name").fill(agentName);
  await adminPage.getByLabel("Description").fill("Writes weekly status reports for E2E checks.");
  await adminPage.getByLabel("Use pen icon").click();
  await adminPage
    .getByLabel("Prompt")
    .fill("You are a status report writer. Summarize progress, risks, and next steps clearly.");
  await adminPage.getByRole("button", { name: "Create agent" }).click();
  await expect(adminPage).toHaveURL(/\/agents\/[0-9a-f-]{36}\?created=1/);
  await expect(adminPage.getByText("Agent created.")).toBeVisible();

  // Assign it to the employee.
  await adminPage.goto(`/users/${userId}`);
  await adminPage.getByLabel("Agent", { exact: true }).selectOption({ label: agentName });
  await adminPage.getByRole("button", { name: "Assign agent" }).click();
  await expect(adminPage.getByText("Agent added to squad.")).toBeVisible();

  // The employee sees it and can save personal instructions.
  const userPage = await (await browser.newContext()).newPage();
  await signInAs(userPage, "user");
  await userPage.getByRole("link", { name: "My Squad" }).click();
  await expect(userPage.getByText(agentName, { exact: true })).toBeVisible();
  await userPage
    .getByLabel(`Personal instructions for ${agentName}`)
    .fill("Keep every report under one page.");
  await userPage.getByRole("button", { name: "Save instructions" }).click();
  await expect(userPage.getByText("Personal instructions saved.")).toBeVisible();

  // Archiving hides the agent from the employee's squad.
  await adminPage.goto("/agents");
  await adminPage.getByRole("link", { name: new RegExp(agentName) }).click();
  await adminPage.getByLabel("Status").selectOption("archived");
  await adminPage.getByRole("button", { name: "Save changes" }).click();
  await expect(adminPage.getByText("Agent saved.")).toBeVisible();

  await userPage.reload();
  await expect(userPage.getByText(agentName, { exact: true })).toHaveCount(0);
});

test("a regular user cannot open agent administration", async ({ page }) => {
  await signInAs(page, "user");
  await page.goto("/agents/new");
  await expect(page).toHaveURL(/\/missions\?error=forbidden/);
});
