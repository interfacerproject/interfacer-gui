export function randomString() {
    return Math.random().toString(32).substring(2);
}

export function randomEmail() {
    return `${randomString()}@${randomString()}.com`;
}

export function getTextInput() {
    return cy.get("input[type=text]");
}
