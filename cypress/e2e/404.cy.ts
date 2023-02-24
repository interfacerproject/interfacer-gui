import { randomString } from "../utils";

describe("404", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.visit("");
    cy.restoreLocalStorage();
  });
  it("should display 404 page", () => {
    const randomUrl = `/${randomString()}`;
    cy.request({ url: randomUrl, failOnStatusCode: false }).its("status").should("equal", 404);
    cy.visit(randomUrl, { failOnStatusCode: false });
    cy.get("#error404").should("be.visible").should("contain", "404");
  });
});
