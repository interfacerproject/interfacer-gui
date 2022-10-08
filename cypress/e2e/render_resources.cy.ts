describe("When user visit resources", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.visit("");
    cy.restoreLocalStorage();
  });

  it("should Filter resources by the url query string", () => {
    cy.visit("/resources?primaryAccountable=061KPJM661MN6S3QA3PPQ6AQDR&conformTo=061KFDE93ARR3Q67J2PMBS0JGC");
    cy.get("tr").each(($tr) => {
      cy.wrap($tr).get("td").eq(0).should("contain", "nenno").and("contain", "Design");
    });
  });
});
