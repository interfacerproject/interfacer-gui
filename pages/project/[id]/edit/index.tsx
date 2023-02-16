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
import { QUERY_RESOURCE } from "lib/QueryAndMutation";
import { EconomicResource } from "lib/types";
import { GetStaticPaths } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

// Components
import { Spinner } from "@bbtgnn/polaris-interfacer";

//

const EditProject = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const { loading, data } = useQuery<{ economicResource: EconomicResource }>(QUERY_RESOURCE, {
    variables: { id },
  });
  const project = data?.economicResource;

  if (loading) return <Spinner />;
  if (!project) return null;

  return (
    <>
      <div>{"Edit!"}</div>
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

//

export default EditProject;
