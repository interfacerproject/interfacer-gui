import { Button, Link, Text } from "@bbtgnn/polaris-interfacer";
import FullWidthBanner from "components/FullWidthBanner";
import { useUser } from "components/layout/FetchUserLayout";
import { useAuth } from "hooks/useAuth";
import { useTranslation } from "next-i18next";

const EditProfileBanner = () => {
  const { t } = useTranslation();
  const { id } = useUser();
  const { user } = useAuth();
  const isUser = user?.ulid === id;
  if (!isUser) return null;
  return (
    <FullWidthBanner open status="basic">
      <Text as="p" variant="bodySm">
        {t("This is your profile page. Edit it to add your bio and other informations.")}
      </Text>
      <Link url={`/profile/${user.ulid}/edit`} monochrome>
        <Button monochrome outline>
          {t("Edit")}
        </Button>
      </Link>
    </FullWidthBanner>
  );
};

export default EditProfileBanner;
