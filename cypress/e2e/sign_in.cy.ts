import { get, intercept, waitForData } from "../utils";

describe("Authentication", () => {
  it("should render error if mail dosent exist", () => {
    intercept({ method: "POST" });

    cy.visit("/sign_in");
    cy.get("#email").type("mailmoltoimprobabilechenessunoregistramai@tt.ii");

    // Clicking button and checking for response
    cy.get("#submit")
      .click()
      .then(() => {
        waitForData();
        get("error").should("be.visible");
      });
  });

  it("should get HMAC from the server at sign in", () => {
    intercept({
      method: "POST",
    });

    get("email").clear().type(Cypress.env("authEmail"));
    cy.get("#submit")
      .click()
      .then(() => {
        waitForData().its("response.body.data.keypairoomServer").should("include", Cypress.env("HMAC"));
      });
  });

  it("should choose passphrase", () => {
    cy.get("#viaPassphrase").click();
  });

  it("should type a short passphrase (< 12 words), and get an error", () => {
    cy.get("#passphrase").type("mario insomma cosa fai");
    cy.get("#passphraseError").should("be.visible");
  });

  //

  it("should choose questions method", () => {
    intercept({ method: "POST" });

    cy.visit("/sign_in");

    get("email").type(Cypress.env("authEmail"));
    cy.get("#submit").click();
    get("viaQuestions").click();
  });

  it("should show an error until three questions are filled", () => {
    cy.get("#submit").should("have.class", "Polaris-Button--disabled");
    get("missingQuestions").should("be.visible");

    for (let i = 1; i <= 5; i++) {
      get("question" + i).type(Cypress.env("answer" + i));

      if (i == 3) {
        cy.get("#submit").should("not.have.class", "Polaris-Button--disabled");
        get("missingQuestions").should("not.exist");
      }
    }
  });

  it("should login, and save in local storage keys", () => {
    cy.get("#submit").click();
    cy.get("#loginBtn").click();
    cy.url().should(() => {
      expect(localStorage.getItem("reflow")).to.eq(Cypress.env("reflow"));
      expect(localStorage.getItem("eddsa_public_key")).to.eq(Cypress.env("eddsa_public_key"));
      expect(localStorage.getItem("eddsa_key")).to.eq(Cypress.env("eddsa_key"));
      expect(localStorage.getItem("seed")).to.eq(Cypress.env("seed"));
      // expect(localStorage.getItem("schnorr")).to.eq(Cypress.env("schnorr"));
      expect(localStorage.getItem("ethereum_address")).to.eq(Cypress.env("ethereum_address"));
      expect(localStorage.getItem("eddsa")).to.eq(Cypress.env("eddsa"));
    });
  });
});
