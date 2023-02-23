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

import { skipOn } from "@cypress/skip-test";

describe("Screenshot ru", () => {
  before(() => {
    skipOn(Cypress.env("isTest"));
    const user = Cypress.env("screenshotsUser");
    Object.keys(user).forEach(key => {
      cy.setLocalStorage(key, user[key]);
    });
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.visit("https://interfacer-gui-staging.dyne.org/");
    cy.restoreLocalStorage();
    cy.viewport("macbook-13");
  });
  // after(() => {
  //   cy.exec("mv cypress/screenshots/ci/screenshots/screenshot_ru.cy.ts cypress/screenshots/ci/screenshot_ru/");
  // });

  it("should takes a screenshot every page", () => {
    const pages: string[] = Cypress.env("screenshotsPages").split(" ");
    pages.forEach(page => {
      cy.visit(`https://interfacer-gui-staging.dyne.org${page}`);
      cy.wait(5000);
      //@ts-ignore
      cy.screenshot(`ru_${page.replaceAll("/", "")}`, { overwrite: true });
    });
  });
});
