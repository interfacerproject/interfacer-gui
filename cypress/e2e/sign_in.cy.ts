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
    cy.visit("/sign_in");

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
  });
});
