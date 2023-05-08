import { Page } from "@playwright/test";
import { login, randomString } from "./index";

export type CompileMainValuesParams = {
  title: string;
  description: string;
  link: string;
  tag: string;
};

export type DeclarationParams = {
  recyclable: boolean;
  repairable: boolean;
};

export const searchMenuAdd = async (page: Page, id: string, query: string) => {
  await page.type(id, query);
  await page.waitForTimeout(500);
  await page.getByRole("option", { name: query }).first().click();
};

export const visitCreateProject = async (page: Page, type: string) => {
  await login(page);
  await page.goto("/create/project");
  await page.click(`#create-${type}-button`);
};

export const compileMainValues = async (page: Page, p: CompileMainValuesParams) => {
  await page.getByLabel("Project title").fill(p.title);
  await page.fill("#main-description textarea", p.description);
  await page.fill("#main-link", p.link);
  await page.getByLabel("Tags").type(p.tag);
  await page.getByText(p.tag).click();
};

export const addContributors = async (page: Page, contributor: string) => {
  await searchMenuAdd(page, "#add-contributors-search", contributor);
};

export const addRelatedProjects = async (page: Page, query: string) => {
  await searchMenuAdd(page, "#add-related-projects-search", query);
};

export const submit = async (page: Page) => {
  // Promise.all([await page.click("#project-create-submit"), await interceptGQL(page, "createProjectMutation")]);
  // //   await interceptGQL(page, "createProjectMutation");
  // //   await interceptGQL(page, "getProjectLayoutQuery");
  // // You may need to intercept requests for GraphQL and wait for the specific queries/mutations
};

export const addLocation = async (page: Page, type: string, query: string) => {
  await page.type("#location-locationName", randomString(9));
  await page.type("#search-location", query);
  await page.waitForTimeout(500);
  await page.getByText(query).nth(0).click();
};

export const addDeclarations = async (page: Page, p: DeclarationParams) => {
  const yesOrNo = (value: boolean) => (value ? "yes" : "no");
  const recyclableChoice = `#recyclable-${yesOrNo(p.recyclable)}`;
  const repairableChoice = `#repairable-${yesOrNo(p.repairable)}`;
  await page.click(recyclableChoice);
  await page.click(repairableChoice);
  // Assertions for classes should be replaced with custom logic if needed
};

export const uploadImage = async (page: Page) => {
  const imageName = `image-${randomString(4)}`;
  const path = `./screenshots/${imageName}.png`;
  await page.screenshot({ path });
  const input = await page.$("input[type=file]#dropzone-images");
  await input?.setInputFiles(path);
};
