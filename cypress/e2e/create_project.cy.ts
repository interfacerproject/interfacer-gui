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
import { randomCity } from "../utils";

const visitCreateProject = (type: string) => {
  cy.login();
  cy.visit("/create/project");
  cy.get(`#create-${type}-button`).should("exist").click();
};

type CompileMainValuesParams = {
  title: string;
  description: string;
  link: string;
  tag: string;
};

const compileMainValues = (p: CompileMainValuesParams) => {
  cy.get("#main-title").type(p.title);
  cy.get("#main-description").find("textarea").type(p.description);
  cy.get("#main-link").type(p.link);
  cy.get("#main-tags").type(p.tag);
  cy.get("#PolarisPortalsContainer")
    .should("exist")
    .children()
    .children()
    .children()
    .eq(0)
    .should("contain", p.tag)
    .click();
};

const addContributors = (contributor: string) => {
  searchMenuAdd("#add-contributors-search", contributor);
};

const addLicense = () => {
  cy.get("#add-license").click();
  cy.get("#license-scope").should("exist").type("docs");
  cy.get("#license-id").click();
  searchMenuAdd("#license-id", "MIT License");
  cy.get("#add-license-submit-button").click();
};

const searchMenuAdd = (id: string, query: string) => {
  cy.get(id).type(query).wait(500);
  cy.get("#PolarisPortalsContainer").children().children().children().eq(0).click();
};

const addRelatedProjects = (query: string) => {
  searchMenuAdd("#add-related-projects-search", query);
};

const submit = () => {
  cy.get("#project-create-submit").click();
  cy.wait(15000);
};

const checkUrl = (type: string) => {
  const url = cy.url();
  url.should("not.contain", `/create/project/${type}"`);
  url.should("contain", "/project");
  // url.should("contain", "created=true");
};

const checkMainValues = (v: CompileMainValuesParams) => {
  cy.wait(15000);
  cy.get("#created-banner-content").should("exist");
  cy.get("#is-owner-banner-content").should("exist");
  cy.get("#project-title").should("contain", v.title);
  cy.get("#project-overview").should("contain", v.description);
  cy.get("#open-source").should("exist").should("contain", v.tag);
};

const addLocation = (type: string, query: string) => {
  cy.get("#location-locationName").type(randomString(9));
  cy.get("#search-location").type(query).wait(500);
  cy.get("#PolarisPortalsContainer").children().children().children().eq(0).click();
};
type DeclarationParams = {
  recyclable: boolean;
  repairable: boolean;
};

const addDeclarations = (p: DeclarationParams) => {
  const yesOrNo = (value: boolean) => (value ? "yes" : "no");
  cy.get(`#recyclable-${yesOrNo(p.recyclable)}`).click();
  cy.get(`#recyclable-${yesOrNo(p.recyclable)}`).should("have.class", "Polaris-Button--pressed");
  cy.get(`#recyclable-${yesOrNo(!p.recyclable)}`).should("not.have.class", "Polaris-Button--pressed");
  cy.get(`#repairable-${yesOrNo(p.repairable)}`).click();
  cy.get(`#repairable-${yesOrNo(!p.repairable)}`).should("not.have.class", "Polaris-Button--pressed");
  cy.get(`#repairable-${yesOrNo(p.repairable)}`).should("have.class", "Polaris-Button--pressed");
};

const checkLicense = () => {
  cy.get("#license-scope").should("exist").should("contain", "docs");
  cy.get("#license-id").should("exist").should("contain", "MIT License");
};

const checkDeclarations = (p: DeclarationParams) => {
  p.recyclable
    ? cy.get("#recycling-availability").should("exist")
    : cy.get("#recycling-availability").should("not.exist");
  p.repairable ? cy.get("#repair-availability").should("exist") : cy.get("#repair-availability").should("not.exist");
};

const checkHasLinkedDesign = () => {
  cy.get("#linked-design").should("exist");
};

const checkContributors = () => {
  cy.get("#sidebar-contributors").should("exist");
};

describe.skip("when user visits create design and submit autoimport field", () => {
  beforeEach(() => {
    visitCreateProject("design");
  });
  it("should gives error if url provided is not correct", () => {
    cy.get("#autoimport-github-url").type(randomString(4));
    cy.get("#autoimport-github-urlError").should("exist").should("contain", "github.url must be a valid URL");
  });

  it("should import from an external repository title", () => {
    cy.get("#autoimport-github-url").type("https://github.com/dyne/Zenroom");
    cy.get("#autoimport-submit-button").click();
    cy.get("#main-title").should("have.value", "Zenroom");
    cy.get("#main-link").should("have.value", "https://github.com/dyne/Zenroom");
    cy.get(".Polaris-Tag__TagText").should("exist").should("contain", "arm");
  });
});

describe("when user visits create design and submit manually data", () => {
  beforeEach(() => {
    visitCreateProject("design");
  });
  it("should create a new design", () => {
    const mainValues: CompileMainValuesParams = {
      title: "Laser",
      description: "The project description",
      link: "https://gitub.com/dyne/root",
      tag: "open-source",
    };
    compileMainValues(mainValues);
    addLicense();
    addContributors("nenn");
    addRelatedProjects("perenzio");
    submit();
    checkUrl("design");
    checkMainValues(mainValues);
    checkLicense();
    checkContributors();
    // cy.get("#contributors-list").should("exist").should("contain", "nenno");
    // cy.get("#related-projects-list").should("exist").should("contain", "perenzio");
  });
});

describe("when user visits create product and submit manually data", () => {
  beforeEach(() => {
    visitCreateProject("product");
  });

  it("should create a new product", () => {
    const mainValues: CompileMainValuesParams = {
      title: "Lengho",
      description: "The project description",
      link: "https://gitub.com/dyne/root",
      tag: "open-source",
    };
    compileMainValues(mainValues);
    addContributors("nenn");
    cy.get("#link-design-search").type("perenzio").wait(500);
    cy.get("#PolarisPortalsContainer").children().children().children().eq(0).click();
    addRelatedProjects("perenzio");
    const city = randomCity();
    addLocation("product", city);
    const declaration = {
      recyclable: true,
      repairable: false,
    };
    addDeclarations(declaration);
    submit();

    checkUrl("product");
    checkMainValues(mainValues);
    checkDeclarations(declaration);
    checkHasLinkedDesign();
    checkContributors();
  });
});

describe("when user visits create service and submit manually data", () => {
  beforeEach(() => {
    visitCreateProject("services");
  });

  it("should create a new service", () => {
    const mainValues: CompileMainValuesParams = {
      title: "awesome service",
      description: "The project description",
      link: "https://gitub.com/dyne/root",
      tag: "open-source",
    };
    compileMainValues(mainValues);
    const city = randomCity();
    addLocation("service", city);
    addContributors("nenn");
    addRelatedProjects("perenzio");
    submit();
    checkUrl("service");
    checkMainValues(mainValues);
    checkContributors();
  });
});
