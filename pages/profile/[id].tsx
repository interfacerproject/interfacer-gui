import type {NextPage} from 'next'
import {useAuth} from "../../hooks/useAuth";
import {gql, useQuery} from "@apollo/client";
import {useRouter} from "next/router";
import Spinner from "../../components/brickroom/Spinner";
import ResourceTable from "../../components/ResourceTable";
import devLog from "../../lib/devLog";
import Avatar from "boring-avatars";
import React from "react";
import AssetsTable from "../../components/AssetsTable";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {GetStaticPaths} from "next";
import {useTranslation} from "next-i18next";
import {ArrowSmUpIcon} from "@heroicons/react/solid";


const Profile: NextPage = () => {
    const router = useRouter()
    const {id, conformTo} = router.query
    const {t} = useTranslation('ProfileProps')
    const FETCH_USER = gql(`query($id:ID!) {
  person(id:$id) {
    id
    name
    email
    user
    ethereumAddress
    primaryLocation {
      name
      mappableAddress
    }
  }
}`)
    const {user} = useAuth()
    const isUser: boolean = (id === 'my_profile' || id === user?.ulid)
    const idToBeFetch = isUser ? user?.ulid : id
    const person = useQuery(FETCH_USER, {variables: {id: idToBeFetch}}).data?.person
    devLog('person', person)
    const filter = {primaryIntentsResourceInventoriedAsPrimaryAccountable: idToBeFetch}
    if (conformTo) {
        // @ts-ignore
        filter['primaryIntentsResourceInventoriedAsConformsTo'] = conformTo.split(',')
    }
    devLog(user)
    const tabsArray = [
        // {title: 'Activity', component: <EventTable economicEvents={user?.economicEvents}/>},
        {
            title: 'Inventory',
            component: <ResourceTable/>
        }
    ]
    return (<>
        {!person && <Spinner/>}
        {person && <>
            <div className="relative">
                <div className='w-full bg-center bg-cover h-72'
                     style={{backgroundImage: "url('/profile_bg.jpeg')", filter: "blur(1px)"}}/>
                <div className="absolute w-full p-2 bottom-8 top-2 md:p-0 md:bottom-12 md:h-100">
                    <div className="grid grid-cols-1 px-2 pt-8 md:grid-cols-2 md:pl-8">
                        <div className="flex flex-col">
                            <div className="flex flex-row">
                                <h2 className="pt-5 mb-6 mr-2">
                                    {t("hi")}, <span className="text-primary">{user?.name}</span>
                                </h2>
                                <div className="w-10 rounded-full">
                                    <Avatar
                                        size={'full'}
                                        name={user?.name}
                                        variant="beam"
                                        colors={["#F1BD4D", "#D8A946", "#02604B", "#F3F3F3", "#014837"]}
                                    />
                                </div>
                            </div>
                            <p>{t('description')} </p>
                            <h4 className="mt-2">{t('lorem ipsum')} <span className="text-primary">{t('dolor sit amet')}</span></h4>
                        </div>
                        <div className="flex flex-col">
                            <div className="grid w-full p-4 mx-auto bg-white border-2 rounded h-60 md:w-4/5 gid-cols-1">
                                    <div className="border-b-2">
                                        <h2 className="mb-2">{t('goals')}</h2>
                                        <span className="text-2xl text-primary">20,897</span>
                                        <span className="text-slate-300"> from 12,946</span>
                                        <span className="grid float-right grid-cols-2 px-2 py-1 pl-4 mt-1 bg-green-100 rounded-full text-primary">
                                            <ArrowSmUpIcon className="w-5 h-5 text-green-500"/><span>12%</span>
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="my-2">{t('strength')}</h2>
                                        <span className="text-2xl text-primary">71,897</span>
                                        <span className="text-slate-300"> from 70,946</span>
                                        <span className="grid float-right grid-cols-2 px-2 py-1 pl-4 mt-1 bg-green-100 rounded-full text-primary">
                                            <ArrowSmUpIcon className="w-5 h-5 text-green-500"/><span>40%</span>
                                        </span>
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 px-2 pt-8 md:grid-cols-2 md:pl-8">

                <div id="tabs" className="my-6 space-x-4">
                    <button className="px-12 text-black bg-gray-300 border-0 rounded-lg btn">{t('activity by the user')}
                    </button>
                    <span className="invisible rounded-lg btn btn-disabled lg:visible">{t('saved list')}</span>
                </div>
            </div>
            <div className="grid grid-cols-1 px-2 md:px-8 pt">
                <AssetsTable filter={filter} noPrimaryAccountableFilter/>
            </div>
        </>}
    </>)
};
export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {

    return {
        paths: [], //indicates that no page needs be created at build time
        fallback: 'blocking' //indicates the type of fallback
    }
}

export async function getStaticProps({locale}: any) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['signInProps', 'lastUpdatedProps', 'SideBarProps', 'ProfileProps'])),
        },
    };
}

export default Profile


