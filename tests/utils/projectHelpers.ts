import { expect, type Page } from "@playwright/test";
import { CompileMainValuesParams, DeclarationParams } from "./forms";

export const checkMainValues = async (page: Page, v: CompileMainValuesParams) => {
  await page.waitForSelector("#success-banner-content");
  await page.waitForSelector("#is-owner-banner-content");
  expect(await page.textContent("#project-title")).toContain(v.title);
  expect(await page.textContent("#project-overview")).toContain(v.description);
  //   await page.waitForSelector("#open-source");
  //   expect(await page.textContent("open-source")).toContain(v.tag);
};

export const checkLicense = async (page: Page) => {
  await page.waitForSelector("#license-scope");
  expect(await page.textContent("#license-scope")).toContain("docs");
  await page.waitForSelector("#license-id");
  expect(await page.textContent("#license-id")).toContain("MIT License");
};

export const checkDeclarations = async (page: Page, p: DeclarationParams) => {
  if (p.recyclable) {
    await page.waitForSelector("#recycling-availability");
  } else {
    await page.waitForSelector("#recycling-availability", { state: "detached" });
  }

  if (p.repairable) {
    await page.waitForSelector("#repair-availability");
  } else {
    await page.waitForSelector("#repair-availability", { state: "detached" });
  }
};

export const checkHasLinkedDesign = async (page: Page) => {
  await page.waitForSelector("#linked-design");
};

export const checkContributors = async (page: Page) => {
  //   await page.waitForSelector("#sidebar-contributors");
  expect(await page.textContent("#sidebar-contributors")).toContain("1 contributors");
};
