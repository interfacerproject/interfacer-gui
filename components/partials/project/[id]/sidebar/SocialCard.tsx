import { Button, Card, Icon, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { LinkMinor, PlusMinor } from "@shopify/polaris-icons";
import DetailMap from "components/DetailMap";
import WatchButton from "components/WatchButton";
import BrUserDisplay from "components/brickroom/BrUserDisplay";
import { useProject } from "components/layout/FetchProjectLayout";
import { useAuth } from "hooks/useAuth";
import useStorage from "hooks/useStorage";
import { useTranslation } from "next-i18next";
import { useState } from "react";

const SocialCard = () => {
  const { user, authenticated } = useAuth();
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
  const location = !project.currentLocation ? project.primaryAccountable?.primaryLocation?.name : undefined;
  return (
    <Card sectioned>
      <Stack vertical>
        {project.repo && (
          <Button primary url={project.repo} icon={<Icon source={LinkMinor} />} fullWidth size="large">
            {t("Project data")}
          </Button>
        )}
        <Button id="addToList" size="large" onClick={handleCollect} fullWidth icon={<Icon source={PlusMinor} />}>
          {inList ? t("Remove from list") : t("Add to list")}
        </Button>
        {user && <WatchButton id={project.id!} owner={project.primaryAccountable!.id} />}
        <div className="space-y-4">
          {project.currentLocation && (
            <div>
              <Text as="p" variant="bodyMd">
                {t("Project location:")}
              </Text>
              <div className="mt-1">
                <DetailMap location={project.currentLocation} height={180} />
              </div>
            </div>
          )}
          {authenticated && (
            <div>
              <Text as="p" variant="bodyMd">
                {t("Project by:")}
              </Text>
              <BrUserDisplay userId={project.primaryAccountable!.id} />
            </div>
          )}
        </div>
      </Stack>
    </Card>
  );
};

export default SocialCard;
