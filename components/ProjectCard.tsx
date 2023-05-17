import { EconomicResource } from "lib/types";
import GeneralCard from "./GeneralCard";

export interface ProjectCardProps {
  project: Partial<EconomicResource>;
}

export default function ProjectCard(props: ProjectCardProps) {
  const { project } = props;

  return (
    <GeneralCard project={project}>
      <GeneralCard.CardHeader>
        <GeneralCard.UserAndStarHeader />
      </GeneralCard.CardHeader>
      <GeneralCard.CardBody>
        <GeneralCard.StatsDisplay />
      </GeneralCard.CardBody>
      <GeneralCard.CardFooter>
        <GeneralCard.Tags />
      </GeneralCard.CardFooter>
    </GeneralCard>
  );
}
