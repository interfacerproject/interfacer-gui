import { waitForData } from "../../utils";

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
    cy.visit("/assets");
    cy.restoreLocalStorage();
    waitForData();
    checkTableAndContent();
  });

  it("should filter the table by contributor", () => {
    cy.visit("/assets");
    cy.restoreLocalStorage();
    waitForData();
    // waitForData();
    cy.get(".justify-between > .gap-2").click();
    // Clicking "Contributors" the multiselect dropdown
    cy.get(`[data-test="add-contributors"]`).click();

    // Clicking the option
    cy.get(`[id$="listbox"]`).children("div").children("div").eq(1).click();

    // Outside click to close the panel
    cy.contains("Filter for:").click();

    // Applying filter
    // Even though in the GUI the button text is "APPLY" (Capitalized)
    // In the DOM the node text is "Apply"
    cy.get(`[data-test="btn-apply"]`).click();

    /**
     * After the last one, the test breaks the table
     */
  });
});
