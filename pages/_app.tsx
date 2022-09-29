import Head from 'next/head'
import '../styles/globals.scss'
import type {AppProps} from 'next/app'
import {AuthProvider} from '../lib/auth'
import Layout from "../components/layout/Layout";
import {appWithTranslation} from 'next-i18next';
import {NextPage} from "next";
import {ReactElement, ReactNode} from "react";


export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout
}

function MyApp({Component, pageProps}: AppPropsWithLayout) {
    // Use the layout defined at the page level or default layout
    const getLayout = Component.getLayout || ((page: ReactElement) => <Layout>{page}</Layout>)
    return (<>
            <Head>
                <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
            </Head>
            <AuthProvider>
                {getLayout(<Component {...pageProps} />)}
            </AuthProvider>
        </>

    )
}

export default appWithTranslation(MyApp)
