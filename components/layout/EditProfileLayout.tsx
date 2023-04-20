import { Link as PLink } from "@bbtgnn/polaris-interfacer";
import SuccessBanner from "components/partials/project/[id]/SuccessBanner";
import { useAuth } from "hooks/useAuth";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";

interface Props {
  children: React.ReactNode;
}

export default function EditProfileLayout(props: Props) {
  const { children } = props;
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = router.query;
  const isOwner = user?.ulid === id;

  if (!isOwner) router.push(`/profile/${id}`);

  return (
    <div>
      {isOwner && (
        <>
          <SuccessBanner>{t("Your profile has been updated successfully.")}</SuccessBanner>
          <div className="p-4">
            <Link href={user!.profileUrl}>
              <PLink>
                <span className="text-text-primary">
                  {"← "}
                  {t("Back to Profile")}
                </span>
              </PLink>
            </Link>
          </div>
          <div>{children}</div>
        </>
      )}
    </div>
  );
}
