// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.

import assert from "node:assert/strict";
import { test } from "node:test";
import { displayNote } from "../../lib/market/note";

const M = "interfacer-sync=ifzs-0123456789abcdef0123456789abcdef";

test("a note made only of the marketplace sync marker displays as nothing", () => {
  assert.equal(displayNote(`interfacer-marketplace produce ${M}`), "");
  assert.equal(displayNote(`interfacer-marketplace transfer ${M}`), "");
  assert.equal(displayNote(`interfacer-marketplace raise ${M}`), "");
  assert.equal(displayNote(M), "");
  // Event notes also carry the Medusa order id.
  assert.equal(displayNote(`interfacer-marketplace transfer order=order_01M7KBRBE0XDXV8YRYAY8M6NV3 ${M}`), "");
});

test("human text around the marker is kept, the marker is dropped", () => {
  assert.equal(displayNote(`A PETG lamp shade, printed in Berlin. ${M}`), "A PETG lamp shade, printed in Berlin.");
  assert.equal(displayNote(`Line one\n\nLine two ${M}`), "Line one\n\nLine two");
});

test("ordinary notes are untouched", () => {
  assert.equal(displayNote("An open hardware lamp"), "An open hardware lamp");
  assert.equal(
    displayNote("We discuss interfacer-marketplace ideas here"),
    "We discuss interfacer-marketplace ideas here"
  );
  assert.equal(displayNote(""), "");
  assert.equal(displayNote(null), "");
  assert.equal(displayNote(undefined), "");
});
