import { User } from "contexts/AuthContext";
import { useAuth } from "hooks/useAuth";
import { useTranslation } from "next-i18next";

// Components
import { Button, Text } from "@bbtgnn/polaris-interfacer";
import { Logout } from "@carbon/icons-react";
import BrUserAvatar from "components/brickroom/BrUserAvatar";
import { ChildrenProp } from "components/brickroom/types";
import Link from "next/link";
import TopbarPopover from "./TopbarPopover";

//

export default function TopbarUser() {
  const { user } = useAuth();
  const { t } = useTranslation("common");

  return (
    <TopbarPopover id="user-menu" buttonContent={<BrUserAvatar />}>
      <div className="w-40 divide-y-1 divide-slate-200">
        <MenuLink href={user!.profileUrl}>
          <UserSection user={user!} />
        </MenuLink>
        <div>
          <MenuLink href={user!.profileUrl}>
            <Text as="p" variant="bodyMd">
              {t("My profile")}
            </Text>
          </MenuLink>
        </div>
        <MenuSection>
          <LogoutButton text={t("Logout")} />
        </MenuSection>
      </div>
    </TopbarPopover>
  );
}

/* Partials */

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
      id="logout-button"
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
