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

import { aliasQuery, waitForData } from "../utils";

describe("Project Detail functionality", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.visit("");
    cy.restoreLocalStorage();
    cy.visit(`/project/${Cypress.env("project_id")}`);
  });
  it.skip("Should star resource", () => {
    cy.get("#addStar").should("exist");
    const starButton = cy.get("#addStar");
    cy.get("#addStar > span > :nth-child(2)").then($starButton => {
      expect($starButton.text()).to.include("Star");
      const initialValue = parseInt($starButton.text().split(" ")[1].replace("(", "").replace(")", ""));
      cy.wrap(initialValue).as("initialValue");
    });
    starButton.click();
    cy.wait(5000);
    cy.get("#addStar > span > :nth-child(2)").then($starButton => {
      expect($starButton.text()).to.include("Unstar");
      const newValue = parseInt($starButton.text().split(" ")[1].replace("(", "").replace(")", ""));
      cy.wrap(newValue).as("newValue");
    });
    cy.get("@newValue").then(newValue => {
      cy.get("@initialValue").then(initialValue => {
        // @ts-ignore
        expect(newValue).to.be.greaterThan(initialValue);
      });
    });
    starButton.click();
  });

  it("Should add to list then remove it", () => {
    cy.get("#addToList > .Polaris-Button__Content > .Polaris-Button__Text")
      .eq(0)
      .should("exist")
      .click()
      .should("include.text", "Remove from list")
      .click()
      .should("include.text", "Add to list");
  });

  it.skip("Should add to watchlist then remove it", () => {
    cy.get("#addToWatch > span > :nth-child(2)")
      .should("exist")
      .click()
      .should("have.text", "Unwatch")
      .click()
      .should("have.text", "Watch");
  });
  it("Should click on contribute and go to contribution page", () => {
    cy.get("#contribute").should("exist").click().url().should("include", "create/contribution/");
  });
  it("Should have Dpp tab and when it is selected, should have a Json object inside", () => {
    cy.intercept("POST", Cypress.env("ZENFLOWS_URL"), req => {
      aliasQuery(req, "getDpp");
    });
    cy.get("#dpp").should("exist");
    cy.get("#dpp").click();
    cy.wait("@gqlgetDppQuery", { timeout: 120000 });
    cy.get(".pretty-json-container.object-container").should("exist");
  });
  it("Should have the relationships tab and when it is selected, should show resource details card", () => {
    cy.get("#relationships").should("exist");
    cy.get("#relationships").click();
    cy.get(
      ":nth-child(2) > a > .Polaris-Stack > .Polaris-Stack__Item > .flex-row > .pl-4 > .mb-3 > .Polaris-Text--root"
    ).should("exist");
  });
  it("Should have the contributors tab and when it is selected, should contributors", () => {
    cy.get("#Contributors").should("exist");
    cy.get("#Contributors").click();
    // cy.get(".table").should("contain", Cypress.env("authName"));
  });
});
