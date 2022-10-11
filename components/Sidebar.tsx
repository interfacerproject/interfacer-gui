import Link from "next/link";

import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "next-i18next";

import LoginBtn from "./LoginMenu";
import { IfSidebarItemProps } from "./brickroom/IfSidebarItem";
import IfSideBarLink, { IfSideBarLinkProps } from "./brickroom/IfSideBarLink";
import IfSidebarDropdown from "./brickroom/IfSidebarDropdown";

import { BriefcaseIcon, ChatIcon, CubeIcon, HomeIcon, GlobeIcon, SupportIcon } from "@heroicons/react/outline";

//

function Sidebar() {
  const { t } = useTranslation("SideBarProps");

  // Links
  const items: Record<string, IfSideBarLinkProps> = {
    home: {
      text: t("home"),
      link: "/",
      leftIcon: <HomeIcon className="w-5 h-5" />,
    },
    // Dropdown -> My stuff
    createAsset: {
      text: t("create_asset"),
      link: "/create_asset",
      tag: "NEW",
    },
    myAssets: {
      text: t("my_assets"),
      link: "/profile/my_profile",
    },
    // Dropdown -> Assets
    latestAssets: {
      text: t("latest_assets"),
      link: "/assets",
    },
    resources: {
      text: t("imported_losh"),
      link: "/resources",
      tag: "NEW",
    },
    reportBug: {
      text: t("report_bug"),
      link: "https://github.com/dyne/interfacer-gui/issues/new",
      leftIcon: <SupportIcon className="w-5 h-5" />,
      target: "_blank",
    },
    userGuide: {
      text: t("user_guide"),
      link: "/",
      leftIcon: <ChatIcon className="w-5 h-5" />,
      disabled: true,
    },
    map: {
      text: t("map"),
      link: "/",
      leftIcon: <GlobeIcon className="w-5 h-5" />,
      disabled: true,
    },
  };

  // Dropdown items
  const drItems: Record<string, IfSidebarItemProps> = {
    assets: {
      text: t("assets"),
      leftIcon: <CubeIcon className="w-5 h-5" />,
    },
    myStuff: {
      text: t("create_asset"),
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

          <IfSidebarDropdown {...drItems.myStuff}>
            <IfSideBarLink {...items.createAsset} />
            <IfSideBarLink {...items.myAssets} />
          </IfSidebarDropdown>

          <IfSidebarDropdown {...drItems.assets}>
            <IfSideBarLink {...items.latestAssets} />
            <IfSideBarLink {...items.resources} />
          </IfSidebarDropdown>

          <IfSideBarLink {...items.reportBug} />
          <IfSideBarLink {...items.userGuide} />
          <IfSideBarLink {...items.map} />
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
