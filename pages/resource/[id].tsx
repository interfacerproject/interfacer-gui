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

import { Stack } from "@bbtgnn/polaris-interfacer";
import BrThumbinailsGallery from "components/brickroom/BrThumbinailsGallery";
import FetchProjectLayout, { useProject } from "components/layout/FetchProjectLayout";
import Layout from "components/layout/Layout";
import ProjectHeader from "components/partials/project/[id]/ProjectHeader";
import ProjectSidebar from "components/partials/project/[id]/ProjectSidebar";
import type { GetStaticPaths } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useEffect, useState } from "react";
import LoshPresentation from "../../components/LoshPresentation";

const Resource: NextPageWithLayout = () => {
  const router = useRouter();
  const { project, loading } = useProject();
  const [images, setImages] = useState<string[]>([]);
  const e = project;

  // (Temp)) Redirect if is not a reosurce owned by Losh
  if (e && process.env.NEXT_PUBLIC_LOSH_ID != e?.primaryAccountable?.id) {
    router.push(`/project/${project.id}`);
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

  const handleClaim = () => router.push(`/resource/claim/${project.id}`);
  const claimable = e?.accountingQuantity?.hasNumericalValue > 0;

  return (
    <div className="p-4 container mx-auto flex max-w-6xl bg-[#f8f7f4] space-x-4">
      <Stack spacing="extraLoose">
        <div className="grow">
          <Stack vertical spacing="extraLoose">
            <ProjectHeader isResource />
            <BrThumbinailsGallery images={images} />
            <div className="block lg:hidden">
              <ProjectSidebar />
            </div>
            {/* <ProjectTabs /> */}
          </Stack>
        </div>
        <div className="hidden lg:block w-80">
          <ProjectSidebar />
        </div>
        {/* <LoshPresentation goToClaim={handleClaim} canClaim={claimable} /> */}
      </Stack>
    </div>
  );
};

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["ResourceProps"])),
    },
  };
}

Resource.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout>
      <FetchProjectLayout>{page}</FetchProjectLayout>
    </Layout>
  );
};

export default Resource;
