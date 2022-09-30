describe("CreateProjectLayout component", () => {
    it("should block the user, and display login buttons", () => {
        cy.visit("/create_asset");
        cy.contains("Login").should("be.visible");
    });

    it("should allow the user to /create_asset", () => {
        cy.login();
        cy.visit("/create_asset");
        cy.contains("Create a new asset").should("be.visible");
    });
});
