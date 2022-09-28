import {gql, useQuery} from "@apollo/client";
import AssetsTable from "../components/AssetsTable";
import devLog from "../lib/devLog";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import React, {useEffect} from "react";
import NewProjectButton from "../components/NewProjectButton";
import Link from "next/link";
import {useRouter} from "next/router";


const Assets = () => {
    const {conformTo, primaryAccountable} = useRouter().query;
    const filter: { primaryIntentsResourceInventoriedAsConformsTo?: string[],
        primaryIntentsResourceInventoriedAsPrimaryAccountable?: string[] } = {};
    // @ts-ignore
    conformTo && (filter['primaryIntentsResourceInventoriedAsConformsTo'] = [].concat(conformTo));
    // @ts-ignore
    primaryAccountable && (filter['primaryIntentsResourceInventoriedAsPrimaryAccountable'] = [].concat(primaryAccountable));
    devLog('filters', filter)
    const {t} = useTranslation('lastUpdatedProps')
    return (<div className="p-8">
        <div className="mb-6 w-96">
            <h1>{t('title')}</h1>
            <p className="my-2">{t('description')}</p>
            <NewProjectButton/>
            <Link href="https://github.com/dyne/interfacer-gui/issues/new">
                <a target="_blank" className="ml-2 normal-case btn btn-accent btn-outline btn-md">
                    {t('Report a bug')}
                </a>
            </Link>
        </div>
        <AssetsTable filter={filter}/>
    </div>)
}

export async function getStaticProps({locale}: any) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['signInProps', 'lastUpdatedProps', 'SideBarProps'])),
        },
    };
}

export default Assets
