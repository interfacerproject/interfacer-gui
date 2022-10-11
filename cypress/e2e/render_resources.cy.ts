describe("When user visit resources", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.visit("");
    cy.restoreLocalStorage();
  });

  it("should have items with a source url", () => {
    cy.visit("/resources");
    cy.get("tr").each($tr => {
      cy.wrap($tr).get('td').eq(1).should("not.be.empty");
    });
  });
});
