import React, { useState } from 'react';
import Link from 'next/link';

import {ChatIcon, CubeIcon, HomeIcon, GlobeIcon, ChevronUpIcon, ChevronDownIcon} from "@heroicons/react/outline";
import LoginBtn from "./LoginMenu";
import { useRouter } from "next/router";
import IfSideBarButton from "./brickroom/IfSideBarButton";
import { useAuth } from "../lib/auth";

const SideBarProps = {
	home: {
		name: 'Home',
		link: "/",
		svg: <HomeIcon className="w-5 h-5 float-left mr-2"/>
	},
	createAsset: {
		name: 'Create asset',
		link: '/create_project'
	},
	resources: {
		name: 'Economic Resources',
		link: '/resources'
	},
	MyInventory: {
		name: 'My inventory',
		link: '/my_inventory',
		disabled: true,
	},
	lastUpdated: {
		name: 'Last updated',
		link: '/',
		disabled: true,
	},
	seeAll: {
		name: 'See all',
		link: '/assets',
		disabled: true
	},
	userGuide: {
		name: 'User guide',
		link: "/",
		svg: <ChatIcon className="w-5 h-5 float-left mr-2"/>,
		disabled: true,
	},
	map: {
		name: 'Map',
		link: "/",
		svg: <GlobeIcon className="w-5 h-5 float-left mr-2"/>,
		disabled: true,
	},
}

function Sidebar() {
	const [isAssetsMenuOpen, setIsAssetsMenuOpen] = useState(false)
	const router = useRouter()
	const isActive = (path: string) => path === router.asPath
	const isNewProcess = router.asPath === '/new_process'
	const { isSignedIn } = useAuth()
	return (<>
		<div className="title overflow-y-auto w-72 text-primary-content bg-white border-r border-primary">
			{!isNewProcess && <>
				<div className="w-auto h-16 pt-4 mb-4 border-b border-primary">
					<Link href="/">
						<a>
							<div className="logo mx-auto" />
						</a>
					</Link>
				</div>
				<ul className="p-0">
					<li>
						<IfSideBarButton text={'home'} link={'/'}
							 svg={<HomeIcon className="w-5 h-5 float-left mr-2"/>}
							active={isActive('/')} w={64} />
					</li>
					<li tabIndex={0}>
						<a className="ml-4 w-64 gap-2 pl-0 btn btn-ghost font-medium normal-case text-primary border-0 hover:bg-amber-200">
							<button className={`flex flex-row items-center pl-3 text-left h-full`}
								onClick={() => setIsAssetsMenuOpen(!isAssetsMenuOpen)}>
								<>
									<CubeIcon className="w-5 h-5 float-left mr-2"/>
									Assets
									{isAssetsMenuOpen ? <ChevronUpIcon className="w-5 h-5 float-right ml-32"/> :
                                            <ChevronDownIcon className="w-5 h-5 float-right ml-32"/>}
								</>
							</button>
						</a>
						{isAssetsMenuOpen && <ul className="pl-4">
							<li><IfSideBarButton w="60" text={SideBarProps.createAsset.name}
								link={SideBarProps.createAsset.link}
								active={isActive(SideBarProps.createAsset.link)} /></li>
							<li><IfSideBarButton w="60" text={SideBarProps.MyInventory.name}
								link={SideBarProps.MyInventory.link} disabled /></li>
							<li><IfSideBarButton w="60" text={SideBarProps.lastUpdated.name}
								link={SideBarProps.lastUpdated.link} disabled /></li>
							<li><IfSideBarButton w="60" text={SideBarProps.resources.name}
								link={SideBarProps.resources.link} /></li>
							<li><IfSideBarButton w="60" text={SideBarProps.seeAll.name}
								link={SideBarProps.seeAll.link} /></li>
						</ul>}
					</li>
					<li>
						<IfSideBarButton text={SideBarProps.userGuide.name} link={SideBarProps.userGuide.link}
							 svg={SideBarProps.userGuide.svg}
							active={isActive(SideBarProps.userGuide.link)} disabled={true} w={64} />
					</li>
					<li>
						<IfSideBarButton text={SideBarProps.map.name} w={64} link={SideBarProps.map.link}
							 svg={SideBarProps.map.svg}
							active={isActive(SideBarProps.map.link)}
							disabled={true} />
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
