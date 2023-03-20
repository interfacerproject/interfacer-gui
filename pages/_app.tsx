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
  const iubenda = `(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);`;

  return (
    <AppProvider i18n={enTranslations}>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <script type="text/javascript" dangerouslySetInnerHTML={{ __html: iubenda }} />
      </Head>
      <AuthProvider publicPage={publicPage}>{getLayout(<Component {...pageProps} />)}</AuthProvider>
      <a
        href="https://www.iubenda.com/privacy-policy/75616407"
        className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe "
        title="Privacy Policy "
      >
        {"Privacy Policy"}
      </a>
    </AppProvider>
  );
}

export default appWithTranslation(MyApp);
