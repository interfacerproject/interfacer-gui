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
 * Homepage.
 *
 * Rebuilt against the DTEC prototype:
 *   1920 https://www.figma.com/design/fZm62oTpY4srzipfiBQ1vR?node-id=943-60815
 *   1400 …node-id=943-62082 · 1080 …node-id=943-63406 · 780 …node-id=943-64673
 *
 * Each band is a section component under components/partials/home/.
 */

import Layout from "components/layout/Layout";
import HomeConceptsSection from "components/partials/home/HomeConceptsSection";
import HomeDesignsSection from "components/partials/home/HomeDesignsSection";
import HomeFundersSection from "components/partials/home/HomeFundersSection";
import HomeHero from "components/partials/home/HomeHero";
import HomeMapSection from "components/partials/home/HomeMapSection";
import HomeOpenSourceSection from "components/partials/home/HomeOpenSourceSection";
import HomePathwaysSection from "components/partials/home/HomePathwaysSection";
import HomeProductsSection from "components/partials/home/HomeProductsSection";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "./_app";

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, [
        "common",
        "signInProps",
        "homeProps",
        "SideBarProps",
        "lastUpdatedProps",
      ])),
    },
  };
}

const Home: NextPageWithLayout = () => (
  <>
    <HomeHero />
    <HomePathwaysSection />
    <HomeDesignsSection />
    <HomeMapSection />
    <HomeProductsSection />
    <HomeConceptsSection />
    <HomeOpenSourceSection />
    <HomeFundersSection />
  </>
);

Home.publicPage = true;
// The prototype runs the funders band straight into the footer, with no gap.
Home.getLayout = page => <Layout bottomPadding="none">{page}</Layout>;

export default Home;
