import { Button } from "@bbtgnn/polaris-interfacer";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import GeneralCard from "./GeneralCard";
import LoshImportedDate from "./LoshImportedDate";
import IfSidebarTag from "./brickroom/IfSidebarTag";

export interface ProjectCardProps {
  project: Partial<EconomicResource>;
}

export default function LoshCard(props: ProjectCardProps) {
  const { project } = props;
  const { t } = useTranslation("common");
  const router = useRouter();
  const addedOn = <LoshImportedDate projectId={project.id!} />;
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
              {t("Import")}
            </Button>
          </div>
        </div>
      </GeneralCard.CardFooter>
    </GeneralCard>
  );
}
