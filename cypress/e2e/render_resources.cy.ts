import { waitForData } from "../utils";

describe.skip("When user visit resources", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  it("should have items with a source url", () => {
    cy.visit("/resources");
    waitForData();
    cy.get(`[data-test="resource-item"]`).each($item => {
      cy.wrap($item).children(".table-cell").eq(1).should("not.be.empty");
    });
  });
});
