import { Button, Icon, Popover, Stack } from "@bbtgnn/polaris-interfacer";
import { ShareMinor } from "@shopify/polaris-icons";
import OshTool from "components/Osh";

import ContributionsCard from "./sidebar/ContributionsCard";
import RelationsCard from "./sidebar/RelationsCard";
import SocialCard from "./sidebar/SocialCard";
import TechnicalInfoCard from "./sidebar/TechnicalInfoCard";
import ShareButton from "components/ShareButton";

export default function ProjectSidebar() {
  return (
    <div className="lg:col-span-1 order-first lg:order-last">
      <div className="w-full justify-end flex pb-3 gap-2">
        <ShareButton />
      </div>
      <SocialCard />
      <TechnicalInfoCard />
      <ContributionsCard />
      <RelationsCard />
      <OshTool />
    </div>
  );
}
