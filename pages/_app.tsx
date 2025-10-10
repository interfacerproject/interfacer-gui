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

import "@fontsource/ibm-plex-sans";
import "@fontsource/space-grotesk";

import Layout from "components/layout/Layout";
import { AuthProvider } from "contexts/AuthContext";
import { NextPage } from "next";
import { appWithTranslation } from "next-i18next";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ReactElement, ReactNode } from "react";
import "styles/globals.scss";

import { AppProvider } from "@bbtgnn/polaris-interfacer";
import enTranslations from "@bbtgnn/polaris-interfacer/locales/en.json";

//

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
  publicPage?: boolean;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level or default layout
  const getLayout = Component.getLayout || ((page: ReactElement) => <Layout>{page}</Layout>);
  const publicPage = Component.publicPage || false;

  return (
    <AppProvider i18n={enTranslations}>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <AuthProvider publicPage={publicPage}>{getLayout(<Component {...pageProps} />)}</AuthProvider>
     </AppProvider>
  );
}

export default appWithTranslation(MyApp);
