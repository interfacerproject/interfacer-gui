import { Tabs } from "@bbtgnn/polaris-interfacer";
import { SectionDescriptor } from "@bbtgnn/polaris-interfacer/build/ts/latest/src/types";
import { ClipboardListIcon, CubeIcon } from "@heroicons/react/outline";
import EmptyState from "components/EmptyState";
import { useUser } from "components/layout/FetchUserLayout";
import ProjectsCards, { CardType, ProjectsCardsProps } from "components/ProjectsCards";
import { useAuth } from "hooks/useAuth";
import useFilters from "hooks/useFilters";
import { useDrafts } from "hooks/useFormSaveDraft";
import useStorage from "hooks/useStorage";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";

const ProfileTabs = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const { tab } = router.query;
  const initialTab = tab ? Number(tab) : 0;
  const [projectTabSelected, setProjectTabSelected] = useState(initialTab);
  const handleProjectTabChange = useCallback((selectedTabIndex: number) => setProjectTabSelected(selectedTabIndex), []);

  const { proposalFilter } = useFilters();
  const { user } = useAuth();
  const { id } = useUser();
  const { getItem } = useStorage();
  const isUser = user?.ulid === id;

  const hasCollectedProjects = isUser && !!getItem("projectsCollected");

  const { drafts: draftsSaved } = useDrafts();

  let collectedProjects: { id: string[] } = {
    id: [],
  };
  if (hasCollectedProjects) {
    collectedProjects["id"] = JSON.parse(getItem("projectsCollected"));
  }
  proposalFilter.primaryAccountable = [id];

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

  const draftTab = {
    id: "Drafts",
    content: (
      <span className="flex items-center space-x-4">
        <ClipboardListIcon className="w-5 h-5 mr-1" />
        {t("Drafts")}
      </span>
    ),
  };

  if (isUser) {
    tabs.push(draftTab);
  }

  const userProjects: ProjectsCardsProps = {
    filter: proposalFilter,
    hideHeader: false,
    hideFilters: false,
    header: isUser ? t("My projects") : t("Projects"),
    emptyState: (
      <EmptyState
        heading={t("No projects yet")}
        description={t("Create a project to get started :)")}
        primaryAction={{ label: t("Create a new project"), url: "/create/project" }}
      />
    ),
  };

  const inListProjects: ProjectsCardsProps = {
    header: t("My list"),
    filter: collectedProjects,
    hideHeader: false,
    emptyState: (
      <EmptyState
        heading={t("Empty list")}
        description={t("Use the ‘Add to list’ button to save your favorite projects here")}
      />
    ),
  };

  const draftProjects = {
    header: t("My drafts"),
    type: CardType.DRAFT,
    drafts: draftsSaved,
  };
  const projectsCardsProps = [userProjects, inListProjects, draftProjects];

  return (
    <Tabs tabs={tabs} selected={projectTabSelected} onSelect={handleProjectTabChange}>
      <ProjectsCards {...projectsCardsProps[projectTabSelected]} />
    </Tabs>
  );
};

export default ProfileTabs;
