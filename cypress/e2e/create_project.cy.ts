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

import { randomString } from "../utils";

describe.skip("when user visits create design and submit autoimport field", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/create/project");
    cy.get("#create-design-button").should("exist").click();
  });
  it("should gives error if url provided is not correct", () => {
    cy.get("#autoimport-github-url").type(randomString(4));
    cy.get("#autoimport-github-urlError").should("exist").should("contain", "github.url must be a valid URL");
  });

  it("should import from an external repository title", () => {
    cy.get("#autoimport-github-url").type("https://github.com/dyne/Zenroom");
    cy.get("#autoimport-submit-button").click();
    cy.get("#main-title").should("have.value", "Zenroom");
    // cy.get("#main-description").find("textarea").contains("Zenroom is a small virtual machine for secure scripts");
    cy.get("#main-link").should("have.value", "https://github.com/dyne/Zenroom");
    cy.get(".Polaris-Tag__TagText").should("exist").should("contain", "arm");
  });
});

describe.skip("when user visits create design and submit manually data", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/create/project");
    cy.get("#create-design-button").should("exist").click();
  });

  it.skip("should create a new design", () => {
    cy.get("#main-title").type("Laser");
    cy.get("#main-description").find("textarea").type("The project description");
    cy.get("#main-link").type("https://gitub.com/dyne/zenroom");
    cy.get("#main-tags").type("open-source");
    cy.get("#PolarisPortalsContainer")
      .should("exist")
      .children()
      .children()
      .children()
      .eq(0)
      .should("contain", "open-source")
      .click();
    cy.get("#add-license").click();
    cy.get("#license-scope").should("exist").type("docs");
    cy.get("#license-id").click();
    cy.get("#license-id").type("MIT License");
    cy.get("#PolarisPortalsContainer").children().children().children().eq(0).click();
    cy.get("#add-license-submit-button").click();
    cy.get("#add-contributors-search").type("nenno").wait(500);
    cy.get("#PolarisPortalsContainer").children().children().children().eq(0).click();
    cy.get("#add-related-projects-search").type("perenzio").wait(500);
    cy.get("#PolarisPortalsContainer").children().children().children().eq(0).click();
    cy.get("#project-create-submit").click();
    cy.wait(10000);
    cy.url().should("not.contain", "/create/project/design");
    cy.url().should("contain", "/project");
    cy.url().should("contain", "created=true");
  });
});

describe.skip("when user visits create product and submit manually data", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/create/project");
    cy.get("#create-product-button").should("exist").click();
  });

  it("should create a new product", () => {
    cy.get("#main-title").type("Lengho");
    cy.get("#main-description").find("textarea").type("The project description");
    cy.get("#main-link").type("https://gitub.com/dyne/root");
    cy.get("#main-tags").type("open-source");
    cy.get("#PolarisPortalsContainer")
      .should("exist")
      .children()
      .children()
      .children()
      .eq(0)
      .should("contain", "open-source")
      .click();
    cy.get("#add-contributors-search").type("nenno").wait(500);
    cy.get("#PolarisPortalsContainer").children().children().children().eq(0).click();
    cy.get("#link-design-search").type("perenzio").wait(500);
    cy.get("#PolarisPortalsContainer").children().children().children().eq(0).click();
    cy.get("#add-related-projects-search").type("perenzio").wait(500);
    cy.get("#PolarisPortalsContainer").children().children().children().eq(0).click();
    cy.get("#location-locationName").type(randomString(9));
    cy.get("#search-location").type("Via del Corso");
    cy.get("#PolarisPortalsContainer").children().children().children().eq(0).click();
    cy.get("#recyclable-yes").click();
    cy.get("#recyclable-yes").should("have.class", "Polaris-Button--pressed");
    cy.get("#recyclable-no").should("not.have.class", "Polaris-Button--pressed");
    cy.get("#repairable-no").click();
    cy.get("#repairable-yes").should("not.have.class", "Polaris-Button--pressed");
    cy.get("#repairable-no").should("have.class", "Polaris-Button--pressed");
    cy.get("#project-create-submit").click();
    cy.wait(10000);
    cy.url().should("not.contain", "/create/project/product");
    cy.url().should("contain", "/project");
    cy.url().should("contain", "created=true");
  });
});
