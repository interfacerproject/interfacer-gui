import { EconomicResource } from "lib/types";
import GeneralCard from "./GeneralCard";

export interface ProjectCardProps {
  project: Partial<EconomicResource>;
}

export default function ProjectCard(props: ProjectCardProps) {
  const { project } = props;

  return (
    <GeneralCard project={project} CardFooter={<GeneralCard.Tags />}>
      <GeneralCard.UserAndStarHeader />
      <GeneralCard.CardBody>
        <GeneralCard.CardBody.StatsDisplay />
      </GeneralCard.CardBody>
    </GeneralCard>
  );
}
