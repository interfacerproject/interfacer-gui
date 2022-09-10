describe("when user is logged in", () => {
    before(() => {
        cy.login();
        cy.saveLocalStorage();
    });

    beforeEach(() => {
        cy.visit("");
        cy.restoreLocalStorage();
    });

    it('Should see /logged_in', () => {
        cy.visit('/logged_in')
        cy.contains('How do you arrive here? This app is still under construction!')
    })

    it('Should see /resources', () => {
        cy.visit('/resources')
        cy.contains('Resources')
    })

    it('Should see /asset/061J529YVK747JYSJFG3XQZFQG', () => {
        cy.visit('/asset/061J529YVK747JYSJFG3XQZFQG')
        cy.contains('Asset')
    })

    it('Should see /create_project', () => {
        cy.visit('/create_project')
        cy.contains('Create a new asset')
    });

    it('Should see /profile/my_profile', () => {
        cy.visit('/profile/my_profile')
        cy.contains(Cypress.env('authEmail'));
    });

    it('Should see /resource/061HRASS22MHVFCCM6BF7D1GM4', () => {
        cy.visit('/resource/061HRASS22MHVFCCM6BF7D1GM4')
        cy.contains('Material passport')
    });

    it('Should see /assets', () => {
        cy.visit('/assets')
        cy.contains('Welcome to Interfacer Alpha')
    });
});
