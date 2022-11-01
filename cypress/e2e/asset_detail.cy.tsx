describe("Asset Detail functionality", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.visit("");
    cy.restoreLocalStorage();
  });

  it("Should add user id to metadata.starred then remove it", () => {
    cy.visit("/asset/0620MPMK9ETE8390ZQEYVGT8MW");
    cy.get("#addStar > :nth-child(3)").then($starCount => {
      const count = parseInt($starCount.text());
      cy.get("#addStar").click();
      cy.get("#addStar > :nth-child(3)").should("have.text", (count + 1).toString());
      cy.get("#addStar").click();
      cy.get("#addStar > :nth-child(3)").should("have.text", count.toString());
    });
  });
  it("Should add to list then remove it", () => {
    cy.visit("/asset/0620MPMK9ETE8390ZQEYVGT8MW");
    cy.get("button.px-20.mb-4.btn.btn-block.btn-accent")
      .should("have.text", "Add to list")
      .click()
      .should("have.text", "remove from list")
      .click()
      .should("have.text", "Add to list");
  });
});
