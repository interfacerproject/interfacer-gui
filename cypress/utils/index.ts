export function randomString(length = 5) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function randomEmail() {
  return `${randomString()}@${randomString()}.com`;
}

export function getTextInput() {
  return cy.get("input[type=text]");
}

//

export function get(id: string) {
  return cy.get(`[data-test="${id}"]`);
}

//

const request = "request";

export interface InterceptArgs {
  url?: string;
  name?: string;
  method?: string;
}

export function intercept(args?: InterceptArgs) {
  const { url = Cypress.env("NEXT_PUBLIC_ZENFLOWS_URL") as string, name = request, method = "GET" } = args || {};

  return cy
    .intercept({
      url,
      method,
    })
    .as(name);
}

export function waitForData(name = request) {
  return cy.wait(`@${name}`);
}
