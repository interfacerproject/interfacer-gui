import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import GeneralCard from "./GeneralCard";
import ProjectTypeRoundIcon from "./ProjectTypeRoundIcon";
import IfSidebarTag from "./brickroom/IfSidebarTag";
import { CreateProjectValues } from "./partials/create/project/CreateProjectForm";
import { ProjectType } from "./types";

export interface DraftCardProps {
  project: Partial<CreateProjectValues>;
  projectType: ProjectType;
  id?: number;
}

const fromDraftCardPropsToEconomicResource = (props: DraftCardProps): Partial<EconomicResource> => {
  const { project, projectType, id } = props;
  return {
    id: String(id),
    name: project.main?.title,
    note: project.main?.description,
    classifiedAs: project.main?.tags,
    currentLocation: {
      id: "none",
      name: project.location?.locationName!,
      mappableAddress: project.location?.locationData?.address,
    },
    conformsTo: {
      id: "none",
      name: projectType,
    },
  };
};

export default function DraftCard(props: DraftCardProps) {
  const project = fromDraftCardPropsToEconomicResource(props);
  const { projectType, project: draft } = props;
  const image = draft.images?.[0];
  const { t } = useTranslation("common");
  return (
    <GeneralCard project={project} baseUrl="/create/project/design?draft_id=">
      <GeneralCard.CardHeader>
        <div className="flex justify-between items-center">
          <IfSidebarTag text={t("draft")} />
        </div>
      </GeneralCard.CardHeader>
      <GeneralCard.CardBody>
        <div className="h-60 bg-base-200 rounded-lg flex items-center justify-center overflow-hidden">
          {!image && projectType && (
            <div className="opacity-40">
              <ProjectTypeRoundIcon projectType={projectType} />
            </div>
          )}
          {image && <img alt={image.name} src={window.URL.createObjectURL(image)} />}
        </div>
        <GeneralCard.ProjectTitleAndStats />
      </GeneralCard.CardBody>
      <GeneralCard.CardFooter>
        <GeneralCard.Tags />
      </GeneralCard.CardFooter>
    </GeneralCard>
  );
}
