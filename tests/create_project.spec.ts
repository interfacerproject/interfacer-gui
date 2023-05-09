import { expect, Page } from "@playwright/test";
import { test } from "./fixtures/test";
import {
  addContributors,
  addDeclarations,
  addLocation,
  addRelatedProjects,
  compileMainValues,
  CompileMainValuesParams,
  uploadImage,
  visitCreateProject,
} from "./utils/forms";
import { checkContributors, checkDeclarations, checkMainValues } from "./utils/projectHelpers";

const checkUrl = async (page: Page, type: string) => {
  const url = page.url();
  expect(url).not.toContain(`/create/project/${type}"`);
  expect(url).toContain("/project");
  //   expect(url).toContain("created=true");
};

test.describe("when user visits create design and submits autoimport field", () => {
  let page: Page;

  test.beforeEach(async ({ context, login }) => {
    page = await context.newPage();
    await login(page);
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test("should give error if url provided is not correct", async ({ random }) => {
    await visitCreateProject(page, "design");
    await page.fill("#autoimport-github-url", random.randomString(4));
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

  test("should create a new design", async ({ interceptGQL, random }) => {
    await visitCreateProject(page, "design");
    const mainValues: CompileMainValuesParams = {
      title: "Vegeta",
      description: "The project description",
      link: "https://gitub.com/dyne/root",
      tag: "open-source",
    };
    await compileMainValues(page, mainValues);
    await uploadImage(page, `image-${random.randomString(4)}`);
    // addLicense(page);
    await addContributors(page, "nenn");
    await addRelatedProjects(page, "milano");
    Promise.all([
      await page.click("#project-create-submit"),
      await interceptGQL(page, "getProjectLayout", (route, request) => console.log(route, request)),
    ]);
    await checkUrl(page, "design");
    await checkMainValues(page, mainValues);
    await checkContributors(page);
    // await checkLicense(page);
    // cy.get("#contributors-list").should("exist").should("contain", "nenno");
    // cy.get("#related-projects-list").should("exist").should("contain", "perenzio");
  });

  test("should create a new product", async ({ interceptGQL, random }) => {
    await visitCreateProject(page, "product");
    const mainValues: CompileMainValuesParams = {
      title: "Goku",
      description: "The project description",
      link: "https://gitub.com/dyne/root",
      tag: "open-source",
    };
    await compileMainValues(page, mainValues);
    await uploadImage(page, `image-${random.randomString(4)}`);
    await addContributors(page, "gio");
    const city = random.randomCity();
    await addLocation(page, city, city);
    const declaration = {
      recyclable: true,
      repairable: false,
    };
    await addDeclarations(page, declaration);
    await page.click("#project-create-submit");
    await interceptGQL(page, "getProjectLayout", (route, request) => console.log(route, request));
    await checkUrl(page, "product");
    await checkMainValues(page, mainValues);
    await checkDeclarations(page, declaration);
    await checkContributors(page);
  });

  test("should create a new service", async ({ interceptGQL, random }) => {
    await visitCreateProject(page, "services");
    const mainValues: CompileMainValuesParams = {
      title: "Maijin Bu",
      description: "The project description",
      link: "https://gitub.com/dyne/root",
      tag: "open-source",
    };
    await compileMainValues(page, mainValues);
    await uploadImage(page, `image-${random.randomString(4)}`);
    const city = random.randomCity();
    await addLocation(page, city, city);
    await addContributors(page, "nenn");
    await addRelatedProjects(page, "bonomelli");
    Promise.all([
      await page.click("#project-create-submit"),
      await interceptGQL(page, "getProjectLayout", (route, request) => console.log(route, request)),
    ]);
    await checkUrl(page, "service");
    await checkMainValues(page, mainValues);
    await checkContributors(page);
  });
});
