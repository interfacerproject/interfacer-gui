// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
        expect(localStorage.getItem("reflowPrivateKey")).not.to.be.null;
        expect(localStorage.getItem("reflowPublicKey")).not.to.be.null;
        expect(localStorage.getItem("eddsaPublicKey")).not.to.be.null;
        expect(localStorage.getItem("eddsaPrivateKey")).not.to.be.null;
        expect(localStorage.getItem("seed")).not.to.be.null;
        expect(localStorage.getItem("bitcoinPrivateKey")).not.to.be.null;
        expect(localStorage.getItem("bitcoinPublicKey")).not.to.be.null;
        expect(localStorage.getItem("ethereumAddress")).not.to.be.null;
        expect(localStorage.getItem("ethereumPrivateKey")).not.to.be.null;
        expect(localStorage.getItem("ecdhPublicKey")).not.to.be.null;
        expect(localStorage.getItem("ecdhPrivateKey")).not.to.be.null;
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
    get("email").clear().type(Cypress.env("authEmail"));
    cy.get("#emailError").should("be.visible").should("contain", "this e-mail has already been used by another user");
    get("email").clear().type(email);
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

  it("Should render a landing page after log in and save keyring in local storage", () => {
    cy.intercept({
      method: "POST",
      url: Cypress.env("NEXT_PUBLIC_ZENFLOWS_URL"),
    }).as("api");
    cy.viewport("macbook-13");
    cy.visit("/sign_in");
    cy.get(".w-full > div > :nth-child(3)").should("be.visible").click();
    cy.get("input:first").should("be.visible").type(Cypress.env("authEmail"), { force: true });
    cy.get("#submit").should("be.visible").click();
    cy.get("#viaPassphrase").should("be.visible").click();
    cy.get("input").eq(0).should("be.visible").type(Cypress.env("seed"), { force: true });
    cy.get("#submit")
      .click()
      .should(() => {
        expect(localStorage.getItem("reflowPrivateKey")).to.eq(Cypress.env("reflowPrivateKey"));
        expect(localStorage.getItem("reflowPublicKey")).to.eq(Cypress.env("reflowPublicKey"));
        expect(localStorage.getItem("eddsaPublicKey")).to.eq(Cypress.env("eddsaPublicKey"));
        expect(localStorage.getItem("eddsaPrivateKey")).to.eq(Cypress.env("eddsaPrivateKey"));
        expect(localStorage.getItem("seed")).to.eq(Cypress.env("seed"));
        expect(localStorage.getItem("ethereumAddress")).to.eq(Cypress.env("ethereumAddress"));
        expect(localStorage.getItem("ethereumPrivateKey")).to.eq(Cypress.env("ethereumPrivateKey"));
        expect(localStorage.getItem("ecdhPublicKey")).to.eq(Cypress.env("ecdhPublicKey"));
        expect(localStorage.getItem("ecdhPrivateKey")).to.eq(Cypress.env("ecdhPrivateKey"));
        expect(localStorage.getItem("bitcoinPrivateKey")).to.eq(Cypress.env("bitcoinPrivateKey"));
        expect(localStorage.getItem("bitcoinPublicKey")).to.eq(Cypress.env("bitcoinPublicKey"));
      });
    cy.location().should(loc => {
      expect(loc.origin).to.eq("http://localhost:3000");
      expect(loc.pathname).to.be.oneOf(["/it", "/en", "/de", "/fr", "/"]);
    });
  });

  it("should log out", () => {
    cy.login();
    cy.visit("/");
    cy.url()
      .should("eq", "http://localhost:3000/")
      .then(() => {
        cy.get("#sidebarOpener").click();
        get("signOut").click();
      });
    cy.url().should("eq", "http://localhost:3000/sign_in");
    expect(localStorage.getItem("reflowPrivateKey")).to.be.null;
    expect(localStorage.getItem("reflowPublicKey")).to.be.null;
    expect(localStorage.getItem("eddsaPublicKey")).to.be.null;
    expect(localStorage.getItem("eddsaPrivateKey")).to.be.null;
    expect(localStorage.getItem("seed")).to.be.null;
    expect(localStorage.getItem("ethereumAddress")).to.be.null;
    expect(localStorage.getItem("ethereumPrivateKey")).to.be.null;
    expect(localStorage.getItem("ecdhPublicKey")).to.be.null;
    expect(localStorage.getItem("ecdhPrivateKey")).to.be.null;
    expect(localStorage.getItem("bitcoinPrivateKey")).to.be.null;
    expect(localStorage.getItem("bitcoinPublicKey")).to.be.null;
    expect(localStorage.getItem("authId")).to.be.null;
    expect(localStorage.getItem("authEmail")).to.be.null;
    expect(localStorage.getItem("authName")).to.be.null;
    expect(localStorage.getItem("authUsername")).to.be.null;
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
      expect(localStorage.getItem("reflowPrivateKey")).to.eq(Cypress.env("reflowPrivateKey"));
      expect(localStorage.getItem("reflowPublicKey")).to.eq(Cypress.env("reflowPublicKey"));
      expect(localStorage.getItem("eddsaPublicKey")).to.eq(Cypress.env("eddsaPublicKey"));
      expect(localStorage.getItem("eddsaPrivateKey")).to.eq(Cypress.env("eddsaPrivateKey"));
      expect(localStorage.getItem("seed")).to.eq(Cypress.env("seed"));
      expect(localStorage.getItem("ethereumAddress")).to.eq(Cypress.env("ethereumAddress"));
      expect(localStorage.getItem("ethereumPrivateKey")).to.eq(Cypress.env("ethereumPrivateKey"));
      expect(localStorage.getItem("ecdhPublicKey")).to.eq(Cypress.env("ecdhPublicKey"));
      expect(localStorage.getItem("ecdhPrivateKey")).to.eq(Cypress.env("ecdhPrivateKey"));
      expect(localStorage.getItem("bitcoinPrivateKey")).to.eq(Cypress.env("bitcoinPrivateKey"));
      expect(localStorage.getItem("bitcoinPublicKey")).to.eq(Cypress.env("bitcoinPublicKey"));
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
      expect(localStorage.getItem("reflowPrivateKey")).to.eq(Cypress.env("reflowPrivateKey"));
      expect(localStorage.getItem("reflowPublicKey")).to.eq(Cypress.env("reflowPublicKey"));
      expect(localStorage.getItem("eddsaPublicKey")).to.eq(Cypress.env("eddsaPublicKey"));
      expect(localStorage.getItem("eddsaPrivateKey")).to.eq(Cypress.env("eddsaPrivateKey"));
      expect(localStorage.getItem("seed")).to.eq(Cypress.env("seed"));
      expect(localStorage.getItem("ethereumAddress")).to.eq(Cypress.env("ethereumAddress"));
      expect(localStorage.getItem("ethereumPrivateKey")).to.eq(Cypress.env("ethereumPrivateKey"));
      expect(localStorage.getItem("ecdhPublicKey")).to.eq(Cypress.env("ecdhPublicKey"));
      expect(localStorage.getItem("ecdhPrivateKey")).to.eq(Cypress.env("ecdhPrivateKey"));
      expect(localStorage.getItem("bitcoinPrivateKey")).to.eq(Cypress.env("bitcoinPrivateKey"));
      expect(localStorage.getItem("bitcoinPublicKey")).to.eq(Cypress.env("bitcoinPublicKey"));
    });
    cy.clearLocalStorageSnapshot();
  });
});
