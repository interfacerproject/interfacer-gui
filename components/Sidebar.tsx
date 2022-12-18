import Link from "next/link";

import { useTranslation } from "next-i18next";
import { useAuth } from "../hooks/useAuth";

import IfSidebarDropdown from "./brickroom/IfSidebarDropdown";
import { IfSidebarItemProps } from "./brickroom/IfSidebarItem";
import IfSideBarLink, { IfSideBarLinkProps } from "./brickroom/IfSideBarLink";
import LoginBtn from "./LoginMenu";

import {
  BellIcon,
  BriefcaseIcon,
  ChatIcon,
  CubeIcon,
  GlobeIcon,
  HomeIcon,
  SupportIcon,
} from "@heroicons/react/outline";
import cn from "classnames";
import React, { useState } from "react";

function Sidebar({ closed, setIsClosed }: { closed: boolean; setIsClosed: (c: boolean) => void }) {
  const { t } = useTranslation("SideBarProps");

  // Links
  const items: Record<string, IfSideBarLinkProps> = {
    home: {
      text: t("Home"),
      link: "/",
      leftIcon: <HomeIcon className="w-5 h-5" />,
    },
    // Dropdown -> My stuff
    createAsset: {
      text: t("Create Assets"),
      link: "/create_asset",
      leftIcon: <CubeIcon className="w-5 h-5" />,
      // tag: "NEW",
    },
    myAssets: {
      text: t("My Assets"),
      link: "/profile/my_profile",
    },
    notification: {
      text: t("Notifications"),
      link: "/notification",
      leftIcon: <BellIcon className="w-5 h-5" />,
    },
    // Dropdown -> Assets
    latestAssets: {
      text: t("Assets"),
      link: "/assets",
    },
    resources: {
      text: t("Imported from LOSH"),
      link: "/resources",
      // tag: "NEW",
    },
    my_list: {
      text: t("My list"),
      link: "/profile/my_profile?tab=1",
    },
    reportBug: {
      text: t("Report a bug"),
      link: "https://github.com/dyne/interfacer-gui/issues/new",
      leftIcon: <SupportIcon className="w-5 h-5" />,
      target: "_blank",
    },
    userGuide: {
      text: t("User manual"),
      link: "https://interfacerproject.github.io/interfacer-docs/#/",
      leftIcon: <ChatIcon className="w-5 h-5" />,
      target: "_blank",
    },
    map: {
      text: t("Map"),
      link: "/",
      leftIcon: <GlobeIcon className="w-5 h-5" />,
      disabled: true,
    },
  };

  // Dropdown items
  const drItems: Record<string, IfSidebarItemProps> = {
    assets: {
      text: t("Assets"),
      leftIcon: <CubeIcon className="w-5 h-5" />,
    },
    myStuff: {
      text: t("Assets"),
      leftIcon: <BriefcaseIcon className="w-5 h-5" />,
    },
  };

  const { authenticated } = useAuth();
  const className = "overflow-y-auto bg-white border-r title w-72 text-primary-content border-primary";

  return (
    <>
      <div className={className}>
        <div className="flex flex-col items-stretch justify-between flex-nowrap">
          {/* Top logo */}
          <div
            className={`flex flex-row items-stretch ${
              closed ? "justify-end px-1" : "justify-center px-4"
            } h-16 py-2 border-b border-primary`}
          >
            <button
              className={`flex flex-row items-center ${
                closed ? "justify-end p-2" : "justify-center grow"
              } rounded-lg hover:bg-amber-200`}
              onClick={() => setIsClosed(!closed)}
            >
              <div className={closed ? "logo-mobile" : "logo"} />
            </button>
          </div>

          {/* The links */}
          <ul className={cn("p-4 space-y-1", { "pr-0": closed })}>
            <IfSideBarLink {...items.home} closed={closed} />
            <IfSideBarLink {...items.notification} closed={closed} />
            <IfSideBarLink {...items.createAsset} closed={closed} />

            <IfSidebarDropdown {...drItems.myStuff} closed={closed} setClosed={setIsClosed}>
              <IfSideBarLink {...items.myAssets} closed={closed} />
              <IfSideBarLink {...items.latestAssets} closed={closed} />
              <IfSideBarLink {...items.my_list} closed={closed} />
              <IfSideBarLink {...items.resources} closed={closed} />
            </IfSidebarDropdown>

            <IfSideBarLink {...items.reportBug} closed={closed} />
            <IfSideBarLink {...items.userGuide} closed={closed} />
            {/*<IfSideBarLink {...items.map} />*/}
          </ul>
        </div>

        {/* Logout button if signed in */}
        {authenticated && (
          <span className="inline-block align-bottom">
            <LoginBtn />
          </span>
        )}
      </div>
    </>
  );
}

export default Sidebar;
