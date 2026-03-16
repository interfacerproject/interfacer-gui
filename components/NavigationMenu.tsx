import { ScanAlt } from "@carbon/icons-react";
import {
  BellIcon,
  BookmarkIcon,
  ChatIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CogIcon,
  DocumentTextIcon,
  SupportIcon,
  UploadIcon,
  UserIcon,
} from "@heroicons/react/outline";
import { LocationMarkerIcon } from "@heroicons/react/solid";
import EntityTypeIcon from "components/EntityTypeIcon";
import InterfacerLogo from "components/InterfacerLogo";
import BrUserAvatar from "components/brickroom/BrUserAvatar";
import { ProjectType } from "components/types";
import { useAuth } from "hooks/useAuth";
import useInBox from "hooks/useInBox";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useState } from "react";

/* ── Reusable sub-components ── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-4 pt-4 pb-1.5"
      style={{
        fontFamily: "var(--ifr-font-body)",
        fontSize: "var(--ifr-fs-sm)",
        fontWeight: "var(--ifr-fw-medium)",
        lineHeight: "16px",
        color: "var(--ifr-text-secondary)",
        letterSpacing: "0.4px",
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

function NavBadge({ value, color, textColor }: { value: string; color: string; textColor: string }) {
  return (
    <span
      className="flex items-center justify-center px-2 py-px rounded-full"
      style={{
        backgroundColor: color,
        fontFamily: "var(--ifr-font-body)",
        fontSize: "var(--ifr-fs-sm)",
        fontWeight: "var(--ifr-fw-medium)",
        lineHeight: "16px",
        color: textColor,
        minWidth: "22px",
      }}
    >
      {value}
    </span>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  expandable?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  badge?: React.ReactNode;
  activeBg?: string;
  activeTextColor?: string;
}

function NavItem({
  icon,
  label,
  active = false,
  onClick,
  expandable = false,
  expanded = false,
  onToggleExpand,
  badge,
  activeBg,
  activeTextColor,
}: NavItemProps) {
  return (
    <button
      onClick={expandable ? onToggleExpand : onClick}
      className={`flex items-center justify-between w-full px-4 py-2.5 border-none cursor-pointer transition-colors ${
        active ? "" : "bg-transparent hover:bg-[var(--ifr-bg-hover-light)]"
      }`}
      style={{
        fontFamily: "var(--ifr-font-body)",
        fontSize: "var(--ifr-fs-base)",
        fontWeight: "var(--ifr-fw-medium)",
        lineHeight: "20px",
        borderRadius: "var(--ifr-radius-lg)",
        ...(active
          ? {
              backgroundColor: activeBg || "var(--ifr-bg-active)",
              color: activeTextColor || "var(--ifr-text-active)",
            }
          : { color: "var(--ifr-text-primary)" }),
      }}
    >
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-5 h-5 shrink-0">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {badge}
        {expandable && (
          <span className="flex items-center justify-center w-5 h-5 text-[var(--ifr-text-secondary)]">
            {expanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
          </span>
        )}
      </div>
    </button>
  );
}

function SubNavItem({
  label,
  active = false,
  onClick,
  icon,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left pl-12 pr-4 py-2 border-none cursor-pointer transition-colors flex items-center gap-2.5 ${
        active
          ? "text-[var(--ifr-text-primary)] bg-[var(--ifr-bg-hover)]"
          : "text-[var(--ifr-text-primary)] bg-transparent hover:bg-[var(--ifr-bg-hover-light)]"
      }`}
      style={{
        fontFamily: "var(--ifr-font-body)",
        fontSize: "var(--ifr-fs-base)",
        fontWeight: active ? "var(--ifr-fw-medium)" : "var(--ifr-fw-regular)",
        lineHeight: "20px",
        borderRadius: "var(--ifr-radius-lg)",
      }}
    >
      {icon && <span className="flex items-center justify-center w-4 h-4 shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}

function Divider() {
  return <div className="mx-4 my-2 border-t border-[var(--ifr-border)]" />;
}

/* ── Main component ── */

