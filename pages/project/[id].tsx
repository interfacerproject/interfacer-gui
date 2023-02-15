import { useQuery } from "@apollo/client";
import { useAuth } from "hooks/useAuth";
import useStorage from "hooks/useStorage";
import devLog from "lib/devLog";
import { QUERY_RESOURCE } from "lib/QueryAndMutation";
import { EconomicResource } from "lib/types";
import { GetStaticPaths } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import Tree from "react-d3-tree";

// Partials
import ActionsCard from "components/partials/project/actionsCard/ActionsCard";

// Components
import { Button, Card, Frame, Icon, Modal, Spinner, Stack, Tabs, Text, Toast } from "@bbtgnn/polaris-interfacer";
import { DuplicateMinor } from "@shopify/polaris-icons";
import BrBreadcrumb from "components/brickroom/BrBreadcrumb";

import ProjectDetailOverview from "components/ProjectDetailOverview";
import RelationshipTree from "components/RelationshipTree";
import Link from "next/link";

import dynamic from "next/dynamic";
const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

// Icons
import { MergeMinor } from "@shopify/polaris-icons";
import BrThumbinailsGallery from "components/brickroom/BrThumbinailsGallery";
import ContributionsTable from "components/ContributionsTable";
import ContributorsTable from "../../components/ContributorsTable";

//

const Project = () => {
  const { getItem, setItem } = useStorage();
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;
  const { t } = useTranslation("common");
  const [project, setProject] = useState<EconomicResource | undefined>();
  const [images, setImages] = useState<string[]>([]);
  const [selected, setSelected] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const ref = useRef(null);

  const { loading, data, startPolling, refetch } = useQuery<{ economicResource: EconomicResource }>(QUERY_RESOURCE, {
    variables: { id: id },
  });
  startPolling(120000);

  devLog("trace", data?.economicResource.trace);
  devLog("traceDpp", data?.economicResource.traceDpp);

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

  // DPP Tree
  const translate = { x: width / 2, y: 20 };
  const treeData = dppToTreeData(data?.economicResource.traceDpp);

  //

  if (loading) return <Spinner />;
  if (!project) return null;

  return (
    <>
      <div className="flex flex-row p-4">
        <BrBreadcrumb
          crumbs={[
            { name: t("Projects"), href: "/projects" },
            { name: project.conformsTo.name, href: `/projects?conformTo=${project.conformsTo.id}` },
          ]}
        />
      </div>

      {/* Main */}
      <div className="p-4 sm:max-w-xl mx-auto md:max-w-none md:flex md:flex-row md:space-x-12 md:justify-center">
        {/* Content */}
        <div className="grow max-w-xl mb-16 md:mb-0">
          <Stack vertical spacing="extraLoose">
            {/* Title */}
            <Stack vertical spacing="tight">
              <Text as="p" variant="bodyMd">
                {t("This is a")}
                <Link href={`/projects?conformTo=${project.conformsTo.id}`}>
                  <a className="ml-1 font-bold text-primary hover:underline">{project.conformsTo.name}</a>
                </Link>
              </Text>
              <Text as="h1" variant="heading2xl">
                {project.name}
              </Text>
            </Stack>

            <BrThumbinailsGallery images={images} />

            {/* Content */}
            <Stack vertical spacing="loose">
              <Tabs
                tabs={[
                  {
                    id: "overview",
                    content: t("Overview"),
                    accessibilityLabel: t("Project overview"),
                    panelID: "overview-content",
                  },
                  {
                    id: "relationships",
                    content: t("Relationship tree"),
                    accessibilityLabel: t("Relationship tree"),
                    panelID: "relationships-content",
                  },
                  {
                    id: "dpp",
                    content: t("DPP"),
                    accessibilityLabel: t("Digital Product Passport"),
                    panelID: "dpp-content",
                  },
                  {
                    id: "Tree Dpp",
                    content: t("Tree Dpp"),
                    accessibilityLabel: t("Digital Product Passport tree"),
                    panelID: "tree-dpp-content",
                  },
                  {
                    id: "Contributors",
                    content: t("Contributors"),
                    accessibilityLabel: t("Contributors"),
                    panelID: "dpp-content",
                  },
                  {
                    id: "Contributions",
                    content: t("Contributions"),
                    accessibilityLabel: t("Contributions"),
                    panelID: "contributions-content",
                  },
                ]}
                selected={selected}
                onSelect={handleTabChange}
              />

              {selected == 0 && <ProjectDetailOverview project={project} />}
              {selected == 1 && <RelationshipTree dpp={data?.economicResource.traceDpp} />}
              {selected == 2 && (
                <div>
                  <div className="w-full flex justify-end">
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
              )}
              {selected == 3 && (
                <Modal
                  large
                  open={selected == 3}
                  onClose={() => setSelected(1)}
                  title={t("Digital Product Passport Tree")}
                >
                  <Modal.Section>
                    <div className="float-right">
                      <Link href={`https://www.valueflo.ws/`}>
                        <a>{t("To learn terms see ValueFlows ontology")}</a>
                      </Link>
                    </div>
                    <div className="h-[100vh]" ref={ref}>
                      <Tree
                        data={treeData}
                        zoom={1}
                        translate={translate}
                        orientation="vertical"
                        nodeSize={{ x: 300, y: 100 }}
                        dimensions={{ width, height: height / 2 }}
                      />
                    </div>
                  </Modal.Section>
                </Modal>
              )}

              {selected == 4 && (
                <ContributorsTable
                  contributors={project.metadata?.contributors}
                  title={t("Contributors")}
                  // @ts-ignore
                  data={project.trace?.filter((t: any) => !!t.hasPointInTime)[0].hasPointInTime}
                />
              )}
              {selected == 5 && <ContributionsTable id={String(id)} />}
            </Stack>
          </Stack>
        </div>

        {/* Sidebar */}
        <div className="max-w-xs">
          {/* Project info */}
          <Card sectioned>
            <Stack vertical>
              <div>
                <Text as="h2" variant="headingMd">
                  {"ID"}
                </Text>
                <p className="text-primary font-mono">{project.id}</p>
              </div>
            </Stack>
          </Card>

          {/* Actions */}
          <ActionsCard project={project} />

          {/* Contributions */}
          {project.primaryAccountable.id != user?.ulid && (
            <Card sectioned>
              <Stack vertical>
                <Text as="h2" variant="headingMd">
                  {t("Contributions")}
                </Text>
                <Button
                  id="goToContribution"
                  icon={<Icon source={MergeMinor} />}
                  size="large"
                  fullWidth
                  primary
                  onClick={() => router.push(`/create/contribution/${id}`)}
                >
                  {t("Make a contribution")}
                </Button>
              </Stack>
            </Card>
          )}
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
