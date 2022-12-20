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
import { useCallback, useEffect, useState } from "react";

// Components
import { Button, Card, Frame, Icon, Spinner, Stack, Tabs, Text, Toast } from "@bbtgnn/polaris-interfacer";
import { DuplicateMinor } from "@shopify/polaris-icons";
import AddStar from "components/AddStar";
import ProjectDetailOverview from "components/ProjectDetailOverview";
import BrBreadcrumb from "components/brickroom/BrBreadcrumb";
import BrDisplayUser from "components/brickroom/BrDisplayUser";
import Dpp from "components/Dpp";
import WatchButton from "components/WatchButton";
import Link from "next/link";

import dynamic from "next/dynamic";
const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

// Icons
import { LinkMinor, MergeMinor, PlusMinor } from "@shopify/polaris-icons";
import BrThumbinailsGallery from "components/brickroom/BrThumbinailsGallery";
import ContributorsTable from "../../components/ContributorsTable";

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
  }, [data]);

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

  useEffect(() => {
    const _list = getItem("projectsCollected");
    const _listParsed = _list ? JSON.parse(_list) : [];
    setInList(_listParsed.includes(project?.id));
  }, [project, getItem]);

  // Tabs setup
  const [selected, setSelected] = useState(0);
  const handleTabChange = useCallback((selectedTabIndex: number) => setSelected(selectedTabIndex), []);

  //

  const [active, setActive] = useState(false);
  const toggleActive = useCallback(() => setActive(active => !active), []);

  function copyDPP() {
    navigator.clipboard.writeText(JSON.stringify(data?.economicResource.traceDpp, null, 2));
    setActive(true);
  }

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
                    id: "Contributors",
                    content: t("Contributors"),
                    accessibilityLabel: t("Contributors"),
                    panelID: "dpp-content",
                  },
                ]}
                selected={selected}
                onSelect={handleTabChange}
              />

              {selected == 0 && <ProjectDetailOverview project={project} />}
              {selected == 1 && <Dpp dpp={data?.economicResource.traceDpp} />}
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
                <ContributorsTable
                  contributors={project.metadata?.contributors}
                  title={t("Contributors")}
                  // @ts-ignore
                  data={project.trace?.filter((t: any) => !!t.hasPointInTime)[0].hasPointInTime}
                />
              )}
            </Stack>
          </Stack>
        </div>

        {/* Sidebar */}
        <div>
          {/* Project info */}
          <Card sectioned>
            <Stack vertical>
              <div>
                <Text as="h2" variant="headingMd">
                  {"ID"}
                </Text>
                <p className="text-primary font-mono">{project.id}</p>
              </div>

              <div className="space-y-1">
                <Text as="h2" variant="headingMd">
                  {t("Owner")}
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
          <Card sectioned>
            <Stack vertical>
              {project.repo && (
                <Button url={project.repo} icon={<Icon source={LinkMinor} />} fullWidth size="large">
                  {t("Go to source")}
                </Button>
              )}

              <Button id="addToList" size="large" onClick={handleCollect} fullWidth icon={<Icon source={PlusMinor} />}>
                {inList ? t("Remove from list") : t("Add to list")}
              </Button>

              <WatchButton id={project.id} metadata={project.metadata} />

              <AddStar
                id={project.id}
                metadata={project.metadata}
                userId={user?.ulid}
                onStarred={refetch}
                onDestarred={refetch}
              />
            </Stack>
          </Card>

          {/* Contributions */}
          {project.primaryAccountable.id != user?.ulid && (
            <Card sectioned>
              <Stack vertical>
                <Text as="h2" variant="headingMd">
                  {t("Contributions")}
                </Text>
                <Button
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
