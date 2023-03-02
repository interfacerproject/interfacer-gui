import devLog from "lib/devLog";
import { EconomicResource } from "lib/types";
import AvatarUsers from "./AvatarUsers";

const ProjectContributors = (props: { projectNode: Partial<EconomicResource> }) => {
  const contributors = props.projectNode.metadata?.contributors;
  devLog(contributors);
  return <AvatarUsers users={contributors} size={3} />;
};

export default ProjectContributors;
