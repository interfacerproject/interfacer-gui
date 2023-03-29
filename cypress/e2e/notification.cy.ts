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

describe("when user has notification", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.visit("");
    cy.restoreLocalStorage();
  });

  it.skip("should mark notification as read", () => {
    cy.intercept("POST", Cypress.env("NEXT_PUBLIC_INBOX_COUNT_UNREAD"), {
      body: { count: 4, success: "true" },
    }).as("countUnread");
    cy.visit("/");
    cy.get("#notification-bell > sup").should("exist");
    cy.get("#notification-bell > sup").should("have.text", "4");
    cy.get("#notification-bell").click();
    cy.wait(30000);
    cy.intercept("POST", Cypress.env("NEXT_PUBLIC_INBOX_COUNT_UNREAD"), req => {
      req.continue();
    });
    cy.visit("/");
    cy.get("#notification-bell").should("exist");
    cy.get("#notification-bell > sup").should("not.exist");
  });
});
