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

import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { commercePreviewEnabled } from "./flag";

/**
 * Shared `getServerSideProps` for every `pages/preview/commerce/*` route: when
 * the feature flag is off the route does not exist (`notFound`), so the live
 * app is unchanged for normal users.
 */
export const previewCommerceGssp: GetServerSideProps = async ({ locale }) => {
  if (!commercePreviewEnabled) {
    return { notFound: true };
  }
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale ?? "en", ["common", "commercePreviewProps"])),
    },
  };
};
