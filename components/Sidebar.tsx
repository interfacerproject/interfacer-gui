import React, { useState } from 'react';
import Link from 'next/link';
import { BriefcaseIcon, ChatIcon, CubeIcon, HomeIcon, GlobeIcon, ChevronUpIcon, ChevronDownIcon, SupportIcon, } from "@heroicons/react/outline";
import LoginBtn from "./LoginMenu";
import { useRouter } from "next/router";
import IfSideBarButton from "./brickroom/IfSideBarButton";
import { useAuth } from "../lib/auth";
import { useTranslation } from "next-i18next";


function Sidebar() {
    const { t } = useTranslation('SideBarProps');
    const SideBarProps = {
        Home: { name: t('home'), link: "/", svg: <HomeIcon className="float-left w-5 h-5 mr-2" /> },
        createAsset: {
            name: t('create_asset'),
            link: '/create_asset',
            tag: 'NEW'
        },
        myAsset: {
            name: t('my_assets'),
            link: '/profile/my_profile',
        },
        latestAssets: {
            name: t('latest_assets'),
            link: '/assets',
        },
        resources: {
            name: t('imported_losh'),
            link: '/resources',
            tag: 'NEW'
        },
        reportBug: {
            name: t('report_bug'),
            link: 'https://github.com/dyne/interfacer-gui/issues/new',
            svg: <SupportIcon className="float-left w-5 h-5 mr-2" />,
            target: '_blank'
        },
        userGuide: {
            name: t('user_guide'),
            link: "/",
            svg: <ChatIcon className="float-left w-5 h-5 mr-2" />,
            disabled: true,
        },
        map: {
            name: t('map'),
            link: "/",
            svg: <GlobeIcon className="float-left w-5 h-5 mr-2" />,
            disabled: true,
        },
    }
    const [isAssetsMenuOpen, setIsAssetsMenuOpen] = useState(false)
    const [isMyStuffMenuOpen, setIsMyStuffMenuOpen] = useState(false)
    const router = useRouter()
    const isActive = (path: string) => path === router.asPath
    const isNewProcess = router.asPath === '/new_process'
    const { isSignedIn } = useAuth()
    return (<>
        <div className="overflow-y-auto bg-white border-r title w-72 text-primary-content border-primary">
            {!isNewProcess && <>
                <div className="w-auto h-16 pt-4 mb-4 border-b border-primary">
                    <Link href="/">
                        <a>
                            <div className="mx-auto logo" />
                        </a>
                    </Link>
                </div>
                <ul className="p-0">
                    <li>
                        <IfSideBarButton text={'Home'} link={'/'}
                            svg={<HomeIcon className="float-left w-5 h-5 mr-2" />}
                            active={isActive('/')} w={64} />
                    </li>
                    <li tabIndex={0}>
                        <a className="w-64 gap-2 pl-0 ml-4 font-medium normal-case border-0 btn btn-ghost text-primary hover:bg-amber-200">
                            <button className={`ml-3 flex justify-between w-full`}
                                onClick={() => setIsMyStuffMenuOpen(!isMyStuffMenuOpen)}>
                                <div className="flex items-center space-x-2">
                                    <BriefcaseIcon className="w-5 h-5" />
                                    <span className="whitespace-nowrap">{t('my_stuff')}</span>
                                </div>
                                {isMyStuffMenuOpen ? <ChevronUpIcon className="w-5 h-5" /> :
                                    <ChevronDownIcon className="w-5 h-5" />}
                            </button>
                        </a>
                        {isMyStuffMenuOpen && <ul className="pl-4">
                            <li>
                                <IfSideBarButton w="60" text={t('create_asset')} link={SideBarProps.createAsset.link} active={isActive(SideBarProps.createAsset.link)} tag={SideBarProps.createAsset.tag} />
                            </li>
                            <li>
                                <IfSideBarButton w="60" text={SideBarProps.myAsset.name}
                                    link={SideBarProps.myAsset.link} />
                            </li>
                        </ul>}
                    </li>
                    <li>
                        <a className="w-64 gap-2 pl-0 ml-4 font-medium normal-case border-0 btn btn-ghost text-primary hover:bg-amber-200">
                            <button className={`ml-3 flex justify-between w-full`}
                                onClick={() => setIsAssetsMenuOpen(!isAssetsMenuOpen)}>
                                <div className="flex items-center space-x-2">
                                    <CubeIcon className="w-5 h-5" />
                                    <span className="whitespace-nowrap">{t('assets')}</span>
                                </div>
                                {isAssetsMenuOpen ? <ChevronUpIcon className="w-5 h-5" /> :
                                    <ChevronDownIcon className="w-5 h-5" />}
                            </button>
                        </a>
                        {isAssetsMenuOpen && <ul className="pl-4">
                            <li>
                                <IfSideBarButton w="60" text={SideBarProps.latestAssets.name} link={SideBarProps.latestAssets.link} />
                            </li>
                            <li>
                                <IfSideBarButton w="60" text={SideBarProps.resources.name} tag={SideBarProps.resources.tag} link={SideBarProps.resources.link} />
                            </li>
                        </ul>}
                    </li>
                    <li>
                        <IfSideBarButton w={64} target="_blank"
                            text={SideBarProps.reportBug.name}
                            link={SideBarProps.reportBug.link}
                            svg={SideBarProps.reportBug.svg}
                        />
                    </li>
                    <li>
                        <IfSideBarButton disabled={true} w={64}
                            text={SideBarProps.userGuide.name}
                            link={SideBarProps.userGuide.link}
                            svg={SideBarProps.userGuide.svg}
                        />
                    </li>
                    <li>
                        <IfSideBarButton disabled={true} w={64}
                            text={SideBarProps.map.name}
                            link={SideBarProps.map.link}
                            svg={SideBarProps.map.svg} />
                    </li>
                </ul>
                {isSignedIn() && <span className="inline-block align-bottom">
                    <LoginBtn />
                </span>}
            </>}
        </div>
    </>
    )
}

export default Sidebar;
