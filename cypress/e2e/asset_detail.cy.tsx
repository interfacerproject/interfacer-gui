describe("Project Detail functionality", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.visit("");
    cy.restoreLocalStorage();
    cy.visit(`/project/${Cypress.env("project_id")}`);
  });

  it.skip("Should star resource", () => {
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
      cy.get("@initialValue").then(initialValue => {
        // @ts-ignore
        expect(newValue).to.be.greaterThan(initialValue);
      });
    });
    starButton.click();
  });

  it("Should add to list then remove it", () => {
    cy.get("#addToList > span > :nth-child(2)")
      .should("exist")
      .click()
      .should("include.text", "Remove from list")
      .click()
      .should("include.text", "Add to list");
  });

  it.skip("Should add to watchlist then remove it", () => {
    cy.get("#addToWatch > span > :nth-child(2)")
      .should("exist")
      .click()
      .should("have.text", "Unwatch")
      .click()
      .should("have.text", "Watch");
  });
  it("Should click on contribute and go to contribution page", () => {
    cy.get("#goToContribution").should("exist").click().url().should("include", "create/contribution/");
  });
  it("Should have Dpp tab and when it is selected, should have a Json object inside", () => {
    cy.get("#dpp").should("exist");
    cy.get("#dpp").click();
    cy.get(".pretty-json-container.object-container").should("exist");
  });
  it("Should have the relationships tab and when it is selected, should show resource details card", () => {
    cy.get("#relationships").should("exist");
    cy.get("#relationships").click();
    cy.get("#relationshipTree")
      .should("contain", Cypress.env("included_project_1"))
      .and("contain", Cypress.env("included_project_2"));
  });
  it("Should have the contributors tab and when it is selected, should contributors", () => {
    cy.get("#Contributors").should("exist");
    cy.get("#Contributors").click();
    cy.get(".table").should("contain", Cypress.env("authName"));
  });
});
