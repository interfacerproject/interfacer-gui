import { useAuth } from "hooks/useAuth";
import { EconomicResource } from "lib/types";
import AddStar from "./AddStar";
import GeneralCard from "./GeneralCard";

export interface ProjectCardProps {
  project: Partial<EconomicResource>;
}

export default function LoshCard(props: ProjectCardProps) {
  const { project } = props;

  return (
    <GeneralCard project={project}>
      <GeneralCard.CardHeader>
        <GeneralCard.UserAndStarHeader />
      </GeneralCard.CardHeader>
      <GeneralCard.CardBody>
        <GeneralCard.RemoteImage />
        <GeneralCard.ProjectTitleAndStats />
      </GeneralCard.CardBody>
      <GeneralCard.CardFooter>
        <GeneralCard.Tags />
      </GeneralCard.CardFooter>
    </GeneralCard>
  );
}
