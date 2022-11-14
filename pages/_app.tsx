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
