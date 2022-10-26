import { get, randomEmail, randomString, waitForData } from "../utils";

describe("When user wants to sign up", () => {
  let email = randomEmail();
  let question1 = randomString();
  let question2 = randomString();
  let question3 = randomString();
  let seed = "";

  /**
   * Sign up
   */

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
    waitForData();
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
    get("submit").click();
  });

  it("should see the passprhase and click sign_up", () => {
    get("passphrase")
      .should("be.visible")
      .invoke("text")
      .then(text => {
        seed = text;
      });
    get("signUpBtn").click();
  });

  it("should be in the homepage", () => {
    cy.url().should("eq", "http://localhost:3000/");
  });

  it("should log out", () => {
    get("sidebarOpener").click();
    get("signOut").click();
  });

  /**
   * Passphrase login
   */

  it("should sign in with passphrase", () => {
    cy.visit("/sign_in");
    get("viaPassphrase").click();
    get("email").type(email);
    get("continue").click();
    get("seed").type(seed);
    get("seedBtn").click();
  });

  it("should log out", () => {
    get("sidebarOpener").click();
    get("signOut").click();
  });

  /**
   * Questions login
   */

  it("should sign in with questions", () => {
    cy.visit("/sign_in");
    get("viaQuestions").click();
    get("email").type(email);
    get("continue").click();
    get("question1").type(question1);
    get("question2").type(question2);
    get("question3").type(question3);
    get("submit").click();
  });
});
