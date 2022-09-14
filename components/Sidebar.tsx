import React, {useState} from 'react';
import Link from 'next/link';
import {ChatIcon, CubeIcon, HomeIcon, GlobeIcon, ChevronUpIcon, ChevronDownIcon} from "@heroicons/react/outline";
import LoginBtn from "./LoginMenu";
import {useRouter} from "next/router";
import IfSideBarButton from "./brickroom/IfSideBarButton";
import {useAuth} from "../lib/auth";
import {useTranslation} from "next-i18next";


function Sidebar() {
    const {t} = useTranslation('SideBarProps');
    const SideBarProps = {
        Home: { name: t('home'), link: "/", svg: <HomeIcon className="float-left w-5 h-5 mr-2"/> },
        createAsset: {
            name: t('createAsset'),
            link: '/create_asset',
            tag: 'NEW'
        },
        resources: {
            name: t('resources'),
            link: '/resources'
        },
        MyInventory: {
            name: t('myInventory'),
            link: '/my_inventory',
            disabled: true,
        },
        lastUpdated: {
            name: t('lastUpdated'),
            link: '/assets',
        },
        seeAll: {
            name: t('seeAll'),
            link: '/assets'
        },
        userGuide: {
            name: t('userGuide'),
            link: "/",
            svg: <ChatIcon className="float-left w-5 h-5 mr-2"/>,
            disabled: true,
        },
        map: {
            name: t('map'),
            link: "/",
            svg: <GlobeIcon className="float-left w-5 h-5 mr-2"/>,
            disabled: true,
        },
    }
    const [isAssetsMenuOpen, setIsAssetsMenuOpen] = useState(false)
    const router = useRouter()
    const isActive = (path: string) => path === router.asPath
    const isNewProcess = router.asPath === '/new_process'
    const {isSignedIn} = useAuth()
    return (<>
            <div className="overflow-y-auto bg-white border-r title w-72 text-primary-content border-primary">
                {!isNewProcess && <>
                    <div className="w-auto h-16 pt-4 mb-4 border-b border-primary">
                        <Link href="/">
                            <a>
                                <div className="mx-auto logo"/>
                            </a>
                        </Link>
                    </div>
                    <ul className="p-0">
                        <li>
                            <IfSideBarButton text={'Home'} link={'/'}
                                             svg={<HomeIcon className="float-left w-5 h-5 mr-2"/>}
                                             active={isActive('/')} w={64}/>
                        </li>
                        <li tabIndex={0}>
                            <a className="w-64 gap-2 pl-0 ml-4 font-medium normal-case border-0 btn btn-ghost text-primary hover:bg-amber-200">
                                <button className={`flex flex-row items-center pl-3 text-left h-full`}
                                        onClick={() => setIsAssetsMenuOpen(!isAssetsMenuOpen)}>
                                    <>
                                        <CubeIcon className="float-left w-5 h-5 mr-2"/>
                                        Assets
                                        {isAssetsMenuOpen ? <ChevronUpIcon className="float-right w-5 h-5 ml-32"/> :
                                            <ChevronDownIcon className="float-right w-5 h-5 ml-32"/>}
                                    </>
                                </button>
                            </a>
                            {isAssetsMenuOpen && <ul className="pl-4">
                                <li><IfSideBarButton w="60" text={t('createAsset')}
                                                     link={SideBarProps.createAsset.link}
                                                     active={isActive(SideBarProps.createAsset.link)} tag={SideBarProps.createAsset.tag}/></li>
                                <li><IfSideBarButton w="60" text={SideBarProps.MyInventory.name}
                                                     link={SideBarProps.MyInventory.link} disabled/></li>
                                <li><IfSideBarButton w="60" text={SideBarProps.lastUpdated.name}
                                                     link={SideBarProps.lastUpdated.link}/></li>
                                <li><IfSideBarButton w="60" text={SideBarProps.resources.name}
                                                     link={SideBarProps.resources.link}/></li>
                                <li><IfSideBarButton w="60" text={SideBarProps.seeAll.name}
                                                     link={SideBarProps.seeAll.link}/></li>
                            </ul>}
                        </li>
                        <li>
                            <IfSideBarButton text={SideBarProps.userGuide.name} link={SideBarProps.userGuide.link}
                                             svg={SideBarProps.userGuide.svg}
                                             disabled={true} w={64}/>
                        </li>
                        <li>
                            <IfSideBarButton text={SideBarProps.map.name} w={64} link={SideBarProps.map.link}
                                             svg={SideBarProps.map.svg} disabled={true}/>
                        </li>
                    </ul>
                    {isSignedIn() && <span className="inline-block align-bottom">
					<LoginBtn/>
				</span>}
                </>}
            </div>
        </>
    )
}

export default Sidebar;
