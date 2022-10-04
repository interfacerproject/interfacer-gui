import type {NextPage} from 'next'
import {useAuth} from "../../lib/auth";
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
    const {authId, authUsername, authName, authEmail} = useAuth()
    const isUser: boolean = (id === 'my_profile' || id === authId)
    const idToBeFetch = isUser ? authId : id
    const user = useQuery(FETCH_USER, {variables: {id: idToBeFetch}}).data?.person
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
        {!user && <Spinner/>}
        {user && <>
            <div className="grid grid-cols-1 md:grid-cols-2 md:pl-8 px-2 pt-8">
                <div className="flex flex-col">
                    <div className="flex flex-row">
                        <h2 className="mb-6 pt-5 mr-2">
                            {t("hi")}, <span className="text-primary">{user?.name}</span>
                        </h2>
                        <div className="w-10 rounded-full">
                            <Avatar
                                size={'full'}
                                name={authUsername}
                                variant="beam"
                                colors={["#F1BD4D", "#D8A946", "#02604B", "#F3F3F3", "#014837"]}
                            />
                        </div>
                    </div>
                    <p>{t('description')} </p>
                    <h4 className="mt-2">Lorem ipsum <span className="text-primary">Dolor sit amet</span></h4>
                </div>
                <div className="flex flex-col">
                    <div className="border-2 rounded h-60 w-full md:w-4/5 mx-auto p-4">
                        <h2>{t('your stats')}:</h2>
                        <p className="my-8">{t('statText')}</p>
                        <div className="grid grid-cols-2">
                            <div>
                                <span className="text-4xl">&#127919; 120</span>
                                <h3 className="text-slate-300">{t('goals')}</h3>
                            </div>
                            <div>
                                <span className="text-4xl">&#x1F4AA; 84</span>
                                <h3 className="text-slate-300">{t('strength')}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="tabs" className="my-6 space-x-4">
                    <button className="px-12 text-black bg-gray-300 border-0 rounded-lg btn">{t('activity by the user')}
                    </button>
                    <span className="rounded-lg btn btn-disabled invisible lg:visible">Saved list</span>
                </div>
            </div>
            <div className="grid grid-cols-1 md:px-8 px-2 pt">
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


