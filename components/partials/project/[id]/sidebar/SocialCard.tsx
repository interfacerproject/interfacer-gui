import { Button, Card, Icon, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { LinkMinor, PlusMinor } from "@shopify/polaris-icons";
import BrDisplayUser from "components/brickroom/BrDisplayUser";
import { useProject } from "components/layout/FetchProjectLayout";
import DetailMap from "components/DetailMap";
import WatchButton from "components/WatchButton";
import { useAuth } from "hooks/useAuth";
import useStorage from "hooks/useStorage";
import { useTranslation } from "next-i18next";
import { useState } from "react";

const SocialCard = () => {
  const { user } = useAuth();
  const { project } = useProject();
  const { t } = useTranslation("common");
  const { getItem, setItem } = useStorage();
  const [inList, setInList] = useState<boolean>(false);
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
        {project.repo && (
          <Button primary url={project.repo} icon={<Icon source={LinkMinor} />} fullWidth size="large">
            {t("Go to source")}
          </Button>
        )}
        <Button id="addToList" size="large" onClick={handleCollect} fullWidth icon={<Icon source={PlusMinor} />}>
          {inList ? t("Remove from list") : t("Add to list")}
        </Button>
        {user && <WatchButton id={project.id!} owner={project.primaryAccountable!.id} />}
        <div className="space-y-1">
          <Text as="p" variant="bodyMd">
            {t("By:")}
          </Text>
          <BrDisplayUser
            id={project.primaryAccountable!.id}
            name={project.primaryAccountable!.name}
            location={project.currentLocation?.name}
          />
          {project.currentLocation && <DetailMap location={project.currentLocation} height={180} />}
        </div>
      </Stack>
    </Card>
  );
};

export default SocialCard;
