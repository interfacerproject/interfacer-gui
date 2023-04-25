import { Tabs } from "@bbtgnn/polaris-interfacer";
import { ClipboardListIcon, CubeIcon } from "@heroicons/react/outline";
import { useUser } from "components/layout/FetchUserLayout";
import ProjectsCards from "components/ProjectsCards";
import { useAuth } from "hooks/useAuth";
import useFilters from "hooks/useFilters";
import useStorage from "hooks/useStorage";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";

const ProfileTabs = () => {
  const router = useRouter();
  const { tab } = router.query;
  const { t } = useTranslation();
  const { proposalFilter } = useFilters();
  const { user } = useAuth();
  const { id } = useUser();
  const { getItem } = useStorage();
  const isUser = user?.ulid === id;
  const initialTab = tab ? Number(tab) : 0;
  const [projectTabSelected, setProjectTabSelected] = useState(initialTab);
  const handleProjectTabChange = useCallback((selectedTabIndex: number) => setProjectTabSelected(selectedTabIndex), []);
  const hasCollectedProjects = isUser && !!getItem("projectsCollected");
  let collectedProjects: { id: string[] } = {
    id: [],
  };
  if (hasCollectedProjects) {
    collectedProjects["id"] = JSON.parse(getItem("projectsCollected"));
  }

  const tabs = [
    {
      id: "projects",
      content: (
        <span className="flex items-center space-x-4">
          <CubeIcon className="w-5 h-5 mr-1" />
          {t("Projects")}
        </span>
      ),
    },

    {
      id: "list",
      content: (
        <span className="flex items-center space-x-4">
          <ClipboardListIcon className="w-5 h-5 mr-1" />
          {t("List")}
        </span>
      ),
    },
  ];

  const userProjects = {
    filter: proposalFilter,
    hideHeader: false,
    hideFilters: false,
    header: isUser ? t("My projects") : t("Projects"),
  };

  const inListProjects = {
    header: t("My list"),
    filter: collectedProjects,
    hideHeader: false,
  };

  const projectsCardsProps = projectTabSelected === 0 ? { ...userProjects } : { ...inListProjects };

  return (
    <Tabs tabs={tabs} selected={projectTabSelected} onSelect={handleProjectTabChange}>
      <ProjectsCards {...projectsCardsProps} />
    </Tabs>
  );
};

export default ProfileTabs;
