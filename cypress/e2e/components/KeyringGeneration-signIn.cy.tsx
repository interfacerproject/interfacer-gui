import { getTextInput } from "../../utils";

describe("KeyringGeneration component", () => {
  /**
   * Structure and functionality checks are performed in ./KeyringGeneration-signUp.cy.tsx
   * This test only checks if:
   * - questions are visible
   * - navigation works
   */

  it("should check keyring for /sign_in page", () => {
    Cypress.on("uncaught:exception", (err, runnable) => {
      return false;
    });
    cy.visit("/sign_in", {
      onBeforeLoad: contentWindow => {
        Object.defineProperty(navigator, "language", { value: "en-EN" });
      },
    });

    cy.contains("Login answering").click();

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
    cy.location().should(loc => {
      expect(loc.origin).to.eq("http://localhost:3000");
      expect(loc.pathname).to.be.oneOf(["/it", "/en", "/de", "/fr"]);
    });
  });
});
