import { waitForData } from "../../utils";

describe("Screenshot ru", () => {
  before(() => {
    cy.login(true);
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.visit("");
    cy.restoreLocalStorage();
    cy.viewport("macbook-13");
  });

  it("/logged_in", () => {
    cy.visit("/logged_in");
    waitForData(Cypress.env("STAGING_ZENFLOWS_URL"));
    cy.screenshot("logged_in");
  });

  it.skip("/resources", () => {
    cy.visit("/resources");
    waitForData(Cypress.env("STAGING_ZENFLOWS_URL"));
    cy.screenshot("imported from losh");
  });

  it("/asset/:id", () => {
    cy.visit("/asset/" + Cypress.env("asset_id"));
    waitForData(Cypress.env("STAGING_ZENFLOWS_URL"));
    cy.screenshot("asset detail");
  });

  it("/create_asset", () => {
    cy.visit("/create_asset");
    waitForData(Cypress.env("STAGING_ZENFLOWS_URL"));
    cy.screenshot("create asset");
    // Title
    const title = cy.get(`[data-test="projectName"]`);
    title.type("3d laser cutter");
    // Description
    cy.get(`[data-test="projectDescription"]`).find("textarea").type("++3d printed laser cutter++");
    cy.get(".container").scrollTo("top", { ensureScrollable: false });
    cy.screenshot("create asset 2");
  });

  it("/profile/my_profile", () => {
    cy.visit("/profile/my_profile");
    waitForData(Cypress.env("STAGING_ZENFLOWS_URL"));
    cy.screenshot("profile page");
  });

  it("/resource/:id", () => {
    cy.visit("/resource/" + Cypress.env("resource_id"));
    waitForData(Cypress.env("STAGING_ZENFLOWS_URL"));
    cy.screenshot("losh detail");
  });

  it("/assets", () => {
    cy.visit("/assets");
    waitForData(Cypress.env("STAGING_ZENFLOWS_URL"));
    cy.screenshot("assets");
  });
});
