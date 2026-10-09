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

export function arrayToMultilineString(a: Array<string>): string {
  return a.join("\n");
}

const messages = {
  permissionDenied: "You do not have permission to perform this action.",
  sessionRequired: "Your session could not be verified. Sign in before trying again.",
  signingFailed: "The request could not be signed. Restore your session before saving.",
  networkError: "The service could not be reached. Check whether your changes were saved before trying again.",
  invalidResponse:
    "The service returned an invalid response. Check whether your changes were saved before trying again.",
  conflict: "This item has changed. Review the latest version before saving again.",
  rateLimited: "Too many requests. Wait a moment before trying again.",
  serviceUnavailable: "The service is unavailable. Check whether your changes were saved before trying again.",
};

const codeKeys: Record<string, keyof typeof messages> = {
  FORBIDDEN: "permissionDenied",
  UNAUTHENTICATED: "sessionRequired",
  SIGNING_FAILED: "signingFailed",
  NETWORK_ERROR: "networkError",
  INVALID_RESPONSE: "invalidResponse",
  CONFLICT: "conflict",
  RATE_LIMITED: "rateLimited",
  SERVICE_UNAVAILABLE: "serviceUnavailable",
  HTTP_ERROR: "serviceUnavailable",
};

export function errorFormatter(e: any, translate?: (key: string) => string): string {
  const code = e?.code || e?.extensions?.code || e?.graphQLErrors?.[0]?.extensions?.code;
  const key =
    typeof code === "string" && Object.prototype.hasOwnProperty.call(codeKeys, code) ? codeKeys[code] : undefined;
  if (key) return translate ? translate("common:requestErrors." + key) : messages[key];
  if (typeof e?.message === "string" && e.message.trim()) return e.message;
  if (typeof e === "string" && e.trim()) return e;
  try {
    return JSON.stringify(e) || "The operation could not be completed.";
  } catch {
    return "The operation could not be completed.";
  }
}
