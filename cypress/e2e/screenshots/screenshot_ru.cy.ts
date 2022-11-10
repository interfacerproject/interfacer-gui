const pages =
  "/ /logged_in /resources /asset/061P0XBBP4CXZ3A9T57QA3ZJ9M /create_asset /profile/my_profile /resource/:id /assets".split(
    " "
  );

const user = {
  reflow: "olflWYKP85ucCbgFETXjhNjb2ZAQtfg+m0EJjHScCzg=",
  schnorr: "HEwrd8/AjOwrBd1cg6HGpD59F1KV1T8mu0Xc8EhOuug=",
  eddsa_key: "83Yy6g7krwP6BVvkyG4hR1xKcXUQrFnSLTAyjM57CxF5",
  authId: "061KHHMYHB55KDPH94Y10VNP3M",
  authEmail: "en@dyne.org",
  eddsa: "83Yy6g7krwP6BVvkyG4hR1xKcXUQrFnSLTAyjM57CxF5",
  authName: "nenno",
  authUsername: "nenno",
};

describe("Screenshot ru", () => {
  before(() => {
    Object.keys(user).forEach(key => {
      cy.setLocalStorage(key, user[key]);
    });
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.visit("https://interfacer-gui-staging.dyne.org/");
    cy.restoreLocalStorage();
    cy.viewport("macbook-13");
  });
  after(() => {
    cy.exec("mv cypress/screenshots/ci/screenshot_ru.cy.ts cypress/screenshots/ci/screenshot_ru");
  });

  it("should takes a screenshot every page", () => {
    pages.forEach(page => {
      cy.visit(`https://interfacer-gui-staging.dyne.org${page}`);
      cy.wait(5000);
      cy.screenshot(page);
    });
  });
});
