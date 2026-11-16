// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// The marketplace outbox tags the Zenflows resources and events it writes with
// `interfacer-sync=<marker>` in the note (the field its reconciliation searches),
// prefixed by `interfacer-marketplace <action>`. That text is bookkeeping, not a
// description: strip it wherever a note is shown to people.

const MARKER = /\s*interfacer-sync=ifzs-[0-9a-f]+/g;
const MACHINE_ONLY = /^interfacer-marketplace(\s+[a-z]+)?(\s+order=\S+)?$/;

export function displayNote(note: string | null | undefined): string {
  if (!note) return "";
  if (!note.includes("interfacer-sync=")) return note;
  const text = note.replace(MARKER, "").trim();
  return MACHINE_ONLY.test(text) ? "" : text;
}
