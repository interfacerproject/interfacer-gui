describe("When user is not logged in", () => {
    it('Should see /', () => {
        cy.visit('/')
        cy.contains('Building the digital infrastructure for Fab Cities')
    })

    it('Should see /sign_in', () => {
        cy.visit('/sign_in')
        cy.contains('Welcome')
    })

    it('Should see /sign_up', () => {
        cy.visit('/sign_up')
        cy.contains('Welcome!')
    })
})
