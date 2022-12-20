import { intercept, waitForData } from "../../utils";

function checkTableAndContent() {
  // Rows of table should be visible
  const rows = cy.get("tr");
  rows.should("be.visible");

  // Getting cells – should have text content
  const cells = rows.get("td");
  cells.should("not.be.empty");
}

describe("When user visit Projects", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  it("should wait to load the table and display some items", () => {
    cy.restoreLocalStorage();
    intercept();
    cy.visit("/projects");
    // waitForData();
    checkTableAndContent();
  });

  it("should filter the table by contributor", () => {
    cy.restoreLocalStorage();
    cy.visit("/projects");
    cy.get(".justify-between > .gap-2").click();

    // Type and press enter in tags field
    cy.get("#tags").type("open-source{enter}");

    // Applying filter
    cy.get(`[data-test="btn-apply"]`).click({ force: true, timeout: 1000 });

    // Checking if table is filtered
    cy.get("tr").each($tr => {
      cy.wrap($tr).get("td").eq(3).should("contain", "open-source");
    });
  });
});
