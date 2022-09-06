import '../styles/globals.scss'
import type { AppProps } from 'next/app'
import { AuthProvider } from '../lib/auth'
import Layout from "../components/layout";
import { appWithTranslation } from 'next-i18next';

function MyApp({ Component, pageProps }: AppProps) {
    return (
    <AuthProvider>
        <Layout>
            <Component {...pageProps} />
        </Layout>
    </AuthProvider>
  )
}

export default  appWithTranslation(MyApp)
