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
    cy.contains("Goals");
    cy.contains("Strength");
    cy.contains("Assets");
    cy.contains("My Assets");
    cy.get("a.tab.tab-bordered.pb-9").eq(1).click();
    cy.contains("My List");
  });
  it("The profile page should render slightly differently for other user", function () {
    cy.visit("/profile/061KPJM661MN6S3QA3PPQ6AQDR");
    cy.contains("The user id is:");
    cy.contains("My Assets").should("not.exist");
    cy.get("a.tab.tab-bordered.pb-9").eq(1).click();
    cy.contains("My List").should("not.exist");
  });
});
