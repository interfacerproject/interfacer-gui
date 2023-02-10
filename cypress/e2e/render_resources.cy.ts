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

import { intercept, waitForData } from "../utils";

//Skipped because we need a new ingestion
describe("When user visit resources", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  it("should have items with a source url", () => {
    intercept();
    cy.visit("/resources");
    // waitForData();
    cy.get(`[data-test="resource-item"]`).each($item => {
      cy.wrap($item).children(".table-cell").eq(1).should("not.be.empty");
    });
  });
});
