import type {NextPage} from 'next'
import {useAuth} from "../lib/auth";
// import User from "../components/UserActivities"
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {CheckCircleIcon} from "@heroicons/react/outline";
import Link from "next/link";
import React from "react";

export async function getStaticProps({ locale }:any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['signInProps', 'homeProps', 'SideBarProps'])),
    },
  };
}

const Home: NextPage = () => {
  const {t} = useTranslation('homeProps')
  const { isSignedIn } = useAuth()
  return (<>
        <div className="flex justify-between mb-6">
            <div className="w-128">
                <div className="logo mb-4"/>
                <h2>{t('title')}</h2>
                <p className="mt-4">
					<CheckCircleIcon className="w-5 h-5 float-left"/>
					{t('paragraph1')}</p>
                <p className="mt-4">
					<CheckCircleIcon className="w-5 h-5 float-left"/>
					{t('paragraph2')}</p>

                <Link href="/sign_in"><a className={`btn btn-primary mt-4 ${isSignedIn()? 'btn-disabled' : ''}`}>sign in</a></Link>
            </div>
            <div>
                {/*<Link href="/processes">*/}
                {/*    <a className="btn btn-outline font-medium normal-case btn-primary w-60 ml-4">*/}
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
           )};

export default Home


