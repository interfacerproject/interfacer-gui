import { get, randomEmail, randomString } from "../utils";

describe("Sign up process", () => {
  let email = randomEmail();
  let question1 = randomString();
  let question2 = randomString();
  let question3 = randomString();

  //

  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  /**
   * Sign up
   */

  it("should clear the localstorage", () => {
    cy.clearLocalStorageSnapshot();
  });

  it("should go to sign up page", () => {
    cy.visit("/sign_up");
  });

  it("should type the invitationKey", () => {
    get("invitationButton").should("be.disabled");
    get("invitationKey").type(Cypress.env("NEXT_PUBLIC_INVITATION_KEY"));
    get("invitationButton").should("not.be.disabled");
    get("invitationButton").click();
  });

  it("should type all the data", () => {
    get("submit").should("be.disabled");
    get("email").type(email);
    // waitForData();
    get("name").type(randomString());
    get("user").type(randomString());
    get("submit").should("not.be.disabled");
    get("submit").click();
  });

  it("should type some questions", () => {
    get("submit").should("be.disabled");
    get("question1").type(question1);
    get("question2").type(question2);
    get("question3").type(question3);
    get("submit").should("not.be.disabled");
  });

  // "Function" is used here instead of arrow function
  // Here we're setting a global variable
  // And Cypress docs suggest to not use arrow functions when working with variables
  it("should submit, generate keys in localstorage", function () {
    get("submit")
      .click()
      .should(() => {
        expect(localStorage.getItem("reflow")).not.to.be.null;
        expect(localStorage.getItem("eddsa_public_key")).not.to.be.null;
        expect(localStorage.getItem("eddsa_key")).not.to.be.null;
        expect(localStorage.getItem("seed")).not.to.be.null;
        expect(localStorage.getItem("schnorr")).not.to.be.null;
        expect(localStorage.getItem("ethereum_address")).not.to.be.null;
        expect(localStorage.getItem("eddsa")).not.to.be.null;
      })
      .then(() => {
        // Saving the seed for later
        cy.wrap(localStorage.getItem("seed")).as("seed");
      });
  });

  it("shold check the seed box, and login", () => {
    get("passphrase").should("be.visible");
    get("signUpBtn").click();
  });

  it("should log out", () => {
    cy.url()
      .should("eq", "http://localhost:3000/")
      .then(() => {
        get("sidebarOpener").click();
        get("signOut").click();
      });
  });

  /**
   * Passphrase login
   */

  // Using "function" instead of arrow function
  // Same reason as previous comment
  it("should sign in with passphrase", function () {
    cy.clearLocalStorageSnapshot();

    cy.visit("/sign_in");
    get("email").type(email);
    get("submit").click();
    get("viaPassphrase").click();
    // @ts-ignore
    get("passphrase").type(this.seed);
    get("submit").click();
  });

  it("should log out", () => {
    cy.url()
      .should("eq", "http://localhost:3000/")
      .then(() => {
        get("sidebarOpener").click();
        get("signOut").click();
      });
  });

  /**
   * Questions login
   */

  it("should sign in with questions", () => {
    cy.visit("/sign_in");
    get("email").type(email);
    get("submit").click();
    get("viaQuestions").click();
    get("question1").type(question1);
    get("question2").type(question2);
    get("question3").type(question3);
    get("submit").click();
  });

  it("should see the passphrase and click login", () => {
    get("passphrase").should("be.visible");
    get("loginBtn").click();
  });
});
