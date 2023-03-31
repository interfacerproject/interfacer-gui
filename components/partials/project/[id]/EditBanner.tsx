import { Button, Text } from "@bbtgnn/polaris-interfacer";
import FullWidthBanner from "components/FullWidthBanner";
import { useProject } from "components/layout/FetchProjectLayout";
import { useTranslation } from "next-i18next";
import Link from "next/link";

const EditBanner = () => {
  const { t } = useTranslation();
  const { project, isOwner } = useProject();

  return !isOwner ? null : (
    <FullWidthBanner open status="basic">
      <Text as="p" variant="bodyMd" id="is-owner-banner-content">
        {t("This project is yours")}
      </Text>
      <Link href={`/project/${project.id}/edit`}>
        <Button monochrome outline>
          {t("Edit")}
        </Button>
      </Link>
    </FullWidthBanner>
  );
};

export default EditBanner;
