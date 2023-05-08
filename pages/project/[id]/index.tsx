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

import { GetStaticPaths } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { createContext, Dispatch, ReactElement, SetStateAction, useContext, useEffect, useState } from "react";

// Components
import { Stack } from "@bbtgnn/polaris-interfacer";

// Icons
import BrThumbinailsGallery from "components/brickroom/BrThumbinailsGallery";
import FetchProjectLayout, { useProject } from "components/layout/FetchProjectLayout";
import Layout from "components/layout/Layout";
import EditBanner from "components/partials/project/[id]/EditBanner";
import ProjectHeader from "components/partials/project/[id]/ProjectHeader";
import ProjectSidebar from "components/partials/project/[id]/ProjectSidebar";
import ProjectTabs from "components/partials/project/[id]/ProjectTabs";
import SuccessBanner from "components/partials/project/[id]/SuccessBanner";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "pages/_app";

//opengraph
import { NextSeo } from "next-seo";

interface ProjectTabsContextValue {
  selected: number;
  setSelected: Dispatch<SetStateAction<number>>;
}

export const ProjectTabsContext = createContext<ProjectTabsContextValue>({} as ProjectTabsContextValue);
export const useProjectTabs = () => useContext(ProjectTabsContext);

const Project: NextPageWithLayout = () => {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { id } = router.query;
  const [images, setImages] = useState<string[]>([]);
  const [selected, setSelected] = useState(0);

  const { project } = useProject();

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
  }, [project]);

  if (!project) return null;

  return (
    <>
      <NextSeo
        title={project?.name}
        description={project?.note || undefined}
        canonical="https://www.canonical.ie/"
        openGraph={{
          url: window.location.origin + router.asPath,
          title: project?.name,
          description: project?.note || undefined,
          images: [
            {
              url: images[0],
              width: 800,
              height: 600,
              alt: project?.name,
              type: project?.images?.[0]?.mimeType || "image/jpeg",
            },
          ],
          siteName: "Interfacer-gui",
        }}
        twitter={{
          handle: "@handle",
          site: "@site",
          cardType: "summary_large_image",
        }}
      />
      <ProjectTabsContext.Provider value={{ selected, setSelected }}>
        <SuccessBanner param="created">{t("Project succesfully created!")}</SuccessBanner>
        <EditBanner />
        <div className="p-4 container mx-auto flex max-w-6xl bg-[#f8f7f4] space-x-4">
          <div className="grow">
            <Stack vertical spacing="extraLoose">
              <ProjectHeader />
              <BrThumbinailsGallery images={images} />
              <div className="block lg:hidden">
                <ProjectSidebar />
              </div>
              <ProjectTabs />
            </Stack>
          </div>
          <div className="hidden lg:block w-80">
            <ProjectSidebar />
          </div>
        </div>
      </ProjectTabsContext.Provider>
    </>
  );
};

//

Project.getLayout = page => {
  return (
    <Layout>
      <FetchProjectLayout>{page}</FetchProjectLayout>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [],
    fallback: "blocking",
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
