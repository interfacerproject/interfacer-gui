import { get, randomEmail, randomString, waitForData } from "../utils";

describe("Sign up process", () => {
  let email = randomEmail();
  let question1 = randomString();
  let question2 = randomString();
  let question3 = randomString();

  //

  /**
   * Sign up
   */

  it("should clear the localstorage", () => {
    cy.clearLocalStorageSnapshot();
  });

  it("Should render error if user answer less than 3 question", () => {
    cy.intercept({
      method: "POST",
      url: Cypress.env("NEXT_PUBLIC_ZENFLOWS_URL"),
    }).as("api");
    cy.viewport("macbook-13");
    cy.visit("/sign_in");
    cy.get("#email").should("be.visible").click();
    cy.get("input:first").should("be.visible").type(Cypress.env("authEmail"), { force: true });
    cy.get("#submit").should("be.visible").click();
    cy.wait("@api");
    cy.get("#viaQuestions").should("be.visible").click();
    cy.get("#question1").eq(0).should("be.visible").type(randomString(), { force: true });
    cy.contains("At least 2 questions");
  });

  it("Should save in local storage keys at sign in via question", () => {
    cy.intercept({
      method: "POST",
      url: Cypress.env("NEXT_PUBLIC_ZENFLOWS_URL"),
    }).as("api");
    cy.viewport("macbook-13");
    cy.visit("/sign_in");
    cy.get("#email").should("be.visible").click();
    cy.get("input:first").should("be.visible").type(Cypress.env("authEmail"), { force: true });
    cy.get("#submit").should("be.visible").click();
    cy.get("#viaQuestions").should("be.visible").click();
    cy.wait("@api");
    cy.get("#question1").should("be.visible").clear().type(Cypress.env("answer1"), { force: true });
    cy.get("#question2").should("be.visible").clear().type(Cypress.env("answer2"), { force: true });
    cy.get("#question3").should("be.visible").clear().type(Cypress.env("answer3"), { force: true });
    cy.get("#question4").should("be.visible").clear().type(Cypress.env("answer4"), { force: true });
    cy.get("#question5").should("be.visible").clear().type(Cypress.env("answer5"), { force: true });
    cy.get("#submit")
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

  it("should go to sign up page", () => {
    cy.visit("/sign_up");
  });

  it("should type the invitationKey", () => {
    cy.get("#invitationButton").should("have.class", "Polaris-Button--disabled");
    cy.get("#invitationKey").type(Cypress.env("NEXT_PUBLIC_INVITATION_KEY"));
    cy.get("#invitationButton").should("not.have.class", "Polaris-Button--disabled");
    cy.get("#invitationButton").click();
  });

  it("should type all the data", () => {
    cy.get("#submit").should("have.class", "Polaris-Button--disabled");
    get("email").clear().type(email);
    // waitForData();
    get("name").type(randomString());
    get("user").type(randomString());
    cy.get("#submit").should("not.have.class", "Polaris-Button--disabled");
    cy.get("#submit").click();
  });

  it("should type some questions", () => {
    cy.get("#submit").should("have.class", "Polaris-Button--disabled");
    get("question1").type(question1);
    get("question2").type(question2);
    get("question3").type(question3);
    cy.get("#submit").should("not.have.class", "Polaris-Button--disabled");
  });

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
        // expect(localStorage.getItem("schnorr")).to.eq(Cypress.env("schnorr"));
        expect(localStorage.getItem("ethereum_address")).to.eq(Cypress.env("ethereum_address"));
        expect(localStorage.getItem("eddsa")).to.eq(Cypress.env("eddsa"));
      });
    cy.location().should(loc => {
      expect(loc.origin).to.eq("http://localhost:3000");
      expect(loc.pathname).to.be.oneOf(["/it", "/en", "/de", "/fr", "/"]);
    });
  });

  // it("shold check the seed box, and login", () => {
  //   cy.get("#passphrase").should("be.visible");
  //   cy.get("#signUpBtn").click();
  // });

  it("should log out", () => {
    cy.login();
    cy.visit("/");
    cy.url()
      .should("eq", "http://localhost:3000/")
      .then(() => {
        get("sidebarOpener").click();
        get("signOut").click();
      });
    cy.url().should("eq", "http://localhost:3000/sign_in");
    expect(localStorage.getItem("reflow")).to.be.null;
    expect(localStorage.getItem("eddsa_public_key")).to.be.null;
    expect(localStorage.getItem("eddsa_key")).to.be.null;
    expect(localStorage.getItem("seed")).to.be.null;
    // expect(localStorage.getItem("schnorr")).to.be.null;
    expect(localStorage.getItem("ethereum_address")).to.be.null;
    expect(localStorage.getItem("eddsa")).to.be.null;
  });

  /**
   * Passphrase login
   */

  // Using "function" instead of arrow function
  // Same reason as previous comment
  it("should sign in with passphrase", function () {
    cy.visit("/sign_in");
    cy.get("#email").type(Cypress.env("authEmail"));
    cy.get("#submit").click();
    cy.get("#viaPassphrase").click();
    // @ts-ignore
    cy.get("#passphrase").type(this.seed);
    cy.get("#submit").click();
    cy.intercept("POST", Cypress.env("ZENFLOWS_URL")).as("api");
    cy.get("#submit").click();
    waitForData("api").should(() => {
      expect(localStorage.getItem("reflow")).to.eq(Cypress.env("reflow"));
      expect(localStorage.getItem("eddsa_public_key")).to.eq(Cypress.env("eddsa_public_key"));
      expect(localStorage.getItem("eddsa_key")).to.eq(Cypress.env("eddsa_key"));
      expect(localStorage.getItem("seed")).to.eq(Cypress.env("seed"));
      // expect(localStorage.getItem("schnorr")).to.eq(Cypress.env("schnorr"));
      expect(localStorage.getItem("ethereum_address")).to.eq(Cypress.env("ethereum_address"));
      expect(localStorage.getItem("eddsa")).to.eq(Cypress.env("eddsa"));
    });
    cy.clearLocalStorageSnapshot();
  });

  /**
   * Questions login
   */

  it("should sign in with questions", () => {
    cy.visit("/sign_in");
    cy.get("#email").type(Cypress.env("authEmail"));
    cy.get("#submit").click();
    cy.get("#viaQuestions").click();
    cy.get("#question1").type(Cypress.env("answer1"));
    cy.get("#question2").type(Cypress.env("answer2"));
    cy.get("#question3").type(Cypress.env("answer3"));
    cy.get("#question4").type(Cypress.env("answer4"));
    cy.get("#question5").type(Cypress.env("answer5"));
    cy.get("#submit").click();
    cy.url().should(() => {
      expect(localStorage.getItem("reflow")).to.eq(Cypress.env("reflow"));
      expect(localStorage.getItem("eddsa_public_key")).to.eq(Cypress.env("eddsa_public_key"));
      expect(localStorage.getItem("eddsa_key")).to.eq(Cypress.env("eddsa_key"));
      expect(localStorage.getItem("seed")).to.eq(Cypress.env("seed"));
      // expect(localStorage.getItem("schnorr")).to.eq(Cypress.env("schnorr"));
      expect(localStorage.getItem("ethereum_address")).to.eq(Cypress.env("ethereum_address"));
      expect(localStorage.getItem("eddsa")).to.eq(Cypress.env("eddsa"));
    });
    cy.clearLocalStorageSnapshot();
  });

  it.skip("should see the passphrase and click login", () => {
    get("passphrase").should("be.visible");
    cy.get("#loginBtn").click();
  });
});
