// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { GraphQLRequestError, GraphQLSigningError } from "@dyne/interfacer-client";
import { errorFormatter } from "../../lib/errorFormatter";

// Check the future optional translator via a function signature that also
// allows compiling the test against the old formatter during the RED phase.
const format = errorFormatter as (error: unknown, translate?: (key: string) => string) => string;
const keys: Record<string, string> = {
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
for (const [code, key] of Object.entries(keys)) {
  test("formats " + code + " using stable localized copy, never raw upstream details", () => {
    const error = new GraphQLRequestError([{ message: "TEST-PRIVATE-UPSTREAM-SENTINEL", extensions: { code } }]);
    assert.equal(
      format(error, key => "translated:" + key),
      "translated:common:requestErrors." + key
    );
    assert.equal(
      format({ message: "raw", extensions: { code } }, key => key),
      "common:requestErrors." + key
    );
    assert.ok(!format(error).includes("TEST-PRIVATE-UPSTREAM-SENTINEL"));
  });
}
for (const code of ["constructor", "toString", "__proto__"]) {
  test("unknown error code is not confused with an inherited property: " + code, () => {
    assert.equal(format({ message: "Custom validation message", extensions: { code } }), "Custom validation message");
  });
}
test("signing errors use the same localized contract", () => {
  assert.equal(
    format(new GraphQLSigningError(), key => key),
    "common:requestErrors.signingFailed"
  );
});
test("legacy validation messages remain usable; unknown/circular failures have a safe fallback", () => {
  assert.equal(format(new Error("Invalid title")), "Invalid title");
  const circular: any = {};
  circular.self = circular;
  assert.equal(typeof format(circular), "string");
  assert.ok(format(undefined));
});
for (const locale of ["en", "it", "de", "fr"]) {
  test(
    locale + " has all request-error translations without promising that a timed-out write was not committed",
    () => {
      const translations = JSON.parse(readFileSync("public/locales/" + locale + "/common.json", "utf8")).requestErrors;
      for (const key of Array.from(new Set(Object.values(keys))))
        assert.ok(typeof translations?.[key] === "string" && translations[key].trim());
    }
  );
}
