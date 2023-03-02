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

describe("When user visit the profile page", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.visit("");
    cy.restoreLocalStorage();
  });

  it("The profile page should work", function () {
    cy.visit("/profile/my_profile");
    cy.contains(`${Cypress.env("authId")}`);
    cy.get(".py-5 > .Polaris-Stack > :nth-child(1) > .Polaris-Text--root").contains("My projects");
    cy.get(".Polaris-Button__Text").contains("DID Explorer");
  });
  it("The profile page should render slightly differently for other user", function () {
    cy.visit(`/profile/${Cypress.env("otherUserId")}`);
    cy.contains(`${Cypress.env("otherUserId")}`);
    cy.contains("Her projects");
    cy.contains("My List").should("not.exist");
  });
});
