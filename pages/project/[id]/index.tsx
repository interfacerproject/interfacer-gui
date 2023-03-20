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
import { ReactElement, useEffect, useRef, useState } from "react";

// Components
import { Stack, Text } from "@bbtgnn/polaris-interfacer";
import BrBreadcrumb from "components/brickroom/BrBreadcrumb";

import dynamic from "next/dynamic";
const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

// Icons
import BrThumbinailsGallery from "components/brickroom/BrThumbinailsGallery";
import FetchProjectLayout, { useProject } from "components/layout/FetchProjectLayout";
import Layout from "components/layout/Layout";
import CreatedBanner from "components/partials/project/[id]/CreatedBanner";
import EditBanner from "components/partials/project/[id]/EditBanner";
import ProjectSidebar from "components/partials/project/[id]/ProjectSidebar";
import ProjectTabs from "components/partials/project/[id]/ProjectTabs";
import ProjectTypeChip from "components/ProjectTypeChip";
import { NextPageWithLayout } from "pages/_app";
import ProjectHeader from "components/partials/project/[id]/ProjectHeader";

//

const Project: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;
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

  if (!project) return null;

  const sidebar = <ProjectSidebar contributions={contributions!} setSelected={setSelected} />;

  return (
    <>
      <CreatedBanner />
      <EditBanner />
      <div className="p-4 container mx-auto grid grid-cols-1 lg:grid-cols-4 max-w-6xl bg-[#f8f7f4]">
        <div className="lg:col-span-3 lg:pr-4">
          <Stack vertical spacing="extraLoose">
            <ProjectHeader />
            <BrThumbinailsGallery images={images} />
            <div className="block lg:hidden">{sidebar}</div>
            <ProjectTabs select={selected} />
          </Stack>
        </div>
        <div className="hidden lg:block">{sidebar}</div>
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
