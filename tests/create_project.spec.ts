import { expect, test, Page } from "@playwright/test";
import { login, randomCity, randomString } from "./utils";
import {
  CompileMainValuesParams,
  addContributors,
  addDeclarations,
  addLocation,
  addRelatedProjects,
  compileMainValues,
  submit,
  uploadImage,
  visitCreateProject,
} from "./utils/forms";
import { checkContributors, checkDeclarations, checkLicense, checkMainValues } from "./utils/projectHelpers";

const checkUrl = async (page: Page, type: string) => {
  const url = page.url();
  expect(url).not.toContain(`/create/project/${type}"`);
  expect(url).toContain("/project");
  //   expect(url).toContain("created=true");
};

test.describe("when user visits create design and submits autoimport field", () => {
  let page: Page;

  test.beforeEach(async ({ context }) => {
    page = await context.newPage();
    await login(page);
  });

  test("should give error if url provided is not correct", async () => {
    await visitCreateProject(page, "design");
    await page.fill("#autoimport-github-url", randomString(4));
    const errorMessage = await page.textContent("#autoimport-github-urlError");
    expect(errorMessage).toContain("github.url must be a valid URL");
  });

  test("should import from an external repository title", async () => {
    await visitCreateProject(page, "design");
    await page.fill("#autoimport-github-url", "https://github.com/dyne/Zenroom");
    await page.click("#autoimport-submit-button");
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes("/readme") && resp.status() === 200),
      page.click("#autoimport-submit-button"),
    ]);
    const mainTitle = await page.getAttribute("#main-title", "value");
    const mainLink = await page.getAttribute("#main-link", "value");
    const tagText = await page.textContent(".Polaris-Tag__TagText");
    expect(mainTitle).toBe("Zenroom");
    expect(mainLink).toBe("https://github.com/dyne/Zenroom");
    expect(tagText).toContain("arm");
  });

  test("should create a new design", async () => {
    await visitCreateProject(page, "design");
    const mainValues: CompileMainValuesParams = {
      title: "Vegeta",
      description: "The project description",
      link: "https://gitub.com/dyne/root",
      tag: "open-source",
    };
    await compileMainValues(page, mainValues);
    await uploadImage(page);
    // addLicense(page);
    await addContributors(page, "nenn");
    await addRelatedProjects(page, "milano");
    await submit(page);
    await checkUrl(page, "design");
    await checkMainValues(page, mainValues);
    await checkContributors(page);
    // await checkLicense(page);
    // cy.get("#contributors-list").should("exist").should("contain", "nenno");
    // cy.get("#related-projects-list").should("exist").should("contain", "perenzio");
  });

  test("should create a new product", async () => {
    const mainValues: CompileMainValuesParams = {
      title: "Goku",
      description: "The project description",
      link: "https://gitub.com/dyne/root",
      tag: "open-source",
    };
    await compileMainValues(page, mainValues);
    await uploadImage(page);
    await addContributors(page, "nenn");
    const city = randomCity();
    await addLocation(page, "product", city);
    const declaration = {
      recyclable: true,
      repairable: false,
    };
    await addDeclarations(page, declaration);
    await submit(page);
    await checkUrl(page, "product");
    await checkMainValues(page, mainValues);
    await checkDeclarations(page, declaration);
    await checkContributors(page);
  });

  test("should create a new service", async () => {
    const mainValues: CompileMainValuesParams = {
      title: "Maijin Bu",
      description: "The project description",
      link: "https://gitub.com/dyne/root",
      tag: "open-source",
    };
    await compileMainValues(page, mainValues);
    await uploadImage(page);
    const city = randomCity();
    await addLocation(page, "service", city);
    await addContributors(page, "nenn");
    await addRelatedProjects(page, "bonomelli");
    await submit(page);
    await checkUrl(page, "service");
    await checkMainValues(page, mainValues);
    await checkContributors(page);
  });
});
