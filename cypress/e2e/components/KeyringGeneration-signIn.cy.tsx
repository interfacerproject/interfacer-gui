import { getTextInput } from "../../utils";

describe("KeyringGeneration component", () => {
  /**
   * Structure and functionality checks are performed in ./KeyringGeneration-signUp.cy.tsx
   * This test only checks if:
   * - questions are visible
   * - navigation works
   */

  it("should check keyring for /sign_in page", () => {
    cy.visit("/sign_in");

    // Clicking "Answer questions" button
    cy.contains("Login: answer questions").click();

    // Setting email and running
    cy.get("input[type=email]").type("puria@dyne.org");
    cy.contains("Continue").click();

    // There should be five questions
    getTextInput().should("have.length", 5);

    // Answering
    for (let i = 0; i < 5; i++) {
      getTextInput().eq(i).type("p");
    }
    cy.get(".mt-4.btn.btn-block.btn-accent").click();

    // Selecting the passphrase block by the font (may change in the future)
    cy.get("span.font-mono").should("be.visible");

    // Logging in
    cy.get(".btn.btn-block.btn-accent").click();
    cy.url().should("include", "/logged_in");
  });
});
