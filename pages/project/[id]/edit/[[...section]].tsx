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

import { gql, useQuery } from "@apollo/client";
import { useAuth } from "hooks/useAuth";
import { EconomicResource } from "lib/types";
import { GetStaticPaths } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import React, { FunctionComponent } from "react";

// Components
import { Spinner } from "@bbtgnn/polaris-interfacer";

// Partials
import EditMain from "components/partials/project/edit/EditMain";

//

const EditProject = () => {
  const router = useRouter();
  const { id, section: sectionParam } = router.query;

  /* Auth */

  // TODO: Send away if user not owner
  const { user } = useAuth();

  /* Dynamic routing */

  const sections: Record<string, FunctionComponent<{ project: EconomicResource }>> = {
    main: EditMain,
  };
  const sectionsKeys = Object.keys(sections);

  let sectionName = "main";
  if (sectionParam && sectionsKeys.includes(sectionParam[0])) {
    sectionName = sectionParam[0];
  }

  /* Fetch project */

  const { loading, data } = useQuery<{ economicResource: EconomicResource }>(GET_PROJECT_TO_EDIT, {
    variables: { id },
  });
  const project = data?.economicResource;

  if (loading) return <Spinner />;
  if (!project) return null;

  /* Render */

  return React.createElement(sections[sectionName], { project });
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

export default EditProject;

//

export const GET_PROJECT_TO_EDIT = gql`
  query getProjectToEdit($id: ID!) {
    economicResource(id: $id) {
      id
      name
      note
      metadata
      license
      repo
      classifiedAs
      primaryAccountable {
        id
        name
      }
      currentLocation {
        id
        name
        mappableAddress
      }
      images {
        hash
        name
        mimeType
        bin
      }
    }
  }
`;
