describe("Project Detail functionality", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.visit("");
    cy.restoreLocalStorage();
  });

  it("Should add user id to metadata.starred then remove it", () => {
    cy.visit(`/project/${Cypress.env("project_id")}`);
    cy.get("#addStar").should("exist");
    const starButton = cy.get("#addStar");
    cy.get("#addStar > span > :nth-child(2)").then($starButton => {
      expect($starButton.text()).to.include("Star");
      const initialValue = parseInt($starButton.text().split(" ")[1].replace("(", "").replace(")", ""));
      cy.wrap(initialValue).as("initialValue");
    });
    starButton.click();
    cy.wait(5000);
    cy.get("#addStar > span > :nth-child(2)").then($starButton => {
      expect($starButton.text()).to.include("Unstar");
      const newValue = parseInt($starButton.text().split(" ")[1].replace("(", "").replace(")", ""));
      cy.wrap(newValue).as("newValue");
    });
    cy.get("@newValue").then(newValue => {
      console.log("count", "count", "count");
      cy.get("@initialValue").then(initialValue => {
        // @ts-ignore
        expect(newValue).to.be.greaterThan(initialValue);
      });
    });
    starButton.click();
  });

  it("Should add to list then remove it", () => {
    cy.visit(`/project/${Cypress.env("project_id")}`);
    cy.get("#addToList > span > :nth-child(2)")
      .should("exist")
      .click()
      .should("include.text", "Remove from list")
      .click()
      .should("include.text", "Add to list");
  });

  it("Should add to watchlist then remove it", () => {
    cy.visit(`/project/${Cypress.env("project_id")}`);
    cy.get("#addToWatch > span > :nth-child(2)")
      .should("exist")
      .click()
      .should("have.text", "Unwatch")
      .click()
      .should("have.text", "Watch");
  });
});
