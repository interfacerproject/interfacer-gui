import { get } from "../utils";

describe("When user wants to sign up", () => {
  it("should go to sign in page", () => {
    cy.visit("/sign_in");
  });

  it("should type the email", () => {
    get("submit").should("be.disabled");
    get("email").type(Cypress.env("authEmail"));
    get("submit").should("not.be.disabled").click();
  });

  it("should choose passphrase", () => {
    get("viaPassphrase").click();
  });

  it("should type the passprhase", () => {
    get("passphrase").type(Cypress.env("seed"));
    get("submit").should("not.be.disabled").click();
  });
});
