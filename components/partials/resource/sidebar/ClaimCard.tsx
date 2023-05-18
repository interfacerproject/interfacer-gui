import { Button, Card, Icon, Stack } from "@bbtgnn/polaris-interfacer";
import { LinkMinor, PlusMinor } from "@shopify/polaris-icons";
import { useProject } from "components/layout/FetchProjectLayout";
import WatchButton from "components/WatchButton";
import useStorage from "hooks/useStorage";
import { useTranslation } from "next-i18next";
import router from "next/router";
import { useState } from "react";

const ClaimCard = () => {
  const { project } = useProject();
  const { t } = useTranslation("common");
  const { getItem, setItem } = useStorage();
  const [inList, setInList] = useState<boolean>(false);
  const handleClaim = () => router.push(`/resource/${project.id}/claim`);
  const handleCollect = () => {
    const _list = getItem("projectsCollected");
    const _listParsed = _list ? JSON.parse(_list) : [];
    if (_listParsed.includes(project!.id)) {
      setItem("projectsCollected", JSON.stringify(_listParsed.filter((a: string) => a !== project!.id)));
      setInList(false);
    } else {
      const _listParsedUpdated = [..._listParsed, project?.id];
      setItem("projectsCollected", JSON.stringify(_listParsedUpdated));
      setInList(true);
    }
  };
  return (
    <Card sectioned>
      <Stack vertical>
        <Button primary size="large" fullWidth onClick={handleClaim}>
          {t("Claim")}
        </Button>
        {project.repo && (
          <Button url={project.repo} icon={<Icon source={LinkMinor} />} fullWidth size="large">
            {t("External data")}
          </Button>
        )}
        <Button id="addToList" size="large" onClick={handleCollect} fullWidth icon={<Icon source={PlusMinor} />}>
          {inList ? t("Remove from list") : t("Add to list")}
        </Button>
        <WatchButton id={project.id!} owner={project.primaryAccountable!.id} />
      </Stack>
    </Card>
  );
};

export default ClaimCard;
