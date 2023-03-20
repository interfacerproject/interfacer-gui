import { User } from "contexts/AuthContext";
import { useAuth } from "hooks/useAuth";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

// Components
import { Button, Popover, Text } from "@bbtgnn/polaris-interfacer";
import { Logout } from "@carbon/icons-react";
import BrUserAvatar from "components/brickroom/BrUserAvatar";
import { ChildrenProp } from "components/brickroom/types";
import Link from "next/link";

//

export default function TopbarUser() {
  const { user } = useAuth();
  const { t } = useTranslation("common");
  const router = useRouter();

  const [popoverActive, setPopoverActive] = useState(false);
  const togglePopoverActive = useCallback(() => setPopoverActive(popoverActive => !popoverActive), []);

  useEffect(() => {
    router.events.on("routeChangeStart", () => {
      setPopoverActive(false);
    });
  }, [router.events]);

  const activator = <UserAvatarButton user={user!} onClick={togglePopoverActive} />;

  return (
    <Popover active={popoverActive} activator={activator} onClose={togglePopoverActive} fullHeight>
      <div className="w-40 divide-y-1 divide-slate-200">
        <MenuLink href="/profile/my_profile">
          <UserSection user={user!} />
        </MenuLink>
        <div>
          <MenuLink href="/profile/my_profile">
            <Text as="p" variant="bodyMd">
              {t("My profile")}
            </Text>
          </MenuLink>
        </div>
        <MenuSection>
          <LogoutButton text={t("Logout")} />
        </MenuSection>
      </div>
    </Popover>
  );
}

/* Partials */

function UserAvatarButton(props: { onClick: () => void; user: User; notification?: boolean }) {
  const { onClick, user, notification = true } = props;
  return (
    <button
      onClick={onClick}
      className="w-12 h-12 rounded-full border-1 border-border-subdued flex items-center justify-center hover:ring-primary hover:ring-2 relative"
    >
      {notification && (
        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-1 border-border-subdued bg-white rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
        </div>
      )}
      <div className="w-10 h-10">
        <BrUserAvatar name={user.name} />
      </div>
    </button>
  );
}

function MenuSection(props: ChildrenProp) {
  const { children } = props;
  return <div className="p-3">{children}</div>;
}

function MenuLink(props: { href: string } & ChildrenProp) {
  const { href, children } = props;
  return (
    <Link href={href}>
      <a>
        <div className="hover:bg-slate-100">
          <MenuSection>{children}</MenuSection>
        </div>
      </a>
    </Link>
  );
}

function UserSection(props: { user: User }) {
  const { user } = props;
  return (
    <div className="flex flex-row items-center space-x-3">
      <div className="w-10 h-10">
        <BrUserAvatar name={user?.name} />
      </div>
      <div>
        <Text as="p" variant="bodyMd" fontWeight="bold">
          <span className="text-primary">{user?.name}</span>
        </Text>
        <Text as="p" variant="bodySm" color="subdued">{`@${user?.username}`}</Text>
      </div>
    </div>
  );
}

function LogoutButton(props: { text: string }) {
  const { text } = props;
  const { logout } = useAuth();
  return (
    <Button
      onClick={() => {
        logout();
      }}
      outline
      destructive
      icon={<Logout />}
      fullWidth
    >
      {text}
    </Button>
  );
}
