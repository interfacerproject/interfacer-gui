import { waitForData } from "../utils";

describe("Screenshot ru", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.visit("");
    cy.restoreLocalStorage();
  });

  it("/logged_in", () => {
    cy.visit("/logged_in");
    waitForData();
    cy.screenshot();
  });

  it("/resources", () => {
    cy.visit("/resources");
    waitForData();
    cy.screenshot();
  });

  it("/asset/:id", () => {
    cy.visit("/asset/" + Cypress.env("asset_id"));
    waitForData();
    cy.screenshot();
  });

  it("/create_asset", () => {
    cy.visit("/create_asset");
    cy.screenshot();
    // Title
    cy.get(`[data-test="projectName"]`).type("3d laser cutter");

    // Description
    cy.get(`[data-test="projectDescription"]`).find("textarea").type("++3d printed laser cutter++");

    // Multiselect
    cy.get(`[data-test="projectType"]`).eq(1).click();
    cy.screenshot();
  });

  it("/profile/my_profile", () => {
    cy.visit("/profile/my_profile");
    waitForData();
    cy.screenshot();
  });

  it("/resource/:id", () => {
    cy.visit("/resource/" + Cypress.env("resource_id"));
    waitForData();
    cy.wait(2000);
    cy.screenshot();
  });

  it("/assets", () => {
    cy.visit("/assets");
    //Clicking 10 times load more button  due to inconsistent data in testing instance db
    cy.get(".place-items-center > button").eq(0).click().click().click().click().click();
    waitForData();
    cy.screenshot();
  });
});
