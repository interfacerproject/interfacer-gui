describe.skip("When user visit Assets", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.visit("");
    cy.restoreLocalStorage();
  });
  it("should Filter resources by the url query string", () => {
    cy.visit(`/assets?primaryAccountable=${Cypress.env("authId")}`);
    cy.get("tr").each($tr => {
      cy.wrap($tr).get("td").eq(2).should("contain", Cypress.env("authName"));
    });
  });
});
