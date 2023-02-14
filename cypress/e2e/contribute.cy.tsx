describe("When user want to contribute", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.visit("");
    cy.restoreLocalStorage();
  });

  it("Should go to contribution page", () => {
    cy.visit(`/project/${Cypress.env("project_id")}`);
    cy.get("#goToContribution").should("exist").click().url().should("include", "create/contribution/");
    cy.wait(2000);
    cy.get("#contributionRepositoryID").type("testRepo");
    cy.get("#description").click().find("textarea").type("testDescription");
    cy.get("#strengthPoints").click().type("2");
    cy.get("#submit").should("be.enabled").click();
    cy.url().should("include", "proposal");
  });
});
