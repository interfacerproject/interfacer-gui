import type { NextPage } from 'next'
import { useAuth } from "../lib/auth";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { CheckCircleIcon } from "@heroicons/react/outline";
import Link from "next/link";
import React from "react";
import { LightningBoltIcon, ScaleIcon, GlobeAltIcon } from "@heroicons/react/outline";

export async function getStaticProps({ locale }: any) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['signInProps', 'homeProps', 'SideBarProps'])),
        },
    };
}

const Home: NextPage = () => {
    const { t } = useTranslation('homeProps')
    const { isSignedIn } = useAuth()
    const features = [
        { icon: <LightningBoltIcon />, },
        { icon: <ScaleIcon /> },
        { icon: <GlobeAltIcon /> },
        { icon: <LightningBoltIcon />, },
        { icon: <ScaleIcon /> },
        { icon: <GlobeAltIcon /> },
    ]

    return (<>
        <div className="pl-32 flex items-center bg-[#f8f7f4] w-full bg-right bg-no-repeat bg-contain h-[596px] bg-[url('/bg_nru_md.svg')]">
            <div className="mt-40">
                <div className="mb-6 logo" />
                <h2 className="text-3xl">{t('title')}</h2>
                <p className="flex items-center mt-8">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    {t('paragraph1')}</p>
                <p className="flex items-center mt-2">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    {t('paragraph2')}</p>

                <Link href="/sign_in"><a className={`btn btn-primary mt-6 ${isSignedIn() ? 'btn-disabled' : ''}`}>{t('cta_1')}</a></Link>
                <Link href="/">
                    <a className="ml-4 btn btn-outline btn-primary">{t('cta_2')}</a>
                </Link>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-16 pl-32 mt-44">
            {features.map((f, i) => {
                return (<div key={i} className="flex flex-col">
                    <div className="w-12 h-12 p-3 mr-2 text-white rounded-lg bg-[#5DA091]">{f.icon}</div>
                    <h3 className="mt-5 mb-2">{t(`feature_title_${i}`)}</h3>
                    <p className="text-[#8a8e96]">{t(`feature_body_${i}`)}</p>
                </div>)
            })}
        </div>
    </>
    )
};

export default Home


