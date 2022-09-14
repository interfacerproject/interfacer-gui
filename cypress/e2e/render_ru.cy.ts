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
        cy.contains('How did you arrived here? This app is still under construction!')
    })

    it('Should see /resources', () => {
        cy.visit('/resources')
        cy.contains('Resources')
    })

    it('Should see /asset/:id', () => {
        cy.visit('/asset/'+ Cypress.env('asset_id'))
        cy.contains('Asset')
    })

    it.skip('Should render html in /asset/:id', () => {
        cy.login()
        cy.visit('/asset/'+ Cypress.env('asset_id'))
        cy.contains('strong', 'bold')
        cy.contains('em', 'italics')
        cy.contains('ins', 'subbed')
    })

    it('Should see /create_asset', () => {
        cy.visit('/create_asset')
        cy.contains('Create a new asset')
    });

    it('Should see /profile/my_profile', () => {
        cy.visit('/profile/my_profile')
        cy.contains(Cypress.env('authEmail'))
    });

    it('Should see /resource/:id', () => {
        cy.visit('/resource/'+ Cypress.env('resource_id'))
        cy.contains('Material passport')
    });

    it('Should see /assets', () => {
        cy.visit('/assets')
        cy.contains('Welcome to Interfacer Alpha')
    });
});
