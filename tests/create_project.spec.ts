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

test.describe("when user want to create a project", () => {
  test.describe.configure({ retries: 3, timeout: 100000 });
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
    expect(errorMessage).toContain("Invalid URL");
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

  test("should create a new design", async ({ random }) => {
    await visitCreateProject(page, "design");
    const mainValues: CompileMainValuesParams = {
      title: "Vegeta",
      description: "The project description",
      link: "https://gitub.com/dyne/root",
      tag: "open-source",
    };
    await compileMainValues(page, mainValues);
    await uploadImage(page, `image-${random.randomString(4)}`);
    await addRelatedProjects(page, "milano");
    await page.click("#project-create-submit");
    await page.waitForURL("**/project/**");
    await checkMainValues(page, mainValues);
  });

  test("should create a new product", async ({ random }) => {
    await visitCreateProject(page, "product");
    const mainValues: CompileMainValuesParams = {
      title: "Goku",
      description: "The project description",
      link: "https://gitub.com/dyne/root",
      tag: "open-source",
    };
    await compileMainValues(page, mainValues);
    await uploadImage(page, `image-${random.randomString(4)}`);
    await addContributors(page, "nenn");
    const city = random.randomCity();
    await addLocation(page, city, city);
    const declaration = {
      recyclable: true,
      repairable: false,
    };
    await addDeclarations(page, declaration);
    await page.click("#project-create-submit");
    await page.waitForURL("**/project/**");
    await checkMainValues(page, mainValues);
    await checkDeclarations(page, declaration);
    await checkContributors(page);
  });

  test("should create a new service", async ({ random }) => {
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
    await page.click("#project-create-submit");
    await page.waitForURL("**/project/**");
    await checkMainValues(page, mainValues);
    await checkContributors(page);
  });
});
