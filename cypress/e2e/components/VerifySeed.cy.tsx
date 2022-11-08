const seed = "skin buyer sunset person run push elevator under debris soft surge man";

describe("VerifySeed component", () => {
  it("should display VerifySeed", () => {
    cy.visit("/sign_in");

    cy.contains("Login via passphrase").click();
    cy.get("input[type=email]").type("puria@dyne.org");
    cy.contains("Continue").click();
  });

  it("should enter and invalid seed, and get error", () => {
    cy.get("input[type=text]").type("yolo make nais");
    cy.get("span.text-warning").should("be.visible");
  });

  it("should enter a correct passphrase", () => {
    cy.get("input[type=text]").clear().type(seed);
    cy.get(".btn.btn-block.btn-accent").click();
  });
});
