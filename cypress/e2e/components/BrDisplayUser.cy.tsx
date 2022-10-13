import { waitForData } from "../../utils";

describe("BrDisplayUser component", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.visit("/assets");
    cy.restoreLocalStorage();
  });

  it("should click the component and go to user page", () => {
    waitForData();
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

    // Getting the first instance of the component
    const comp = cy.get("tr > td > a").first();
    // Checking if it's visible
    // comp.should("be.visible");
    // Clicking to navigate
    comp.click().then(a => {
      // Checking if url is correct
      cy.location("href").should("eq", a.prop("href"));
    });
  });
});
