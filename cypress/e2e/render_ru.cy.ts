describe("when user is logged in", () => {
  before(() => {
    cy.login();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.visit("");
    cy.restoreLocalStorage();
  });

  // it("should render the sidebar correctly", () => {
  //     cy.visit('/');
  //     /* ==== Generated with Cypress Studio ==== */
  //     cy.get('.btn > .inline-block').click();
  //     cy.get('#my-drawer').check({force: true});
  //     cy.get('[tabindex="0"] > .w-64 > .ml-3 > .flex > .whitespace-nowrap').should('have.text', 'My Stuff');
  //     cy.get(':nth-child(3) > .w-64 > .ml-3').should('be.visible');
  //     cy.get(':nth-child(3) > .w-64 > .ml-3').should('have.text', 'Projects');
  //     cy.get('[tabindex="0"] > .w-64 > .ml-3 > :nth-child(2)').click();
  //     cy.get('.pl-4 > :nth-child(1) > .ml-4 > .w-full > .flex').should('have.text', 'Create project');
  //     cy.get('.pl-4 > :nth-child(1) > .ml-4 > .w-full > .flex').should('be.visible');
  //     cy.get('.pl-4 > :nth-child(2) > .ml-4 > .w-full > .flex').should('have.text', 'My projects');
  //     cy.get('.pl-4 > :nth-child(2) > .ml-4 > .w-full > .flex').should('be.visible');
  //     cy.get(':nth-child(3) > .w-64 > .ml-3').click();
  //     cy.get(':nth-child(3) > .pl-4 > :nth-child(1) > .ml-4 > .w-full > .flex').should('have.text', 'Latest projects');
  //     cy.get(':nth-child(3) > .pl-4 > :nth-child(1) > .ml-4').should('be.visible');
  //     cy.get(':nth-child(3) > .pl-4 > :nth-child(2) > .ml-4 > .w-full').should('have.text', 'Imported from LOSHNEW');
  //     cy.get(':nth-child(3) > .pl-4 > :nth-child(2) > .ml-4 > .w-full > .flex').should('be.visible');
  //     /* ==== End Cypress Studio ==== */
  // });

  it("Should see /resources", () => {
    cy.visit("/resources");
    cy.contains("Resources");
  });

  it("Should see /project/:id", () => {
    cy.visit("/project/" + Cypress.env("project_id"));
    cy.contains("Project");
  });

  it.skip("Should render html in /project/:id", () => {
    cy.login();
    cy.visit("/project/" + Cypress.env("project_id"));
    cy.contains("strong", "bold");
    cy.contains("em", "italics");
    cy.contains("ins", "subbed");
  });

  it("Should see /create_project", () => {
    cy.visit("/create_project");
    cy.contains("Create a new project");
  });

  it("Should see /profile/my_profile", () => {
    cy.visit("/profile/my_profile");
    cy.contains(Cypress.env("authName"));
  });

  it("Should see /resource/:id", () => {
    cy.visit("/resource/" + Cypress.env("resource_id"));
    cy.wait(2000);
    cy.contains("Imported from Losh");
  });

  it("Should see /projects", () => {
    cy.visit("/projects");
    cy.contains("Latest projects");
  });
});
