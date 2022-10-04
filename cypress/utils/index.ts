import { RouteMatcher } from "cypress/types/net-stubbing";

export function waitForData(
    requestUrl: RouteMatcher = "http://65.109.11.42:9000/api",
    name = "waitForData"
) {
    // Intercepting request and naming it
    cy.intercept(requestUrl).as(name);
    // Waiting for the request
    cy.wait(`@${name}`);

export function randomString() {
    return Math.random().toString(32).substring(2);
}

export function randomEmail() {
    return `${randomString()}@${randomString()}.com`;
}

export function getTextInput() {
    return cy.get("input[type=text]");
}
