import { waitForData } from "../utils";

describe("Screenshot nru", () => {
  it("index", () => {
    cy.visit("/");
    waitForData();
    cy.screenshot();
  });

  it("/sign_in", () => {
    cy.visit("/sign_in");
    cy.wait(5000);
    cy.screenshot();
  });

  it("/sign_up", () => {
    cy.visit("/sign_up");
    cy.wait(5000);
    cy.screenshot();
  });
});
