const Nru_pages = "/ /sign_up /sign_in".split(" ");

describe("Screenshot nru", () => {
  beforeEach(() => {
    cy.viewport("macbook-13");
  });
  after(() => {
    cy.exec("mv cypress/screenshots/ci/screenshot_nru.cy.ts cypress/screenshots/ci/screenshot_nru");
  });

  Nru_pages.forEach(page => {
    it(`should take a screenshot of ${page}`, () => {
      cy.visit(`https://interfacer-gui-staging.dyne.org${page}`);
      cy.wait(5000);
      cy.screenshot(`nru_${page}`);
    });
  });
});