import { waitForData } from "../utils";

describe("When user visit resources", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  it("should Filter resources by the url query string", () => {
    cy.visit("/resources?primaryAccountable=061KPJM661MN6S3QA3PPQ6AQDR&conformTo=061KFDE93ARR3Q67J2PMBS0JGC");
    waitForData();
    cy.get(`[data-test="resource-item"]`).each($item => {
      cy.wrap($item).children(".table-cell").eq(0).should("contain", "nenno").and("contain", "Design");
    });
  });
});