interface NavigationMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function NavigationMenu({ open, onClose }: NavigationMenuProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation("SideBarProps");
  const { unread } = useInBox();
  const [myProjectsExpanded, setMyProjectsExpanded] = useState(true);

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleProfileTab = (tab: string) => {
    if (user) {
      router.push(`${user.profileUrl}?tab=${tab}`);
      onClose();
    }
  };

  const isActive = (path: string) => router.asPath === path || router.pathname === path;
  const isProfileTab = (tab: string) => {
    if (!user) return false;
    const url = router.asPath;
    return url.startsWith(user.profileUrl) && url.includes(`tab=${tab}`);
  };
  const isProfileDefault = user ? router.asPath === user.profileUrl : false;

  const iconColor = (active: boolean) => (active ? "var(--ifr-text-primary)" : "var(--ifr-text-secondary)");
  const entityIconColor = (path: string, entityColor: string) =>
    isActive(path) ? entityColor : "var(--ifr-text-secondary)";

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-[60] bg-[var(--ifr-overlay-dark)] transition-opacity" onClick={onClose} />
      )}

      {/* Drawer */}
      <aside
        className="fixed top-0 left-0 bottom-0 z-[70] bg-[var(--ifr-bg-surface)] flex flex-col"
        style={{
          width: "var(--ifr-nav-menu-width)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 250ms ease",
          boxShadow: open ? "var(--ifr-shadow-dropdown)" : "none",
        }}
      >
        {/* Logo header */}
        <div className="px-6 pt-5 pb-4">
          <button className="block cursor-pointer bg-transparent border-none p-0" onClick={() => handleNavigate("/")}>
            <InterfacerLogo className="h-[22px] w-auto" color="var(--ifr-text-primary)" />
          </button>
        </div>

        {/* Scrollable content */}
        <nav className="flex-1 overflow-y-auto px-2 py-1 flex flex-col">
          {/* Section: Explore */}
          <SectionLabel>{t("Explore", "Explore")}</SectionLabel>

          <NavItem
            icon={
              <EntityTypeIcon type={ProjectType.DESIGN} size="small" fill={entityIconColor("/", "var(--ifr-green)")} />
            }
            label={t("Designs", "Designs")}
            active={isActive("/")}
            onClick={() => handleNavigate("/")}
            activeBg="var(--ifr-stat-green-bg)"
            activeTextColor="var(--ifr-green)"
          />
          <NavItem
            icon={
              <EntityTypeIcon
                type={ProjectType.PRODUCT}
                size="small"
                fill={entityIconColor("/products", "var(--ifr-type-product)")}
              />
            }
            label={t("Products", "Products")}
            active={isActive("/products")}
            onClick={() => handleNavigate("/products")}
            activeBg="var(--ifr-type-product-bg)"
            activeTextColor="var(--ifr-type-product)"
          />
          <NavItem
            icon={
              <EntityTypeIcon
                type={ProjectType.SERVICE}
                size="small"
                fill={entityIconColor("/services", "var(--ifr-type-service)")}
              />
            }
            label={t("Services", "Services")}
            active={isActive("/services")}
            onClick={() => handleNavigate("/services")}
            activeBg="var(--ifr-type-service-bg)"
            activeTextColor="var(--ifr-type-service)"
          />

          {/* Logged-in section */}
          {user && (
            <>
              <Divider />
              <SectionLabel>{t("My Account", "My Account")}</SectionLabel>

              {/* User header */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 mb-0.5">
                <div
                  className="rounded-full overflow-hidden shrink-0"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderWidth: "0.2px",
                    borderStyle: "solid",
                    borderColor: "var(--ifr-border-avatar)",
                    boxShadow: "var(--ifr-shadow-avatar)",
                  }}
                >
                  <BrUserAvatar user={user} size="100%" />
                </div>
                <div className="flex flex-col">
                  <span
                    className="text-[var(--ifr-text-primary)]"
                    style={{
                      fontFamily: "var(--ifr-font-body)",
                      fontSize: "var(--ifr-fs-base)",
                      fontWeight: "var(--ifr-fw-medium)",
                      lineHeight: "18px",
                    }}
                  >
                    {user.name}
                  </span>
                  <span
                    className="text-[var(--ifr-text-secondary)]"
                    style={{
                      fontFamily: "var(--ifr-font-body)",
                      fontSize: "var(--ifr-fs-sm)",
                      fontWeight: "var(--ifr-fw-regular)",
                      lineHeight: "14px",
                    }}
                  >
                    {`@${user.user}`}
                  </span>
                </div>
              </div>

              {/* My Projects — expandable */}
              <NavItem
                icon={<UserIcon className="w-[18px] h-[18px]" style={{ color: iconColor(isProfileDefault) }} />}
                label={t("My Projects")}
                expandable
                expanded={myProjectsExpanded}
                onToggleExpand={() => setMyProjectsExpanded(v => !v)}
                active={isProfileDefault}
                activeBg="var(--ifr-bg-hover)"
                activeTextColor="var(--ifr-text-primary)"
              />
              {myProjectsExpanded && (
                <div className="flex flex-col">
                  <SubNavItem
                    label={t("Designs", "Designs")}
                    icon={
                      <EntityTypeIcon
                        type={ProjectType.DESIGN}
                        size="small"
                        fill={iconColor(isProfileTab("0") || isProfileDefault)}
                      />
                    }
                    active={isProfileTab("0") || isProfileDefault}
                    onClick={() => handleProfileTab("0")}
                  />
                  <SubNavItem
                    label={t("Products", "Products")}
                    icon={
                      <EntityTypeIcon
                        type={ProjectType.PRODUCT}
                        size="small"
                        fill={iconColor(isProfileTab("products"))}
                      />
                    }
                    active={isProfileTab("products")}
                    onClick={() => handleProfileTab("products")}
                  />
                  <SubNavItem
                    label={t("DPPs")}
                    icon={<EntityTypeIcon type={ProjectType.DPP} size="small" fill={iconColor(isProfileTab("dpps"))} />}
                    active={isProfileTab("dpps")}
                    onClick={() => handleProfileTab("dpps")}
                  />
                  <SubNavItem
                    label={t("Machines", "Machines")}
                    icon={
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 16 16"
                        fill="none"
                        style={{ color: iconColor(isProfileTab("machines")) }}
                      >
                        <rect
                          x="1"
                          y="4"
                          width="14"
                          height="8"
                          rx="1"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          fill="none"
                        />
                        <circle cx="5" cy="8" r="1.5" fill="currentColor" />
                        <circle cx="11" cy="8" r="1.5" fill="currentColor" />
                      </svg>
                    }
                    active={isProfileTab("machines")}
                    onClick={() => handleProfileTab("machines")}
                  />
                  <SubNavItem
                    label={t("Locations", "Locations")}
                    icon={
                      <LocationMarkerIcon
                        className="w-3.5 h-3.5"
                        style={{ color: iconColor(isProfileTab("locations")) }}
                      />
                    }
                    active={isProfileTab("locations")}
                    onClick={() => handleProfileTab("locations")}
                  />
                  <SubNavItem
                    label={t("Services", "Services")}
                    icon={
                      <EntityTypeIcon
                        type={ProjectType.SERVICE}
                        size="small"
                        fill={iconColor(isProfileTab("services"))}
                      />
                    }
                    active={isProfileTab("services")}
                    onClick={() => handleProfileTab("services")}
                  />
                </div>
              )}

              <div className="h-1.5" />

              <NavItem
                icon={<BellIcon className="w-[18px] h-[18px]" style={{ color: "var(--ifr-text-secondary)" }} />}
                label={t("Notifications")}
                badge={
                  unread ? (
                    <NavBadge value={String(unread)} color="var(--ifr-yellow-bg)" textColor="var(--ifr-yellow-text)" />
                  ) : undefined
                }
                onClick={() => handleNavigate("/notification")}
                activeBg="var(--ifr-bg-hover)"
                activeTextColor="var(--ifr-text-primary)"
              />
              <NavItem
                icon={<BookmarkIcon className="w-[18px] h-[18px]" style={{ color: "var(--ifr-text-secondary)" }} />}
                label={t("My list")}
                onClick={() => handleNavigate(`${user.profileUrl}?tab=1`)}
                activeBg="var(--ifr-bg-hover)"
                activeTextColor="var(--ifr-text-primary)"
              />
              <NavItem
                icon={<DocumentTextIcon className="w-[18px] h-[18px]" style={{ color: "var(--ifr-text-secondary)" }} />}
                label={t("My drafts")}
                onClick={() => handleNavigate(`${user.profileUrl}?tab=2`)}
                activeBg="var(--ifr-bg-hover)"
                activeTextColor="var(--ifr-text-primary)"
              />
              <NavItem
                icon={<UploadIcon className="w-[18px] h-[18px]" style={{ color: "var(--ifr-text-secondary)" }} />}
                label={t("Import from LOSH")}
                onClick={() => handleNavigate("/resources")}
                activeBg="var(--ifr-bg-hover)"
                activeTextColor="var(--ifr-text-primary)"
              />

              <div className="h-1.5" />

              <NavItem
                icon={<CogIcon className="w-[18px] h-[18px]" style={{ color: "var(--ifr-text-secondary)" }} />}
                label={t("Account Settings", "Account Settings")}
                onClick={() => user && handleNavigate(`${user.profileUrl}/edit`)}
                activeBg="var(--ifr-bg-hover)"
                activeTextColor="var(--ifr-text-primary)"
              />
            </>
          )}

          <Divider />

          {/* Section: Support (always visible) */}
          <SectionLabel>{t("Support", "Support")}</SectionLabel>

          <NavItem
            icon={<ScanAlt size={18} style={{ color: "var(--ifr-text-secondary)" }} />}
            label={t("Scan QR")}
            onClick={() => handleNavigate("/scan")}
            activeBg="var(--ifr-bg-hover)"
            activeTextColor="var(--ifr-text-primary)"
          />
          <NavItem
            icon={<SupportIcon className="w-[18px] h-[18px]" style={{ color: "var(--ifr-text-secondary)" }} />}
            label={t("Report a bug")}
            onClick={() => window.open("https://github.com/dyne/interfacer-gui/issues/new", "_blank")}
            activeBg="var(--ifr-bg-hover)"
            activeTextColor="var(--ifr-text-primary)"
          />
          <NavItem
            icon={<ChatIcon className="w-[18px] h-[18px]" style={{ color: "var(--ifr-text-secondary)" }} />}
            label={t("User manual")}
            onClick={() => window.open("https://interfacerproject.github.io/interfacer-docs/#/", "_blank")}
            activeBg="var(--ifr-bg-hover)"
            activeTextColor="var(--ifr-text-primary)"
          />

          <div className="h-4 shrink-0" />
        </nav>
      </aside>
    </>
  );
}
