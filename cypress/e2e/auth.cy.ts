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

<<<<<<< HEAD
  it.skip("Should render error if user answer less than 3 question", () => {
    cy.intercept({
      method: "POST",
      url: Cypress.env("NEXT_PUBLIC_ZENFLOWS_URL"),
    }).as("api");
    cy.viewport("macbook-13");
    cy.visit("/sign_in");
    cy.get(".mt-4").should("be.visible").click();
    cy.get("input:first").should("be.visible").type(Cypress.env("authEmail"), { force: true });
    cy.get(".h-full > :nth-child(1) > .btn").should("be.visible").click();
    cy.wait("@api");
    cy.get("input").eq(0).should("be.visible").type("pupu pi", { force: true });
    cy.get("form > .mt-4").should("be.visible").click();
    cy.contains("Fill at least 2 more answer");
    cy.get("input").eq(1).should("be.visible").type("pupu pi", { force: true });
    cy.contains("Fill at least 1 more answer");
  });

  it("Should save in local storage keys at sign in via question", () => {
    cy.intercept({
      method: "POST",
      url: Cypress.env("NEXT_PUBLIC_ZENFLOWS_URL"),
    }).as("api");
    cy.viewport("macbook-13");
    cy.visit("/sign_in");
    cy.get(".mt-4").should("be.visible").click();
    cy.get("input:first").should("be.visible").type(Cypress.env("authEmail"), { force: true });
    cy.get(".h-full > :nth-child(1) > .btn").should("be.visible").click();
    cy.wait("@api");
    cy.get("input").eq(0).should("be.visible").clear().type(Cypress.env("answer1"), { force: true });
    cy.get("input").eq(1).should("be.visible").clear().type(Cypress.env("answer2"), { force: true });
    cy.get("input").eq(2).should("be.visible").clear().type(Cypress.env("answer3"), { force: true });
    cy.get("input").eq(3).should("be.visible").clear().type(Cypress.env("answer4"), { force: true });
    cy.get("input").eq(4).should("be.visible").clear().type(Cypress.env("answer5"), { force: true });
    cy.get("form > .mt-4")
=======
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
>>>>>>> 256677e (Sign up in rework #143 (#244))
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

<<<<<<< HEAD
  it.skip("Should render a landing page after log in and save keyring in local storage", () => {
    cy.intercept({
      method: "POST",
      url: Cypress.env("NEXT_PUBLIC_ZENFLOWS_URL"),
    }).as("api");
    cy.viewport("macbook-13");
    cy.visit("/sign_in");
    cy.get(".w-full > div > :nth-child(3)").should("be.visible").click();
    cy.get("input:first").should("be.visible").type(Cypress.env("authEmail"), { force: true });
    cy.get(".h-full > :nth-child(1) > .btn").should("be.visible").click();
    cy.wait("@api").get("input").eq(0).should("be.visible").type(Cypress.env("seed"), { force: true });
    cy.get("form > .btn")
      .click()
      .should(() => {
        expect(localStorage.getItem("reflow")).to.eq(Cypress.env("reflow"));
        expect(localStorage.getItem("eddsa_public_key")).to.eq(Cypress.env("eddsa_public_key"));
        expect(localStorage.getItem("eddsa_key")).to.eq(Cypress.env("eddsa_key"));
        expect(localStorage.getItem("seed")).to.eq(Cypress.env("seed"));
        expect(localStorage.getItem("schnorr")).to.eq(Cypress.env("schnorr"));
        expect(localStorage.getItem("ethereum_address")).to.eq(Cypress.env("ethereum_address"));
        expect(localStorage.getItem("eddsa")).to.eq(Cypress.env("eddsa"));
      })
    cy.location().should(loc => {
      expect(loc.origin).to.eq("http://localhost:3000");
      expect(loc.pathname).to.be.oneOf(["/it", "/en", "/de", "/fr", "/"]);
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
