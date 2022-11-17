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
    cy.get("#0627GW44NH7TGB9J9MAC1YJVHR").click();
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

    // Uploading some images
    cy.fixture("images/img1.png").as("img1");
    cy.fixture("images/img2.png").as("img2");
    cy.fixture("images/img3.png").as("img3");
    cy.get("#images").selectFile(["@img1", "@img2", "@img3"], { force: true });

    // CLick the button
    cy.get("#submit").click();
  });

  // it("should edit some other fields", () => {
  //   // Repo link
  //   cy.get(`[data-test="repositoryOrId"]`).type("11");

  //   // // Description
  //   // cy.get(`[data-test="projectDescription"]`)
  //   //     .find("textarea")
  //   //     .type(randomString(15));

  //   // // Multiselect
  //   // cy.get(`[data-test="projectType"]`).eq(1).click();
  // });

  // it('Should see contributors', () => {
  //     cy.visit('/create_asset')
  //     /* ==== Generated with Cypress Studio ==== */
  //     cy.get('.relative > .w-full').clear('p');
  //     cy.get('.relative > .w-full').type('p');
  //     cy.get(':nth-child(8) > .select > option').should('have.value', '061KG1HB4P3GXVEMZJD6D3EB78');
  //     /* ==== End Cypress Studio ==== */
  // });

  // /* ==== Test Created with Cypress Studio ==== */
  // it('it should create a new asset', function() {
  //     /* ==== Generated with Cypress Studio ==== */
  //     cy.visit('http://localhost:3000/create_asset');
  //     cy.get('form.w-full > :nth-child(1) > .w-full').clear('C');
  //     cy.get('form.w-full > :nth-child(1) > .w-full').type('Asset');
  //     cy.get('textarea[name="textarea"]').type('new asset')
  //     cy.get(':nth-child(2) > .radio').check();
  //     cy.get(':nth-child(5) > .w-full').clear('re');
  //     cy.get(':nth-child(5) > .w-full').type('repo/repo');
  //     cy.get(':nth-child(6) > .form-control > .w-full').click();
  //     cy.get('form.w-full > .grid > :nth-child(1) > .w-full').clear('l');
  //     cy.get('form.w-full > .grid > :nth-child(1) > .w-full').type('location');
  //     cy.get('form.w-full > .grid > :nth-child(2) > .w-full').clear();
  //     cy.get('form.w-full > .grid > :nth-child(2) > .w-full').type('location');
  //     cy.get(':nth-child(9) > .w-full').clear('1');
  //     cy.get(':nth-child(9) > .w-full').type('1');
  //     /* ==== End Cypress Studio ==== */
  //     /* ==== Generated with Cypress Studio ==== */
  //     cy.get('form.w-full > .btn').should('be.enabled');
  //     cy.get('form.w-full > .btn').should('have.text', 'Save');
  //     cy.get('form.w-full > .btn').click();
  //     cy.get('form.w-full > .btn').should('have.text', 'Go to the asset');
  //     cy.get('form.w-full > .btn').should('be.visible');
  //     /* ==== End Cypress Studio ==== */
  // });

  /* ==== Test Created with Cypress Studio ==== */
});
