import { waitForData } from "../../utils";

//

function checkTableAndContent() {
  //Clicking 10 times load more button  due to inconsistent data in testing instance db
  cy.get(".place-items-center > button")
    .eq(0)
    .click()
    .click()
    .click()
    .click()
    .click()
    .click()
    .click()
    .click()
    .click()
    .click();
  // Rows of table should be visible
  const rows = cy.get("tr");
  rows.should("be.visible");

  // Getting cells – should have text content
  const cells = rows.get("td");
  cells.should("not.be.empty");
}

//

describe("When user visit Assets", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  // beforeEach(() => {
  //     cy.visit("/assets");
  //     cy.restoreLocalStorage();
  // });

  it("should wait to load the table and display some items", () => {
    cy.visit("/assets");
    cy.restoreLocalStorage();
    waitForData();
    checkTableAndContent();
  });

  it("should filter the table by contributor", () => {
    // waitForData();

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
