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

describe("CreateProjectLayout component", () => {
  it("should block the unlogged user, and display login buttons", () => {
    cy.visit("/create_project");
    cy.contains("Login").should("be.visible");
  });

  // The path of the page that will be used to check "back" functionality
  const backPage = "/profile/my_profile";

  it("should allow the logged user to go to /create_project", () => {
    cy.login();
    // Then, we go to "/create_project"
    cy.visit("/create_project");
    // cy.contains("Create a new project").should("be.visible");
  });

  it("should go back to the previous page", () => {
    cy.login();
    cy.visit(backPage);
    // cy.visit("/create_project");
    // // Clicking the back button
    // cy.get("#back").click();
    // // Checking if url matches
    // cy.url().should("include", backPage);
  });
});
