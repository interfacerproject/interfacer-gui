import { getTextInput, randomEmail, randomString } from "../../utils";

describe("KeyringGeneration component", () => {
  it("should go to /sign_up and register a user (in order to go to keyring)", () => {
    Cypress.on("uncaught:exception", (err, runnable) => {
      return false;
    });
    // Signing up before viewing keyring
    cy.visit("/sign_up");
    cy.get("form > :nth-child(1) > .w-full").should("be.visible").type(Cypress.env("NEXT_PUBLIC_INVITATION_KEY"));
    cy.get("form > :nth-child(2)").should("be.visible").click();
    // Typing email
    cy.get("input[type=email]").type(randomEmail());
    // Name
    getTextInput().eq(0).type(randomString());
    // Username
    getTextInput().eq(1).type(randomString());
    // Clicking the button
    cy.get("form > button.btn-primary").click();
  });

  // Now the Keyring (step 1) should be visible

  it("should render the keyring", () => {
    // There should be five questions
    getTextInput().should("have.length", 5);
  });

  it("should type two questions, submit, then get an error", () => {
    // Inputting two
    getTextInput().eq(2).type(randomString());
    getTextInput().eq(4).type(randomString());
    // Submitting
    cy.get("form > button").click();
    // Alerts should be visible
    cy.get("span.text-warning").should("be.visible");
  });

  it("should type another question, submit, then proceed", () => {
    // Answering
    getTextInput().eq(0).type(randomString());
    // Submitting
    cy.get("form > button").click();
  });

  it("should display the passphrase, then log in", () => {
    // Selecting the passphrase block by the font (may change in the future)
    cy.get("span.font-mono").should("be.visible");
    // Selecting "Login" button
    cy.get(".btn.btn-block.btn-accent").click();
    cy.location().should(loc => {
      expect(loc.origin).to.eq("http://localhost:3000");
      expect(loc.pathname).to.be.oneOf(["/it", "/en", "/de", "/fr", "/"]);
    });
  });
});
