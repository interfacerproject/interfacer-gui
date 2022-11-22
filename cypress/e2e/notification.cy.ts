describe("when user has notification", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.visit("");
    cy.restoreLocalStorage();
  });

  it("should mark notification as read", () => {
    cy.intercept("POST", Cypress.env("NEXT_PUBLIC_INBOX_COUNT_UNREAD"), {
      body: { count: 4, success: "true" },
    }).as("countUnread");
    cy.visit("/");
    cy.get("#notification-bell > sup").should("exist");
    cy.get("#notification-bell > sup").should("have.text", "4");
    cy.get("#notification-bell").click();
    cy.wait(30000);
    cy.intercept("POST", Cypress.env("NEXT_PUBLIC_INBOX_COUNT_UNREAD"), req => {
      req.continue();
    });
    cy.visit("/");
    cy.get("#notification-bell").should("exist");
    cy.get("#notification-bell > sup").should("not.exist");
  });
});
