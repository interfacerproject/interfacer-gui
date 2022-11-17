describe.skip("when user has notification", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.visit("");
    cy.restoreLocalStorage();
  });

  it("should see notification bell", () => {
    cy.visit("/");
    cy.get("#notification-bell > sup").should("be.visible");
  });

  it("should mark notification as read", () => {
    cy.visit("/");
    cy.get("#notification-bell > sup").click();
    cy.contains("added you as contributor to").should("be.visible");
    cy.wait(3000);
    cy.visit("/");
    cy.get("#notification-bell > sup").should("not.exist");
  });
});
