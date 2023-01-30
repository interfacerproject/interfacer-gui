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
    cy.contains("idea");
    cy.contains("strengths");
    cy.contains("My Projects");
    cy.get("a.tab.tab-bordered.pb-9").eq(1).click();
    cy.contains("My List");
  });
  it("The profile page should render slightly differently for other user", function () {
    cy.visit(`/profile/${Cypress.env("other_user_id")}`);
    cy.contains("The user id is:");
    cy.contains("Projects");
    cy.get("a.tab.tab-bordered.pb-9").eq(1).click();
    cy.contains("My List").should("not.exist");
  });
});
