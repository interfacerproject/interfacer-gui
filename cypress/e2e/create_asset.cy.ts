describe("when user visits create asset", () => {
  it("should login, go to /create_asset, and complete the form", () => {
    cy.login();
    cy.visit("/create_asset");

    // It should display a non-clickable submit button
    cy.get("#submit").should("have.attr", "aria-disabled");

    // It should edit all the mandatory fields
    cy.get("#name").type("Awesome project");
    cy.get("#description").find("textarea").type("The asset description");
    cy.get("#repositoryOrId").type("gitttt");
    cy.get(`[data-test="type-Design"]`).click();
    cy.get("#locationName").type("Cool Fablab");
    cy.get("#location").type("bari").wait(500);
    cy.get(`[class$="-option"]`).eq(0).click();

    // The submit button should be clickable
    cy.get("#submit").should("not.have.attr", "aria-disabled");

    // It should add some tags
    cy.get("#tags").type("open-source");
    cy.get(`[class$="-option"]`).eq(0).click();
    cy.get("#tags").type("laser");
    cy.get(`[class$="-option"]`).eq(0).click();

    // It should add a contributor
    cy.get("#contributors").click();
    cy.get(`[class$="-option"]`).eq(0).click();

    // Uploading some images
    cy.fixture("images/img1.png").as("img1");
    cy.fixture("images/img2.png").as("img2");
    cy.fixture("images/img3.png").as("img3");
    cy.get("#images").selectFile(["@img1", "@img2", "@img3"], { force: true });

    // CLick the button
    cy.get("#submit").click();
  });
});
