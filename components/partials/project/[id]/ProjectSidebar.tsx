import { Button, Card, Icon, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { ListBoxes, MagicWand, ParentChild } from "@carbon/icons-react";
import { LinkMinor, PlusMinor } from "@shopify/polaris-icons";
import AddStar from "components/AddStar";
import BrDisplayUser from "components/brickroom/BrDisplayUser";
import { useProject } from "components/layout/FetchProjectLayout";
import OshTool from "components/Osh";
import ProjectContributors from "components/ProjectContributors";
import { ProjectType } from "components/types";
import WatchButton from "components/WatchButton";
import { useAuth } from "hooks/useAuth";
import useStorage from "hooks/useStorage";
import { ResourceProposalsQuery } from "lib/types";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
import ActionsCard from "./sidebar/ActionsCard";

interface Props {
  contributions: ResourceProposalsQuery;
  setSelected: Dispatch<SetStateAction<number>>;
}

export default function ProjectSidebar(props: Props) {
  const { t } = useTranslation("common");
  const { contributions, setSelected } = props;
  const { project } = useProject();
  const { user } = useAuth();
  const { getItem, setItem } = useStorage();
  const [inList, setInList] = useState<boolean>(false);
  const router = useRouter();

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
  const licenses = project.metadata?.licenses?.length > 0 && project?.metadata?.licenses;
  const design = project.metadata?.design;
  const declarations = project.metadata?.declarations;
  const haveDeclarations = declarations?.recyclable === "yes" || declarations?.repairable === "yes";

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
      {/* Contributions */}
      <Card sectioned>
        <Stack vertical>
          <Text as="h2" variant="headingMd">
            {t("Contributions")}
          </Text>
          <Text color="success" as="p" variant="bodyMd" id="sidebar-contributors">
            {t("{{contributors}} contributors", { contributors: project.metadata.contributors?.length || 0 })}
          </Text>
          <ProjectContributors projectNode={project} />
          <Text color="success" as="p" variant="bodyMd">
            {t("{{contributions}} contributions", { contributions: contributions?.proposals.edges.length })}
          </Text>
          <Button
            id="contribute"
            icon={<MagicWand />}
            size="large"
            fullWidth
            primary
            onClick={() => router.push(`/create/contribution/${project.id}`)}
          >
            {t("Make a contribution")}
          </Button>
          <Button
            id="seeContributions"
            icon={<ListBoxes />}
            size="large"
            fullWidth
            monochrome
            onClick={() => setSelected(4)}
          >
            {t("All contributions")}
          </Button>
        </Stack>
      </Card>
      {/* Relations */}
      <Card sectioned>
        <Stack vertical spacing="loose">
          <Text as="h2" variant="headingMd">
            {t("Relations")}
          </Text>
          <Text color="success" as="p" variant="bodyMd">
            {t("{{related}} related projects", { related: project.metadata.relations?.length || 0 })}
          </Text>
          <Button
            id="seeRelations"
            icon={<ParentChild />}
            size="large"
            fullWidth
            monochrome
            onClick={() => setSelected(1)}
          >
            {t("All relations")}
          </Button>
        </Stack>
      </Card>
      {/* Osh */}
      {isDesign && <OshTool />}
    </div>
  );
}
