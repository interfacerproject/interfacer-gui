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
        cy.contains(Cypress.env('authName'))
    });

    it('Should see /resource/:id', () => {
        cy.visit('/resource/'+ Cypress.env('resource_id'))
        cy.contains('Material passport')
    });

    it('Should see /assets', () => {
        cy.visit('/assets')
        cy.contains('All assets')
        /* ==== Generated with Cypress Studio ==== */
        cy.get('.mb-6 > .undefined').should('have.text', 'Create a new asset');
        cy.get('.ml-2').should('have.text', 'Report a bug');
        cy.get('.table-header-group > tr > :nth-child(1)').should('be.visible');
        cy.get('.table-header-group > tr > :nth-child(2)').should('have.text', 'Last update');
        cy.get('.table-header-group > tr > :nth-child(3)').should('be.visible');
        cy.get('.table-header-group > tr > :nth-child(4)').should('have.text', 'Owner');
        cy.get('.table-header-group > tr > :nth-child(5)').should('be.visible');
        cy.get('.grid-cols-1 > .btn').should('be.enabled');
        /* ==== End Cypress Studio ==== */
        /* ==== Generated with Cypress Studio ==== */
        cy.get('.mb-6 > .undefined').should('have.attr', 'href', '/create_asset');
        cy.get('.mb-6 > .undefined').should('be.visible');
        /* ==== End Cypress Studio ==== */
    });
});
