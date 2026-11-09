// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// Kept for old links: Offer became Start selling.

export async function getServerSideProps() {
  return { redirect: { destination: "/market/start-selling", permanent: false } };
}

export default function Redirect() {
  return null;
}
