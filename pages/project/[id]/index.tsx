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
import useStorage from "hooks/useStorage";
import { QUERY_RESOURCE, QUERY_RESOURCE_PROPOSAlS } from "lib/QueryAndMutation";
import { EconomicResource, ResourceProposalsQuery, ResourceProposalsQueryVariables } from "lib/types";
import { GetStaticPaths } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import Tree from "react-d3-tree";

// Components
import { Button, Frame, Icon, Modal, Spinner, Stack, Tabs, Text, Toast } from "@bbtgnn/polaris-interfacer";
import { DuplicateMinor, MaximizeMinor } from "@shopify/polaris-icons";
import BrBreadcrumb from "components/brickroom/BrBreadcrumb";
import FullWidthBanner from "components/FullWidthBanner";
import ProjectDetailOverview from "components/ProjectDetailOverview";
import RelationshipTree from "components/RelationshipTree";
import Link from "next/link";

import dynamic from "next/dynamic";
const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

// Icons
import { Cube, Events, ListBoxes, ParentChild, Purchase } from "@carbon/icons-react";
import BrThumbinailsGallery from "components/brickroom/BrThumbinailsGallery";
import ContributionsTable from "components/ContributionsTable";
import ContributorsTable from "components/ContributorsTable";
<<<<<<< HEAD
import ProjectSidebar from "components/partials/project/[id]/ProjectSidebar";
=======
import ProjectContributors from "components/ProjectContributors";
import ProjectDisplay from "components/ProjectDisplay";
import ProjectLicenses from "components/ProjectLicenses";
>>>>>>> 2634a9c (feat: ✨ display design in product page)
import ProjectTypeChip from "components/ProjectTypeChip";
import { ProjectType } from "components/types";

//

