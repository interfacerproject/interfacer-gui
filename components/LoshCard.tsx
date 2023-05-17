import { useAuth } from "hooks/useAuth";
import { EconomicResource } from "lib/types";
import GeneralCard from "./GeneralCard";
import AddStar from "./AddStar";
import IfSidebarTag from "./brickroom/IfSidebarTag";

export interface ProjectCardProps {
  project: Partial<EconomicResource>;
}

export default function LoshCard(props: ProjectCardProps) {
  const { project } = props;
  const { user } = useAuth();

  return (
    <GeneralCard project={project} baseUrl="/resource/">
      <GeneralCard.CardHeader>
        <div className="flex justify-between items-center">
          <IfSidebarTag text={"losh"} />
          {user && <AddStar id={project?.id!} owner={project?.primaryAccountable!.id} tiny />}
        </div>
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
