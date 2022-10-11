import { waitForData } from "../../utils";

//

function checkTableAndContent() {
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
        const dropdown = cy.contains("Contributors").parent().children("div");
        dropdown.click();

        // Clicking the option
        cy.get("#react-select-2-option-1").click();
        // cy.get('#react-select-2-placeholder')

        // Outside click to close the panel
        cy.contains("Filter for:").click();

        // Applying filter
        // Even though in the GUI the button text is "APPLY" (Capitalized)
        // In the DOM the node text is "Apply"
        cy.get("button").contains("Apply").click();

        /**
         * After the last one, the test breaks the table
         */
    });
});
