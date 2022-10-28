describe("When user visit the profile page", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.visit("");
    cy.restoreLocalStorage();
  });

  it("The profile page should work", function () {
    cy.visit("/profile/my_profile");
    cy.contains(`Your user id is: ${Cypress.env("authId")}`);
    cy.contains(`Goals`);
    cy.contains(`Strength`);
    cy.contains(`Assets`);
    cy.contains(`Lists`);
  });
});
