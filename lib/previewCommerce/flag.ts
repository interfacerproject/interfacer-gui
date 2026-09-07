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

/**
 * Commerce preview feature flag.
 *
 * The whole "upcoming Medusa integration" demo (routes under
 * `pages/preview/commerce/*`, components under `components/previewCommerce/*`,
 * helpers under `lib/previewCommerce/*`) is reachable only when this is `true`.
 *
 * Default: `false`. Set `NEXT_PUBLIC_FF_COMMERCE_PREVIEW=true` only on the
 * demo deployment. With the flag off:
 *   - preview routes return `{ notFound: true }` from `getServerSideProps`
 *   - every entry point (nav item, buy block, cart icon) renders `null`
 *
 * Deleting this file, `lib/previewCommerce/`, `components/previewCommerce/`,
 * `pages/preview/commerce/` and the three flagged entry points removes the
 * feature completely — nothing else depends on it.
 */
export const commercePreviewEnabled = process.env.NEXT_PUBLIC_FF_COMMERCE_PREVIEW === "true";
