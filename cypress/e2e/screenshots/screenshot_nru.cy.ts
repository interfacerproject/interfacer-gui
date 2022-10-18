const Nru_pages = "/ /sign_up /sign_in".split(" ");

describe("Screenshot nru", () => {
  beforeEach(() => {
    cy.viewport("macbook-13");
  });
  Nru_pages.forEach(page => {
    it(`should take a screenshot of ${page}`, () => {
      cy.visit(`https://interfacer-gui-staging.dyne.org${page}`);
      cy.wait(5000);
      cy.screenshot(`nru_${page}`);
    });
  });
});