const Project = () => {
  const { getItem, setItem } = useStorage();
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;
  const { t } = useTranslation("common");
  const [project, setProject] = useState<EconomicResource | undefined>();
  const [inList, setInList] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  const [selected, setSelected] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const ref = useRef(null);

  const { loading, data, startPolling, refetch } = useQuery<{ economicResource: EconomicResource }>(QUERY_RESOURCE, {
    variables: { id: id },
  });

  const { data: contributions } = useQuery<ResourceProposalsQuery, ResourceProposalsQueryVariables>(
    QUERY_RESOURCE_PROPOSAlS,
    {
      variables: { id: id as string },
    }
  );
  startPolling(12000);

  // (Temp) Redirect if project is LOSH owned
  if (process.env.NEXT_PUBLIC_LOSH_ID == data?.economicResource?.primaryAccountable?.id) {
    router.push(`/resource/${id}`);
  }

  useEffect(() => {
    const _project: EconomicResource | undefined = data?.economicResource;
    setProject(_project);
    const singleImage = typeof _project?.metadata?.image === "string";
    const metadataImage = singleImage ? [_project?.metadata?.image] : _project?.metadata?.image || [];
    const _images =
      _project && _project.images!.length > 0
        ? _project?.images?.filter(image => !!image.bin).map(image => `data:${image.mimeType};base64,${image.bin}`)
        : metadataImage;
    setImages(_images);
    if (ref.current) {
      //@ts-ignore
      setWidth(ref.current.offsetWidth);
      //@ts-ignore
      setHeight(ref.current.offsetHeight);
    }
  }, [data, ref, selected]);

  useEffect(() => {
    const _list = getItem("projectsCollected");
    const _listParsed = _list ? JSON.parse(_list) : [];
    setInList(_listParsed.includes(project?.id));
  }, [project, getItem]);

  const handleCollect = () => {
    const _list = getItem("projectsCollected");
    const _listParsed = _list ? JSON.parse(_list) : [];
    if (_listParsed.includes(project!.id)) {
      setItem("projectsCollected", JSON.stringify(_listParsed.filter((a: string) => a !== project!.id)));
      setInList(false);
    } else {
      const _listParsedUpdated = [..._listParsed, project?.id];
      setItem("projectsCollected", JSON.stringify(_listParsedUpdated));
      setInList(true);
    }
  };

  // Tabs setup
  const handleTabChange = useCallback((selectedTabIndex: number) => setSelected(selectedTabIndex), []);

  //

  const [active, setActive] = useState(false);
  const toggleActive = useCallback(() => setActive(active => !active), []);

  function copyDPP() {
    navigator.clipboard.writeText(JSON.stringify(data?.economicResource.traceDpp, null, 2));
    setActive(true);
  }

  // map trace dpp to treeData
  const dppToTreeData = (dpp: any) => {
    return dpp?.children.map((child: any) => {
      return {
        name: child.type,
        children: dppToTreeData(child),
        attributes: { name: child.node.name || child.node.action_id },
      };
    });
  };

  const [activeTree, setActiveTree] = useState(false);

  // DPP Tree
  const translate = { x: width / 2, y: 20 };
  const treeData = dppToTreeData(data?.economicResource.traceDpp);

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

  if (loading) return <Spinner />;
  if (!project) return null;
  const isDesign = project?.conformsTo.name === ProjectType.DESIGN;
  const isProduct = project?.conformsTo.name === ProjectType.PRODUCT;
  const licenses = project?.metadata?.licenses?.lenght > 0 && project?.metadata?.licenses;
  const design = project?.metadata?.design;

  const sidebar = (
    <ProjectSidebar project={project} contributions={contributions!} refetch={refetch} setSelected={setSelected} />
  );

  return (
    <>
      <FullWidthBanner open={viewCreatedBanner} onClose={closeBanner}>
        <Text as="p" variant="bodyMd">
          {t("Project succesfully created!")}
        </Text>
      </FullWidthBanner>

      {isOwner && (
        <FullWidthBanner open status="basic">
          <Text as="p" variant="bodySm">
            {t("This project is yours")}
          </Text>
          <Link href={`/project/${project.id}/edit`}>
            <Button monochrome outline>
              {t("Edit")}
            </Button>
          </Link>
        </FullWidthBanner>
      )}

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
                  { name: project.conformsTo.name, href: `/projects?conformTo=${project.conformsTo.id}` },
                ]}
              />
              <ProjectTypeChip projectNode={project} />
              <Text as="h1" variant="heading2xl">
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
              {selected == 1 && <RelationshipTree project={data?.economicResource} />}
              {selected == 2 && (
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <Text as="h1" variant="headingXl">
                        {t("Tree view")}
                      </Text>
                      <div className="space-x-2">
                        <Button onClick={copyDPP} icon={<Icon source={DuplicateMinor} />}>
                          {t("Copy DPP")}
                        </Button>
                      </div>
                    </div>
                    <div className="border-1 border-border-subdued bg-white rounded-md h-64 relative">
                      <div className="absolute bottom-4 right-4">
                        <Button onClick={() => setActiveTree(true)} icon={<Icon source={MaximizeMinor} />}>
                          {t("Full screen")}
                        </Button>
                      </div>
                      <Tree
                        data={treeData}
                        orientation="vertical"
                        nodeSize={{ x: 300, y: 100 }}
                        translate={{ x: 150, y: 20 }}
                        zoom={0.5}
                        hasInteractiveNodes={false}
                        zoomable={false}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <Text as="h1" variant="headingXl">
                        {t("JSON view")}
                      </Text>
                      <Button onClick={copyDPP} icon={<Icon source={DuplicateMinor} />}>
                        {t("Copy DPP")}
                      </Button>
                    </div>
                    <DynamicReactJson
                      src={data?.economicResource.traceDpp}
                      collapsed={3}
                      enableClipboard={true}
                      displayDataTypes={false}
                      sortKeys={true}
                    />
                  </div>
                </div>
              )}
              <Modal
                fullScreen
                large
                open={activeTree}
                onClose={() => setActiveTree(false)}
                title={t("Digital Product Passport Tree")}
              >
                <Modal.Section>
                  <div className="flex justify-end">
                    <Text as="p" variant="bodyMd" color="subdued">
                      {t("Pan to move, pinch to zoom")}
                    </Text>
                  </div>
                  <div className="h-[100vh]" ref={ref}>
                    <Tree
                      data={treeData}
                      zoom={1}
                      translate={{ x: 200, y: 50 }}
                      orientation="vertical"
                      nodeSize={{ x: 300, y: 100 }}
                    />
                  </div>
                </Modal.Section>
              </Modal>

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
        <div className="lg:col-span-1 order-first lg:order-last">
          {/* Project info */}
          <div className="w-full justify-end flex pb-3">
            {user && <AddStar id={project.id} owner={project.primaryAccountable.id} />}
          </div>
          <Card sectioned>
            <Stack vertical>
              {project.repo && (
                <Button primary url={project.repo} icon={<Icon source={LinkMinor} />} fullWidth size="large">
                  {t("Go to source")}
                </Button>
              )}
              <Button id="addToList" size="large" onClick={handleCollect} fullWidth icon={<Icon source={PlusMinor} />}>
                {inList ? t("Remove from list") : t("Add to list")}
              </Button>
              {user && <WatchButton id={project.id} owner={project.primaryAccountable.id} />}
              <div className="space-y-1">
                <Text as="p" variant="bodyMd">
                  {t("By:")}
                </Text>
                <BrDisplayUser
                  id={project.primaryAccountable.id}
                  name={project.primaryAccountable.name}
                  location={project.currentLocation?.name}
                />
              </div>
            </Stack>
          </Card>

          {/* Actions */}
          {(licenses || design) && (
            <Card sectioned>
              <Stack vertical spacing="loose">
                {licenses && <ProjectLicenses project={project} />}

                {design && (
                  <Link href={`/project/${design}`}>
                    <a>
                      <ProjectDisplay projectId={design} isProductDesign />
                    </a>
                  </Link>
                )}
              </Stack>
            </Card>
          )}
          {/* Contributions */}
          <Card sectioned>
            <Stack vertical>
              <Text as="h2" variant="headingMd">
                {t("Contributions")}
              </Text>
              <Text color="success" as="p" variant="bodyMd">
                {t("{{contributors}} contributors", { contributors: project.metadata.contributors?.length || 0 })}
              </Text>
              <ProjectContributors projectNode={project} />
              <Text color="success" as="p" variant="bodyMd">
                {t("{{contributions}} contributions", { contributions: contributions?.proposals.edges.length })}
              </Text>
              <Button
                id="contribute"
                icon={<MagicWand />}
                size="large"
                fullWidth
                primary
                onClick={() => router.push(`/create/contribution/${id}`)}
              >
                {t("Make a contribution")}
              </Button>
              <Button
                id="seeContributions"
                icon={<ListBoxes />}
                size="large"
                fullWidth
                monochrome
                onClick={() => setSelected(5)}
              >
                {t("All contributions")}
              </Button>
            </Stack>
          </Card>
          {/* Relations */}
          <Card sectioned>
            <Stack vertical spacing="loose">
              <Text as="h2" variant="headingMd">
                {t("Relations")}
              </Text>
              <Text color="success" as="p" variant="bodyMd">
                {t("{{related}} related projects", { related: project.metadata.relations?.length || 0 })}
              </Text>
              <Button
                id="seeRelations"
                icon={<ParentChild />}
                size="large"
                fullWidth
                monochrome
                onClick={() => setSelected(1)}
              >
                {t("All relations")}
              </Button>
            </Stack>
          </Card>
        </div>
      </div>

      <Frame>{active ? <Toast content={t("DPP copied!")} onDismiss={toggleActive} duration={2000} /> : null}</Frame>
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

//

export default Project;
