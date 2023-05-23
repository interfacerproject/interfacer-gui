import { Button, Text } from "@bbtgnn/polaris-interfacer";
import dayjs from "lib/dayjs";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import GeneralCard from "./GeneralCard";
import IfSidebarTag from "./brickroom/IfSidebarTag";

export interface ProjectCardProps {
  project: Partial<EconomicResource>;
}

export default function LoshCard(props: ProjectCardProps) {
  const { project } = props;
  const { t } = useTranslation("common");
  const executionDate = project?.metadata?.execution_date;
  const router = useRouter();
  const addedOn = executionDate ? (
    <Text variant="bodyMd" as="h3">
      {t("Added on ") + dayjs(executionDate).format("YY-MM-DD")}
    </Text>
  ) : null;

  return (
    <GeneralCard project={project} baseUrl="/resource/">
      <GeneralCard.CardHeader>
        <div className="flex justify-between items-center">
          <IfSidebarTag text={"losh"} />
          {addedOn}
        </div>
      </GeneralCard.CardHeader>
      <GeneralCard.CardBody>
        <GeneralCard.RemoteImage />
        <GeneralCard.ProjectTitleAndStats />
      </GeneralCard.CardBody>
      <GeneralCard.CardFooter>
        <div className="flex flex-row justify-end p-2 w-full gap-2">
          <div className="w-fit">
            <Button size="slim" onClick={() => router.push(`/resource/${project.id}`)}>
              {t("View")}
            </Button>
          </div>
          <div className="w-fit">
            <Button primary size="slim" onClick={() => router.push(`/resource/${project.id}/claim`)}>
              {t("Claim")}
            </Button>
          </div>
        </div>
      </GeneralCard.CardFooter>
    </GeneralCard>
  );
}
