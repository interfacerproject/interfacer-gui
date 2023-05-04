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
import BrBreadcrumb from "components/brickroom/BrBreadcrumb";
import { QUERY_RESOURCE } from "lib/QueryAndMutation";
import { EconomicResource } from "lib/types";
import type { GetStaticPaths, NextPage } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import Spinner from "../../components/brickroom/Spinner";
import LoshPresentation from "../../components/LoshPresentation";
import devLog from "../../lib/devLog";

const Resource: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useTranslation("ResourceProps");
  const { loading, data } = useQuery<{ economicResource: EconomicResource }>(QUERY_RESOURCE, {
    variables: { id: id },
  });
  const e = data?.economicResource;

  // (Temp)) Redirect if is not a reosurce owned by Losh
  if (e && process.env.NEXT_PUBLIC_LOSH_ID != e?.primaryAccountable?.id) {
    router.push(`/project/${id}`);
  }

  const handleClaim = () => router.push(`/resource/claim/${id}`);
  const claimable = e?.accountingQuantity.hasNumericalValue > 0;

  return (
    <div>
      {loading && <Spinner />}
      {!loading && e && (
        <>
          <div className="">
            <div className="w-full p-2 md:p-8">
              <BrBreadcrumb
                crumbs={[
                  { name: t("Projects"), href: "/projects" },
                  { name: e.conformsTo.name, href: `/projects?conformTo=${e.conformsTo.id}` },
                  { name: t("Imported from Losh"), href: `/resources` },
                ]}
              />
            </div>
          </div>
          <LoshPresentation economicResource={data?.economicResource} goToClaim={handleClaim} canClaim={claimable} />
        </>
      )}
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

export default Resource;
