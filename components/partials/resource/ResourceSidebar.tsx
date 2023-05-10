import AddStar from "components/AddStar";
import OshTool from "components/Osh";
import { useProject } from "components/layout/FetchProjectLayout";
import ClaimCard from "./sidebar/ClaimCard";
import TechnicalInfoCard from "./sidebar/TechnicalInfoCard";

export default function ResourceSidebar() {
  const { project } = useProject();
  return (
    <div className="lg:col-span-1 order-first lg:order-last">
      <div className="w-full justify-end flex pb-3">
        <AddStar id={project.id!} owner={project.primaryAccountable!.id} />
      </div>
      <ClaimCard />
      <TechnicalInfoCard />
      <OshTool />
    </div>
  );
}
