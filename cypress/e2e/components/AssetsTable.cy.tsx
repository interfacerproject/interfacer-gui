import { intercept, waitForData } from "../../utils";

function checkTableAndContent() {
  // Rows of table should be visible
  const rows = cy.get("tr");
  rows.should("be.visible");

  // Getting cells – should have text content
  const cells = rows.get("td");
  cells.should("not.be.empty");
}

describe("When user visit Assets", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  it("should wait to load the table and display some items", () => {
    cy.restoreLocalStorage();
    intercept();
    cy.visit("/assets");
    // waitForData();
    checkTableAndContent();
  });

  it("should filter the table by contributor", () => {
    cy.restoreLocalStorage();
    cy.visit("/assets");
    cy.get(".justify-between > .gap-2").click();

    // Clicking "Contributors" the multiselect dropdown
    cy.get("#primaryAccountable-select").click();

    // Clicking the option
    cy.get(`[id$="option-0"]`).should("be.visible").click({ force: true, timeout: 1000 });

    // Applying filter
    cy.get(`[data-test="btn-apply"]`).click({ force: true, timeout: 1000 });

    /**
     * After the last one, the test breaks the table
     */
  });
});
