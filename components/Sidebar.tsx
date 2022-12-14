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

function Sidebar() {
  const { t } = useTranslation("SideBarProps");

  // Links
  const items: Record<string, IfSideBarLinkProps> = {
    home: {
      text: t("Home"),
      link: "/",
      leftIcon: <HomeIcon className="w-5 h-5" />,
    },
    notification: {
      text: t("Notifications"),
      link: "/notification",
      leftIcon: <BellIcon className="w-5 h-5" />,
    },
    // Dropdown -> My stuff
    createProject: {
      text: t("Create Projects"),
      link: "/create_project",
      leftIcon: <CubeIcon className="w-5 h-5" />,
      // tag: "NEW",
    },
    myProjects: {
      text: t("My Projects"),
      link: "/profile/my_profile",
    },
    // Dropdown -> Projects
    latestProjects: {
      text: t("Projects"),
      link: "/projects",
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
    projects: {
      text: t("Projects"),
      leftIcon: <CubeIcon className="w-5 h-5" />,
    },
    myStuff: {
      text: t("Projects"),
      leftIcon: <BriefcaseIcon className="w-5 h-5" />,
    },
  };

  const { authenticated } = useAuth();

  return (
    <div className="overflow-y-auto bg-white border-r title w-72 text-primary-content border-primary">
      <div className="flex flex-col items-stretch justify-between flex-nowrap">
        {/* Top logo */}
        <div className="flex flex-row items-stretch justify-center h-16 px-4 py-2 border-b border-primary">
          <Link href="/">
            <a className="flex flex-row items-center justify-center rounded-lg grow hover:bg-amber-200">
              <div className="logo" />
            </a>
          </Link>
        </div>

        {/* The links */}
        <ul className="p-4 space-y-1">
          <IfSideBarLink {...items.home} />
          <IfSideBarLink {...items.createProject} />
          <IfSideBarLink {...items.notification} />

          <IfSidebarDropdown {...drItems.myStuff}>
            <IfSideBarLink {...items.myProjects} />
            <IfSideBarLink {...items.latestProjects} />
            <IfSideBarLink {...items.my_list} />
            <IfSideBarLink {...items.resources} />
          </IfSidebarDropdown>

          <IfSideBarLink {...items.reportBug} />
          <IfSideBarLink {...items.userGuide} />
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
  );
}

export default Sidebar;
