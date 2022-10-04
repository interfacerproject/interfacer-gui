describe("when user is logged in", () => {
    before(() => {
        cy.login();
        cy.saveLocalStorage();
    });

    beforeEach(() => {
        cy.visit("");
        cy.restoreLocalStorage();
    });

    it("should render the sidebar correctly", () => {
        cy.visit('/');
        /* ==== Generated with Cypress Studio ==== */
        cy.get('.btn > .inline-block').click();
        cy.get('#my-drawer').check({force: true});
        cy.get('[tabindex="0"] > .w-64 > .ml-3 > .flex > .whitespace-nowrap').should('have.text', 'My Stuff');
        cy.get(':nth-child(3) > .w-64 > .ml-3').should('be.visible');
        cy.get(':nth-child(3) > .w-64 > .ml-3').should('have.text', 'Assets');
        cy.get('[tabindex="0"] > .w-64 > .ml-3 > :nth-child(2)').click();
        cy.get('.pl-4 > :nth-child(1) > .ml-4 > .w-full > .flex').should('have.text', 'Create asset');
        cy.get('.pl-4 > :nth-child(1) > .ml-4 > .w-full > .flex').should('be.visible');
        cy.get('.pl-4 > :nth-child(2) > .ml-4 > .w-full > .flex').should('have.text', 'My assets');
        cy.get('.pl-4 > :nth-child(2) > .ml-4 > .w-full > .flex').should('be.visible');
        cy.get(':nth-child(3) > .w-64 > .ml-3').click();
        cy.get(':nth-child(3) > .pl-4 > :nth-child(1) > .ml-4 > .w-full > .flex').should('have.text', 'Latest assets');
        cy.get(':nth-child(3) > .pl-4 > :nth-child(1) > .ml-4').should('be.visible');
        cy.get(':nth-child(3) > .pl-4 > :nth-child(2) > .ml-4 > .w-full').should('have.text', 'Imported from LOSHNEW');
        cy.get(':nth-child(3) > .pl-4 > :nth-child(2) > .ml-4 > .w-full > .flex').should('be.visible');
        /* ==== End Cypress Studio ==== */
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
        cy.contains('Latest assets')
    });
});
