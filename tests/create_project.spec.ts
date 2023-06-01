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

type ProjectInfo = {
  type: "design" | "product" | "services";
  mainValues: CompileMainValuesParams;
  contributors?: string[];
  location?: string;
  relatedProjects?: string[];
  declarations?: {
    recyclable: boolean;
    repairable: boolean;
  };
};

const projectsInfo: ProjectInfo[] = [
  {
    type: "design",
    mainValues: {
      title: "Vegeta",
      description: "The project description",
      link: "https://gitub.com/dyne/root",
      tag: "open-source",
    },
  },
  {
    type: "product",
    mainValues: {
      title: "Goku",
      description: "The project description",
      link: "https://gitub.com/dyne/root",
      tag: "open-source",
    },
    contributors: ["nenn"],
    location: "Milan",
    declarations: {
      recyclable: true,
      repairable: false,
    },
  },
  {
    type: "services",
    mainValues: {
      title: "Maijin Bu",
      description: "The project description",
      link: "https://gitub.com/dyne/root",
      tag: "open-source",
    },
    contributors: ["nenn"],
    location: "Milan",
    relatedProjects: ["bonomelli"],
  },
];
const createProject = async (page: Page, projectInfo: ProjectInfo, random: any) => {
  await visitCreateProject(page, projectInfo.type);
  await compileMainValues(page, projectInfo.mainValues);
  await uploadImage(page, `image-${random.randomString(4)}`);
  if (projectInfo.contributors) {
    await addContributors(page, projectInfo.contributors[0]);
  }
  if (projectInfo.location) {
    await addLocation(page, projectInfo.location, projectInfo.location);
  }
  if (projectInfo.relatedProjects) {
    await addRelatedProjects(page, projectInfo.relatedProjects[0]);
  }
  if (projectInfo.declarations) {
    await addDeclarations(page, projectInfo.declarations);
  }
  await page.click("#project-create-submit");
  await page.waitForLoadState("networkidle");
  await checkMainValues(page, projectInfo.mainValues);
  if (projectInfo.contributors) {
    await checkContributors(page);
  }
  if (projectInfo.declarations) {
    await checkDeclarations(page, projectInfo.declarations);
  }
};

test.describe("when user want to create a project", () => {
  test.describe.configure({ retries: 3, timeout: 100000 });
  let page: Page;

  test.beforeEach(async ({ context, login }) => {
    page = await context.newPage();
    await login(page);
  });

  test.afterEach(async () => {
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
    expect(mainTitle).toBe("Zenroom");
    expect(mainLink).toBe("https://github.com/dyne/Zenroom");
    expect(page.locator(".py-1.px-2.bg-primary/5.border-1.border-primary/20.rounded-md")).toBeTruthy()
   
  });

  test("should create a new random project", async ({ random }) => {
    const projectInfoIndex = Math.floor(Math.random() * 2);
    await createProject(page, projectsInfo[projectInfoIndex], random);
  });
});
