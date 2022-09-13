describe('Authentication', () => {
    it('At sign in Should render error if mail dosent exist', () => {
        cy.viewport('macbook-13')
        cy.visit('/sign_in')
        cy.get('button').first().should('be.visible').click()
        cy.get('input:first').should('be.visible').type('mailmoltoimprobabilechenessunoregistramai@tt.ii')
        cy.get('button').first().should('be.visible').click()
        cy.contains('this email doesn\'t exist')
    })
    it('should get HMAC from the server at sign in', () => {
        cy.intercept({
            method: 'POST',
            url: 'https://fcos.interfacer.dyne.org/api',
        }).as('api')
        cy.viewport('macbook-13')
        cy.visit('/sign_in')
        cy.get('button').first().should('be.visible').click()
        cy.get('input:first').should('be.visible').type(Cypress.env('authEmail'))
        cy.get('button').first().should('be.visible').click()
        cy.wait('@api').its('response.body.data.keypairoomServer').should('include', Cypress.env('HMAC'))
    })

    it('At sign in Should render error if passhprase is != 12 words', () => {
        cy.intercept({
            method: 'POST',
            url: 'https://fcos.interfacer.dyne.org/api',
        }).as('api')
        cy.viewport('macbook-13')
        cy.visit('/sign_in')
        cy.get('button').first().should('be.visible').click()
        cy.get('input:first').should('be.visible').type(Cypress.env('authEmail'))
        cy.get('button').first().should('be.visible').click()
        cy.wait('@api')
        cy.get('input').eq(0).should('be.visible').type('pupu pi')
        cy.contains('Invalid pass phrase')
    })

    it('Should render error if user answer less than 3 question', () => {
        cy.intercept({
            method: 'POST',
            url: 'https://fcos.interfacer.dyne.org/api',
        }).as('api')
        cy.viewport('macbook-13')
        cy.visit('/sign_in')
        cy.get('button').eq(1).should('be.visible').click()
        cy.get('input:first').should('be.visible').type(Cypress.env('authEmail'))
        cy.get('button').first().should('be.visible').click()
        cy.wait('@api')
        cy.get('input').eq(0).should('be.visible').type('pupu pi')
        cy.get('button').first().should('be.visible').click()
        cy.contains('Fill at least 2 more answer')
        cy.get('input').eq(1).should('be.visible').type('pupu pi')
        cy.contains('Fill at least 1 more answer')
    })

    it('Should save in local storage keys at sign in via question', () => {
        cy.intercept({
            method: 'POST',
            url: 'https://fcos.interfacer.dyne.org/api',
        }).as('api')
        cy.viewport('macbook-13')
        cy.visit('/sign_in')
        cy.get('button').eq(1).should('be.visible').click()
        cy.get('input:first').should('be.visible').type(Cypress.env('authEmail'))
        cy.get('button').first().should('be.visible').click()
        cy.wait('@api')
        cy.get('input').eq(0).should('be.visible').type(Cypress.env('answer1'))
        cy.get('input').eq(1).should('be.visible').type(Cypress.env('answer2'))
        cy.get('input').eq(2).should('be.visible').type(Cypress.env('answer3'))
        cy.get('input').eq(3).should('be.visible').type(Cypress.env('answer4'))
        cy.get('input').eq(4).should('be.visible').type(Cypress.env('answer5'))
        cy.get('button').first().click().should(() => {
            expect(localStorage.getItem('reflow')).to.eq(Cypress.env('reflow'))
            expect(localStorage.getItem('eddsa_public_key')).to.eq(Cypress.env('eddsa_public_key'))
            expect(localStorage.getItem('eddsa_key')).to.eq(Cypress.env('eddsa_key'))
            expect(localStorage.getItem('seed')).to.eq(Cypress.env('seed'))
            expect(localStorage.getItem('schnorr')).to.eq(Cypress.env('schnorr'))
            expect(localStorage.getItem('ethereum_address')).to.eq(Cypress.env('ethereum_address'))
            expect(localStorage.getItem('eddsa')).to.eq(Cypress.env('eddsa'))
        })
    })

    it('Should render a landing page after log in and save keyring in local storage', () => {
        cy.intercept({
            method: 'POST',
            url: 'https://fcos.interfacer.dyne.org/api',
        }).as('api')
        cy.viewport('macbook-13')
        cy.visit('/sign_in')
        cy.get('button').first().should('be.visible').click()
        cy.get('input:first').should('be.visible').type(Cypress.env('authEmail'))
        cy.get('button').first().should('be.visible').click()
        cy.wait('@api').get('input').eq(0).should('be.visible').type(Cypress.env('seed'))
        cy.get('button').first().click().should(() => {
            expect(localStorage.getItem('reflow')).to.eq(Cypress.env('reflow'))
            expect(localStorage.getItem('eddsa_public_key')).to.eq(Cypress.env('eddsa_public_key'))
            expect(localStorage.getItem('eddsa_key')).to.eq(Cypress.env('eddsa_key'))
            expect(localStorage.getItem('seed')).to.eq(Cypress.env('seed'))
            expect(localStorage.getItem('schnorr')).to.eq(Cypress.env('schnorr'))
            expect(localStorage.getItem('ethereum_address')).to.eq(Cypress.env('ethereum_address'))
            expect(localStorage.getItem('eddsa')).to.eq(Cypress.env('eddsa'))
        })
        cy.get('button').eq(1).should('be.visible').click()
        cy.contains('Hello')
    })
    it('Should save in local storage keys at sign up', () => {
        cy.intercept({
            method: 'POST',
            url: 'https://fcos.interfacer.dyne.org/api',
        }).as('api')
        cy.viewport('macbook-13')
        cy.visit('/sign_in')
        cy.get('a').eq(0).should('be.visible').click()
        cy.get('input:first').should('be.visible').type('o@d.otg')
        cy.get('input').eq(1).should('be.visible').type('name')
        cy.get('input').eq(2).should('be.visible').type('user')
        cy.get('button').first().should('be.visible').click()
        cy.get('input').eq(0).should('be.visible').type('risposta1')
        cy.get('input').eq(1).should('be.visible').type('risposta2')
        cy.get('input').eq(2).should('be.visible').type('risposta3')
        cy.get('button').first().should('be.visible').click().should(() => {
            expect(localStorage.getItem('reflow')).to.be.not.null
            expect(localStorage.getItem('eddsa_public_key')).to.be.not.null
            expect(localStorage.getItem('eddsa_key')).to.be.not.null
            expect(localStorage.getItem('seed')).to.be.not.null
            expect(localStorage.getItem('schnorr')).to.be.not.null
            expect(localStorage.getItem('ethereum_address')).to.be.not.null
            expect(localStorage.getItem('eddsa')).to.be.not.null
        })
    })
})
describe('Asset details', () => {
    it('Should render html in asset description', () => {
        cy.login()
        cy.visit('/asset/061J529YVK747JYSJFG3XQZFQG')
        cy.contains('strong', 'bold')
        cy.contains('em', 'italics')
        cy.contains('ins', 'subbed')
    })
})

