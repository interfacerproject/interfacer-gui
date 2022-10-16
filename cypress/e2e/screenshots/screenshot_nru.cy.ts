import { waitForData } from "../../utils";

describe("Screenshot nru", () => {
  beforeEach(() => {
    cy.viewport("macbook-13");
  });
  afterEach(() => {
    cy.wait(5000);
    cy.screenshot();
  });

  it("index", () => {
    cy.visit("/");
  });

  it("/sign_in", () => {
    cy.visit("/sign_in");
  });

  it("/sign_up", () => {
    cy.visit("/sign_up");
  });
});
