import { Button, Card, Icon, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { ParentChild } from "@carbon/icons-react";
import { LinkMinor, PlusMinor } from "@shopify/polaris-icons";
import AddStar from "components/AddStar";
import BrDisplayUser from "components/brickroom/BrDisplayUser";
import { useProject } from "components/layout/FetchProjectLayout";
import OshTool from "components/Osh";
import { ProjectType } from "components/types";
import WatchButton from "components/WatchButton";
import { useAuth } from "hooks/useAuth";
import useStorage from "hooks/useStorage";
import { ResourceProposalsQuery } from "lib/types";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import ActionsCard from "./sidebar/ActionsCard";
import ContributionsCard from "./sidebar/ContributionsCard";
import RelationsCard from "./sidebar/RelationsCard";

export default function ProjectSidebar() {
  const { t } = useTranslation("common");
  const { project, setSelected } = useProject();
  const { user } = useAuth();
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
  const isDesign = project.conformsTo?.name === ProjectType.DESIGN;

  return (
    <div className="lg:col-span-1 order-first lg:order-last">
      {/* Project info */}
      <div className="w-full justify-end flex pb-3">
        {user && <AddStar id={project.id!} owner={project.primaryAccountable!.id} />}
      </div>
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
          </div>
        </Stack>
      </Card>

      <ActionsCard />
      <ContributionsCard />
      <RelationsCard />
      <OshTool />
    </div>
  );
}
