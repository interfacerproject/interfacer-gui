describe("When user visit Assets", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.visit("");
    cy.restoreLocalStorage();
  });

  it("should Filter resources by the url query string", () => {
    cy.visit("/assets?primaryAccountable=061KPJM661MN6S3QA3PPQ6AQDR");
    cy.get("tr").each(($tr) => {
      cy.wrap($tr).get("td").eq(3).should("contain", "nenno");
    });
  });
});
