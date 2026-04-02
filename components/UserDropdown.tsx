import { Logout } from "@carbon/icons-react";
import { BellIcon, BookmarkIcon, CogIcon, UserIcon } from "@heroicons/react/outline";
import BrUserAvatar from "components/brickroom/BrUserAvatar";
import { useAuth } from "hooks/useAuth";
import useInBox from "hooks/useInBox";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";

function MenuItem({
  icon,
  label,
  badge,
  onClick,
  href,
}: {
  icon?: React.ReactNode;
  label: string;
  badge?: React.ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const content = (
    <button
      className="flex items-center justify-between w-full px-3 py-1.5 h-11 bg-transparent border-none cursor-pointer hover:bg-[var(--ifr-bg-hover)] transition-colors"
      style={{ fontFamily: "var(--ifr-font-body)" }}
      onClick={onClick}
    >
      <div className="flex items-center gap-2.5">
        {icon && <span className="shrink-0 w-4 h-4 flex items-center justify-center">{icon}</span>}
        <span
          className="text-[var(--ifr-text-primary)] whitespace-nowrap"
          style={{ fontWeight: "var(--ifr-fw-regular)", fontSize: "var(--ifr-fs-base)", lineHeight: "21px" }}
        >
          {label}
        </span>
      </div>
      {badge}
    </button>
  );

  if (href) {
    return (
      <Link href={href}>
        <a className="no-underline">{content}</a>
      </Link>
    );
  }
  return content;
}

interface UserDropdownProps {
  onClose: () => void;
}

export default function UserDropdown({ onClose }: UserDropdownProps) {
  const { user, logout } = useAuth();
  const { unread } = useInBox();
  const { t } = useTranslation("common");
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    onClose();
    logout();
  };

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown */}
      <div
        className="absolute top-14 right-0 z-50 bg-[var(--ifr-bg-surface)] overflow-hidden"
        style={{
          width: "var(--ifr-dropdown-width)",
          borderRadius: "var(--ifr-radius-sm)",
          boxShadow: "var(--ifr-shadow-dropdown)",
          border: "1px solid var(--ifr-border)",
          fontFamily: "var(--ifr-font-body)",
        }}
      >
        {/* User header */}
        <div
          className="flex items-center gap-2.5 p-3 bg-[var(--ifr-bg-elevated)]"
          style={{ boxShadow: "var(--ifr-shadow-sm)" }}
        >
          <div
            className="rounded-full overflow-hidden shrink-0"
            style={{
              width: "var(--ifr-avatar-size)",
              height: "var(--ifr-avatar-size)",
              boxShadow: "var(--ifr-shadow-avatar)",
            }}
          >
            <BrUserAvatar user={user} />
          </div>
          <div className="flex flex-col">
            <span
              className="text-[var(--ifr-text-primary)] whitespace-nowrap"
              style={{ fontWeight: "var(--ifr-fw-medium)", fontSize: "var(--ifr-fs-md)", lineHeight: "24px" }}
            >
              {user.name}
            </span>
            <span
              className="text-[var(--ifr-text-secondary)] whitespace-nowrap"
              style={{ fontWeight: "var(--ifr-fw-regular)", fontSize: "var(--ifr-fs-sm)", lineHeight: "16px" }}
            >
              {`@${user.user}`}
            </span>
          </div>
        </div>

        {/* Menu section 1 */}
        <div className="border-t border-[var(--ifr-border)]">
          <MenuItem
            icon={<BellIcon className="w-4 h-4" style={{ color: "var(--ifr-text-secondary)" }} />}
            label={t("Notifications")}
            onClick={() => handleNavigate("/notification")}
            badge={
              unread ? (
                <span
                  className="flex items-center gap-1 px-2 py-px rounded-md relative"
                  style={{ backgroundColor: "var(--ifr-yellow-bg)" }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: "var(--ifr-yellow)" }}
                  />
                  <span
                    className="tracking-wide whitespace-nowrap"
                    style={{
                      fontFamily: "var(--ifr-font-body)",
                      fontSize: "var(--ifr-fs-sm)",
                      fontWeight: "var(--ifr-fw-medium)",
                      color: "var(--ifr-yellow-text)",
                      lineHeight: "18px",
                    }}
                  >
                    {unread}
                  </span>
                </span>
              ) : undefined
            }
          />
          <MenuItem
            icon={<BookmarkIcon className="w-4 h-4" style={{ color: "var(--ifr-text-secondary)" }} />}
            label={t("My list")}
            onClick={() => handleNavigate(`${user.profileUrl}?tab=1`)}
          />
          <MenuItem
            icon={<UserIcon className="w-4 h-4" style={{ color: "var(--ifr-text-secondary)" }} />}
            label={t("My profile")}
            onClick={() => handleNavigate(user.profileUrl)}
          />
        </div>

        {/* Menu section 2 */}
        <div className="border-t border-[var(--ifr-border)]">
          <MenuItem
            icon={<CogIcon className="w-4 h-4" style={{ color: "var(--ifr-text-secondary)" }} />}
            label={t("Account Settings", "Account Settings")}
            onClick={() => handleNavigate(`${user.profileUrl}/edit`)}
          />
        </div>

        {/* Logout */}
        <div
          className="p-3 bg-[var(--ifr-bg-elevated)] border-t border-[var(--ifr-border)]"
          style={{ boxShadow: "var(--ifr-shadow-sm)" }}
        >
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full h-[34px] bg-[var(--ifr-bg-surface)] border border-[var(--ifr-red)] cursor-pointer hover:bg-red-50 transition-colors"
            style={{ fontFamily: "var(--ifr-font-body)", borderRadius: "var(--ifr-radius-sm)" }}
          >
            <span
              className="text-[var(--ifr-red)] whitespace-nowrap"
              style={{ fontWeight: "var(--ifr-fw-medium)", fontSize: "var(--ifr-fs-sm)", lineHeight: "16px" }}
            >
              {t("Logout")}
            </span>
            <Logout size={12} style={{ color: "var(--ifr-red)" }} />
          </button>
        </div>
      </div>
    </>
  );
}
