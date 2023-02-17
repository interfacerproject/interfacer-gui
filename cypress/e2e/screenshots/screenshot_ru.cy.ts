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

const pages =
  "/ /logged_in /resources /project/061P0XBBP4CXZ3A9T57QA3ZJ9M /create/project /profile/my_profile /resource/:id /projects".split(
    " "
  );

const user = {
  reflow: "olflWYKP85ucCbgFETXjhNjb2ZAQtfg+m0EJjHScCzg=",
  schnorr: "HEwrd8/AjOwrBd1cg6HGpD59F1KV1T8mu0Xc8EhOuug=",
  eddsa_key: "83Yy6g7krwP6BVvkyG4hR1xKcXUQrFnSLTAyjM57CxF5",
  authId: "061KHHMYHB55KDPH94Y10VNP3M",
  authEmail: "en@dyne.org",
  eddsa: "83Yy6g7krwP6BVvkyG4hR1xKcXUQrFnSLTAyjM57CxF5",
  authName: "nenno",
  authUsername: "nenno",
};

describe.skip("Screenshot ru", () => {
  before(() => {
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
  after(() => {
    cy.exec("mv cypress/screenshots/ci/screenshots/screenshot_ru.cy.ts cypress/screenshots/ci/screenshot_ru/");
  });

  it("should takes a screenshot every page", () => {
    pages.forEach(page => {
      cy.visit(`https://interfacer-gui-staging.dyne.org${page}`);
      cy.wait(5000);
      cy.screenshot(page);
    });
  });
});
