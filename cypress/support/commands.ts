/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
// @ts-ignore
Cypress.Commands.add('login', (email: string, password: string) => {
    cy.intercept({
        method: 'POST',
        url: 'http://65.109.11.42:8000/api',
    }).as('api')
    cy.viewport('macbook-13')
    cy.visit('/sign_in')
    cy.get('button').first().should('be.visible').click()
    cy.get('input:first').should('be.visible').type(email)
    cy.get('button').first().click()
    cy.wait('@api').get('input').eq(0).should('be.visible').type(password)
        .get('button').eq(0).should('be.visible').click().get('button').eq(1).should('be.visible').click()
})
// Prevent TypeScript from reading file as legacy script
export {}
