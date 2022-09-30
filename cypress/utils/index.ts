import { RouteMatcher } from "cypress/types/net-stubbing";

export function waitForData(
    requestUrl: RouteMatcher = "http://65.109.11.42:9000/api",
    name = "waitForData"
) {
    // Intercepting request and naming it
    cy.intercept(requestUrl).as(name);
    // Waiting for the request
    cy.wait(`@${name}`);
}
