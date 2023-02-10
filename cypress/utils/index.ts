// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
  return cy.get(`[data-test="${id}"], #${id}`);
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
