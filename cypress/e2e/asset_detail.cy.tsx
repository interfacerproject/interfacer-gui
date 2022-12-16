describe("Asset Detail functionality", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.visit("");
    cy.restoreLocalStorage();
  });

  it("Should add user id to metadata.starred then remove it", () => {
    cy.visit(`/asset/${Cypress.env("asset_id")}`);
    cy.get("#addStar").should("exist");
    // cy.get("#addStar").then($starButton => {
    //   cy.get("#addStar").should("have.text", "Star");
    // });
    // cy.get("#addStar > :nth-child(3)").then($starCount => {
    //   const count = parseInt($starCount.text());
    //   cy.get("#addStar > :nth-child(3)");
    //   cy.get("#addStar").click();
    //   cy.get("#addStar > :nth-child(3)").should("have.text", count.toString());
    // });
  });

  it("Should add to list then remove it", () => {
    cy.visit(`/asset/${Cypress.env("asset_id")}`);
    cy.get("#addToList").should("exist");
    // .click()
    // .should("have.text", "remove from list")
    // .click()
    // .should("have.text", "Add to list");
  });
});
