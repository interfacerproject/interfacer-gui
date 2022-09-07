import type { NextPage } from 'next'
import { useAuth } from "../lib/auth";
// import User from "../components/UserActivities"
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { CheckCircleIcon } from "@heroicons/react/outline";
import Link from "next/link";
import React from "react";

export async function getStaticProps({ locale }: any) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['signInProps', 'homeProps'])),
        },
    };
}

const Home: NextPage = () => {
    const { t } = useTranslation('homeProps')
    const { isSignedIn } = useAuth()
    return (<>
        <div className="flex justify-between p-8 mb-6">
            <div className="w-128">
                <div className="mb-4 logo" />
                <h2>{t('title')}</h2>
                <p className="mt-4">
                    <CheckCircleIcon className="float-left w-5 h-5" />
                    {t('paragraph1')}</p>
                <p className="mt-4">
                    <CheckCircleIcon className="float-left w-5 h-5" />
                    {t('paragraph2')}</p>

                <Link href="/sign_in"><a className={`btn btn-primary mt-4 ${isSignedIn() ? 'btn-disabled' : ''}`}>sign in</a></Link>
            </div>
            <div>
                {/*<Link href="/processes">*/}
                {/*    <a className="ml-4 font-medium normal-case btn btn-outline btn-primary w-60">*/}
                {/*        See all process*/}
                {/*    </a>*/}
                {/*</Link>*/}
            </div>
        </div>
        {/*{activities && <ul>*/}
        {/*    <RenderActivities userActivities={activities}/>*/}
        {/*</ul>}*/}
        {/*{!activities && <Spinner/>}*/}
    </>
    )
};

export default Home


