// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// Kept for old links: The build journey now lives in the catalogue's Built on demand view.

export async function getServerSideProps() {
  return { redirect: { destination: "/market?view=build", permanent: false } };
}

export default function Redirect() {
  return null;
}
