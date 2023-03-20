// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { useQuery } from "@apollo/client";
import { useAuth } from "hooks/useAuth";
import { QUERY_RESOURCE_PROPOSAlS } from "lib/QueryAndMutation";
import { ResourceProposalsQuery, ResourceProposalsQueryVariables } from "lib/types";
import { GetStaticPaths } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";

// Components
import { Button, Stack, Tabs, Text } from "@bbtgnn/polaris-interfacer";
import BrBreadcrumb from "components/brickroom/BrBreadcrumb";
import FullWidthBanner from "components/FullWidthBanner";
import ProjectDetailOverview from "components/ProjectDetailOverview";
import RelationshipTree from "components/RelationshipTree";
import Link from "next/link";

import dynamic from "next/dynamic";
const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

// Icons
import Layout from "components/layout/Layout";
import { Cube, Events, ListBoxes, ParentChild, Purchase } from "@carbon/icons-react";
import BrThumbinailsGallery from "components/brickroom/BrThumbinailsGallery";
import ContributionsTable from "components/ContributionsTable";
import ContributorsTable from "components/ContributorsTable";
import FetchProjectLayout, { useProject } from "components/layout/FetchProjectLayout";
import ProjectDpp from "components/partials/project/ProjectDpp";
import ProjectSidebar from "components/partials/project/[id]/ProjectSidebar";
import ProjectTypeChip from "components/ProjectTypeChip";
import { NextPageWithLayout } from "pages/_app";
import CreatedBanner from "components/partials/project/CreatedBanner";
import EditBanner from "components/partials/project/EditBanner";

//

const Project: NextPageWithLayout = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;
  const { t } = useTranslation("common");
  // const [project, setProject] = useState<EconomicResource | undefined>();
  const [images, setImages] = useState<string[]>([]);
  const [selected, setSelected] = useState(0);

  const { project } = useProject();

  const ref = useRef(null);

  const { data: contributions } = useQuery<ResourceProposalsQuery, ResourceProposalsQueryVariables>(
    QUERY_RESOURCE_PROPOSAlS,
    {
      variables: { id: id as string },
    }
  );

  // (Temp) Redirect if project is LOSH owned
  if (process.env.NEXT_PUBLIC_LOSH_ID == project?.primaryAccountable?.id) {
    router.push(`/resource/${id}`);
  }

  useEffect(() => {
    const singleImage = typeof project?.metadata?.image === "string";
    const metadataImage = singleImage ? [project?.metadata?.image] : project?.metadata?.image || [];
    const _images =
      project && project.images!.length > 0
        ? project?.images?.filter(image => !!image.bin).map(image => `data:${image.mimeType};base64,${image.bin}`)
        : metadataImage;
    setImages(_images);
  }, [project, ref, selected]);

  // Tabs setup
  const handleTabChange = useCallback((selectedTabIndex: number) => setSelected(selectedTabIndex), []);

  //
  // Check if project has been just created
  const isCreated = router.query.created === "true";

  const [viewCreatedBanner, setViewCreatedBanner] = useState(false);

  useEffect(() => {
    setViewCreatedBanner(isCreated);
  }, [isCreated]);

  const closeBanner = () => {
    setViewCreatedBanner(false);
  };

  const isOwner = project?.primaryAccountable?.id === user?.ulid;

  //

  if (!project) return null;

  const sidebar = <ProjectSidebar project={project} contributions={contributions!} setSelected={setSelected} />;

  return (
    <>
      <CreatedBanner />
      <EditBanner />

      {/* Main */}
      <div className="p-4 container mx-auto grid grid-cols-1 lg:grid-cols-4 max-w-6xl bg-[#f8f7f4]">
        {/* Content */}
        <div className="lg:col-span-3 lg:pr-4">
          <Stack vertical spacing="extraLoose">
            {/* Title */}
            <Stack vertical spacing="tight">
              <BrBreadcrumb
                crumbs={[
                  { name: t("Projects"), href: "/projects" },
                  { name: project.conformsTo!.name, href: `/projects?conformTo=${project.conformsTo!.id}` },
                ]}
              />
              <ProjectTypeChip projectNode={project} />
              <Text as="h1" variant="heading2xl" id="project-title">
                {project.name}
              </Text>
              <p className="text-primary font-mono">
                {t("ID:")} {project.id}
              </p>
            </Stack>

            <BrThumbinailsGallery images={images} />

            <div className="block lg:hidden">{sidebar}</div>

            {/* Content */}
            <Stack vertical spacing="loose">
              <Tabs
                tabs={[
                  {
                    id: "overview",
                    content: (
                      <span className="flex items-center gap-2">
                        <Cube />
                        {t("Overview")}
                      </span>
                    ),
                    accessibilityLabel: t("Project overview"),
                    panelID: "overview-content",
                  },
                  {
                    id: "relationships",
                    content: (
                      <span className="flex items-center gap-2">
                        <ParentChild />
                        {t("Relationship tree")}
                      </span>
                    ),
                    accessibilityLabel: t("Relationship tree"),
                    panelID: "relationships-content",
                  },
                  {
                    id: "dpp",
                    content: (
                      <span className="flex items-center gap-2">
                        <Purchase />
                        {t("DPP")}
                      </span>
                    ),
                    accessibilityLabel: t("Digital Product Passport"),
                    panelID: "dpp-content",
                  },
                  {
                    id: "Contributors",
                    content: (
                      <span className="flex items-center gap-2">
                        <Events />
                        {t("Contributors")}
                      </span>
                    ),
                    accessibilityLabel: t("Contributors"),
                    panelID: "dpp-content",
                  },
                  {
                    id: "Contributions",
                    content: (
                      <span className="flex items-center gap-2">
                        <ListBoxes />
                        {t("Contributions")}
                      </span>
                    ),
                    accessibilityLabel: t("Contributions"),
                    panelID: "contributions-content",
                  },
                ]}
                selected={selected}
                onSelect={handleTabChange}
              />

              {selected == 0 && <ProjectDetailOverview project={project} />}
              {selected == 1 && <RelationshipTree project={project} />}
              {selected == 2 && <ProjectDpp id={project.id!} />}

              {selected == 3 && (
                <ContributorsTable
                  contributors={project.metadata?.contributors}
                  title={t("Contributors")}
                  // @ts-ignore
                  data={project.trace?.filter((t: any) => !!t.hasPointInTime)[0].hasPointInTime}
                />
              )}
              {selected == 4 && <ContributionsTable id={String(id)} title={t("Contributions")} />}
            </Stack>
          </Stack>
        </div>

        <div className="hidden lg:block">{sidebar}</div>
        {/* Sidebar */}
      </div>
    </>
  );
};

//

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "signInProps", "SideBarProps"])),
    },
  };
}

Project.publicPage = true;
Project.getLayout = (page: ReactElement) => (
  <FetchProjectLayout>
    <Layout>{page}</Layout>
  </FetchProjectLayout>
);

//

export default Project;
