import { get, intercept, waitForData } from "../utils";

describe("Authentication", () => {
  it("should render error if mail dosent exist", () => {
    intercept({ method: "POST" });

    cy.visit("/sign_in");
    get("email").type("mailmoltoimprobabilechenessunoregistramai@tt.ii");

    // Clicking button and checking for response
    get("submit")
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
    get("submit")
      .click()
      .then(() => {
        waitForData().its("response.body.data.keypairoomServer").should("include", Cypress.env("HMAC"));
      });
  });

  it("should choose passphrase", () => {
    get("viaPassphrase").click();
  });

  it("should type a short passphrase (< 12 words), and get an error", () => {
    get("passphrase").type("mario insomma cosa fai");
    get("passphrase-error").should("be.visible");
  });

  it("should type the correct passphrase and login", () => {
    get("passphrase").clear().type(Cypress.env("seed"));
    get("submit").click();
    cy.url().should("eq", "http://localhost:3000/");
  });

  //

  it("should choose questions method", () => {
    intercept({ method: "POST" });

    cy.visit("/sign_in");

    get("email").type(Cypress.env("authEmail"));
    get("submit").click();
    get("viaQuestions").click();
  });

  it("should show an error until three questions are filled", () => {
    get("submit").should("be.disabled");
    get("missingQuestions").should("be.visible");

    for (let i = 1; i <= 5; i++) {
      get("question" + i).type(Cypress.env("answer" + i));

      if (i == 3) {
        get("submit").should("not.be.disabled");
        get("missingQuestions").should("not.exist");
      }
    }
  });

  it("should login, and save in local storage keys", () => {
    get("submit").click();

    intercept({ method: "POST" });
    get("loginBtn").click();
    waitForData().then(() => {
      expect(localStorage.getItem("reflow")).to.eq(Cypress.env("reflow"));
      expect(localStorage.getItem("eddsa_public_key")).to.eq(Cypress.env("eddsa_public_key"));
      expect(localStorage.getItem("eddsa_key")).to.eq(Cypress.env("eddsa_key"));
      expect(localStorage.getItem("seed")).to.eq(Cypress.env("seed"));
      expect(localStorage.getItem("schnorr")).to.eq(Cypress.env("schnorr"));
      expect(localStorage.getItem("ethereum_address")).to.eq(Cypress.env("ethereum_address"));
      expect(localStorage.getItem("eddsa")).to.eq(Cypress.env("eddsa"));
    });

    cy.url().should("eq", "http://localhost:3000/");
  });
});
