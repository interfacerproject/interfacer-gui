export function randomString(length = 5) {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
}

export function randomEmail() {
    return `${randomString()}@${randomString()}.com`;
}

export function getTextInput() {
    return cy.get("input[type=text]");
}
