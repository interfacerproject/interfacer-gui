describe("When user is not logged in", () => {
  it("Should see /", () => {
    cy.visit("/");
    cy.contains("Building the digital infrastructure for Fab Cities");
    cy.screenshot();
    cy.checkLinks();
  });

  it("Should see /sign_in", () => {
    cy.visit("/sign_in");
    cy.contains("Login");
    cy.screenshot();
    cy.checkLinks();
  });

  it("Should see /sign_up", () => {
    cy.visit("/sign_up");
    cy.contains("Sign up");
    cy.screenshot();
  });
});
