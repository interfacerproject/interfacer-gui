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

import { intercept, waitForData } from "../../utils";

function checkTableAndContent() {
  // Rows of table should be visible
  const rows = cy.get("tr");
  rows.should("be.visible");

  // Getting cells – should have text content
  const cells = rows.get("td");
  cells.should("not.be.empty");
}

describe("When user visit Projects", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  it("should wait to load the table and display some items", () => {
    cy.restoreLocalStorage();
    intercept();
    cy.visit("/projects");
    // waitForData();
    checkTableAndContent();
  });

  it("should filter the table by contributor", () => {
    cy.restoreLocalStorage();
    cy.visit("/projects");
    cy.viewport("macbook-13");
    cy.get(".justify-between > .gap-2").click();

    // Type and press enter in tags field
    cy.get("#tags").type("open-source{enter}");

    // Applying filter
    cy.get(`[data-test="btn-apply"]`).click({ force: true, timeout: 1000 });

    // Checking if table is filtered
    cy.get("tr").each($tr => {
      cy.wrap($tr).get("td").eq(3).should("contain", "open-source");
    });
  });
});
