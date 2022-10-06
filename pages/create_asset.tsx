import Layout from "../components/layout/CreateProjectLayout";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {ChangeEvent, ReactElement, useEffect, useState} from "react";
import {useAuth} from "../lib/auth";
import type {NextPageWithLayout} from './_app'
import NewAssetForm from "../components/NewAssetForm";
import ControlWindow from "../components/ControlWindow";

const CreateProject: NextPageWithLayout = () => {
    const {authId} = useAuth()
    const [logs, setLogs] = useState([`info: user ${authId}`] as string[])
    const {t} = useTranslation('createProjectProps')

    return (<div className="grid grid-cols-1 gap-4 p-8 md:grid-cols-12">
        <div className="w-full md:col-start-2 md:col-end-8">
            <div className="w-80">
                <h2 className="text-primary">{t('headline.title')} </h2>
                <p>{t('headline.description')}</p>
            </div>
            <br/>
            <NewAssetForm logs={logs} setLogs={setLogs}/>
        </div>
        <div className="w-full md:col-start-8 md:col-end-12">
            <ControlWindow logs={logs}/>
        </div>
    </div>)
};

export async function getStaticProps({locale}: any) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['createProjectProps', 'signInProps', 'SideBarProps', 'SideBarProps'])),
        },
    };
}


CreateProject.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            {page}
        </Layout>
    )
}

export default CreateProject




