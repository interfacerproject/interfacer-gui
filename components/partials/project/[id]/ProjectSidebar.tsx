import AddStar from "components/AddStar";
import { useProject } from "components/layout/FetchProjectLayout";
import OshTool from "components/Osh";
import { useAuth } from "hooks/useAuth";
import ActionsCard from "./sidebar/ActionsCard";
import ContributionsCard from "./sidebar/ContributionsCard";
import RelationsCard from "./sidebar/RelationsCard";
import SocialCard from "./sidebar/SocialCard";

export default function ProjectSidebar() {
  const { project } = useProject();

  return (
    <div className="lg:col-span-1 order-first lg:order-last">
      <div className="w-full justify-end flex pb-3">
        <AddStar id={project.id!} owner={project.primaryAccountable!.id} />
      </div>
      <SocialCard />
      <ActionsCard />
      <ContributionsCard />
      <RelationsCard />
      <OshTool />
    </div>
  );
}
