import { randomString } from "../utils";

describe("when user visits create asset", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  // beforeEach(() => {
  //     cy.visit("");
  //     cy.restoreLocalStorage();
  // });

  // it.skip('it should create tags', function () {
  //     /* ==== Generated with Cypress Studio ==== */
  //     cy.visit('http://localhost:3000/create_asset');
  //     cy.get(':nth-child(6) > div.w-full.form-control > textarea').type('one two three');
  //     cy.get(':nth-child(3) > .badge-primary').should('have.text', 'xone');
  //     cy.get(':nth-child(3) > .badge-error').should('have.text', 'xtwo');
  //     cy.get(':nth-child(3) > .badge-accent').should('have.text', 'xthree');
  //     /* ==== End Cypress Studio ==== */
  // });

  // it("should go to /create_asset page", () => {});

  it("should edit some fields", () => {
    cy.visit("/create_asset");

    // Title
    cy.get(`[data-test="assetName"]`).type("Asset " + randomString(5));

    // Description
    cy.get(`[data-test="assetDescription"]`).find("textarea").type(randomString(15));

    // Multiselect
    cy.get(`[data-test="type-Design"]`).click();
  });

  it("should display a non-clickable submit button", () => {
    cy.get(`[data-test="submit"]`).should("be.disabled");
  });

  it("should edit some other fields", () => {
    // Repo link
    cy.get(`[data-test="repositoryOrId"]`).type("11");

    // // Description
    // cy.get(`[data-test="projectDescription"]`)
    //     .find("textarea")
    //     .type(randomString(15));

    // // Multiselect
    // cy.get(`[data-test="projectType"]`).eq(1).click();
  });

  // it('Should see contributors', () => {
  //     cy.visit('/create_asset')
  //     /* ==== Generated with Cypress Studio ==== */
  //     cy.get('.relative > .w-full').clear('p');
  //     cy.get('.relative > .w-full').type('p');
  //     cy.get(':nth-child(8) > .select > option').should('have.value', '061KG1HB4P3GXVEMZJD6D3EB78');
  //     /* ==== End Cypress Studio ==== */
  // });

  // /* ==== Test Created with Cypress Studio ==== */
  // it('it should create a new asset', function() {
  //     /* ==== Generated with Cypress Studio ==== */
  //     cy.visit('http://localhost:3000/create_asset');
  //     cy.get('form.w-full > :nth-child(1) > .w-full').clear('C');
  //     cy.get('form.w-full > :nth-child(1) > .w-full').type('Asset');
  //     cy.get('textarea[name="textarea"]').type('new asset')
  //     cy.get(':nth-child(2) > .radio').check();
  //     cy.get(':nth-child(5) > .w-full').clear('re');
  //     cy.get(':nth-child(5) > .w-full').type('repo/repo');
  //     cy.get(':nth-child(6) > .form-control > .w-full').click();
  //     cy.get('form.w-full > .grid > :nth-child(1) > .w-full').clear('l');
  //     cy.get('form.w-full > .grid > :nth-child(1) > .w-full').type('location');
  //     cy.get('form.w-full > .grid > :nth-child(2) > .w-full').clear();
  //     cy.get('form.w-full > .grid > :nth-child(2) > .w-full').type('location');
  //     cy.get(':nth-child(9) > .w-full').clear('1');
  //     cy.get(':nth-child(9) > .w-full').type('1');
  //     /* ==== End Cypress Studio ==== */
  //     /* ==== Generated with Cypress Studio ==== */
  //     cy.get('form.w-full > .btn').should('be.enabled');
  //     cy.get('form.w-full > .btn').should('have.text', 'Save');
  //     cy.get('form.w-full > .btn').click();
  //     cy.get('form.w-full > .btn').should('have.text', 'Go to the asset');
  //     cy.get('form.w-full > .btn').should('be.visible');
  //     /* ==== End Cypress Studio ==== */
  // });

  /* ==== Test Created with Cypress Studio ==== */
});
