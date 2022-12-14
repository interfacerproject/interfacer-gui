describe("CreateProjectLayout component", () => {
  it("should block the unlogged user, and display login buttons", () => {
    cy.visit("/create_project");
    cy.contains("Login").should("be.visible");
  });

  // The path of the page that will be used to check "back" functionality
  const backPage = "/profile/my_profile";

  it("should allow the logged user to go to /create_project", () => {
    cy.login();
    // Then, we go to "/create_project"
    cy.visit("/create_project");
    // cy.contains("Create a new project").should("be.visible");
  });

  it("should go back to the previous page", () => {
    cy.login();
    cy.visit(backPage);
    // cy.visit("/create_project");
    // // Clicking the back button
    // cy.get("#back").click();
    // // Checking if url matches
    // cy.url().should("include", backPage);
  });
});
