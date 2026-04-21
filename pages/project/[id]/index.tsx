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
import { createContext, Dispatch, ReactElement, SetStateAction, useContext, useMemo, useState } from "react";

import FetchProjectLayout, { useProject } from "components/layout/FetchProjectLayout";
import Layout from "components/layout/Layout";
import SuccessBanner from "components/partials/project/[id]/SuccessBanner";
import ProjectDetailNew from "components/ProjectDetailNew";
import findProjectImages from "lib/findProjectImages";
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
  const [selected, setSelected] = useState(0);

  const { project } = useProject();
  const images = useMemo(() => findProjectImages(project), [project]);

  // (Temp) Redirect if project is LOSH owned
  if (process.env.NEXT_PUBLIC_LOSH_ID == project?.primaryAccountable?.id) {
    router.push(`/resource/${id}`);
  }

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
          images: images?.map((image, i) => ({
            url: image,
            width: 800,
            height: 600,
            alt: `${project?.name}${i > 0 ? " " + i : ""}`,
            type: project?.images?.[i]?.mimeType || "image/jpeg",
          })),
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
        <ProjectDetailNew />
      </ProjectTabsContext.Provider>
    </>
  );
};

//

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
