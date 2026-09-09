import OshTool from "components/Osh";
import TechnicalInfoCard from "./sidebar/TechnicalInfoCard";
import ClaimCard from "./sidebar/ClaimCard";

export default function ResourceSidebar() {
  return (
    <div className="lg:col-span-1 order-first lg:order-last">
      <ClaimCard />
      <TechnicalInfoCard />
      <OshTool />
    </div>
  );
}
