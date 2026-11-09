// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// Kept for old links: My sales became the Selling dashboard.

export async function getServerSideProps() {
  return { redirect: { destination: "/market/selling", permanent: false } };
}

export default function Redirect() {
  return null;
}
