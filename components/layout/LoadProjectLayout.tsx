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
import { Banner } from "@bbtgnn/polaris-interfacer";
import LoadingOverlay from "components/LoadingOverlay";
import ProjectContext from "contexts/ProjectContext";
import { EconomicResource, QueryProjectLayoutQuery, QueryProjectLayoutQueryVariables } from "lib/types";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React, { ReactNode } from "react";

//

interface LayoutProps {
  children: ReactNode;
}

//

const LoadProjectLayout: React.FunctionComponent<LayoutProps> = (layoutProps: LayoutProps) => {
  const { children } = layoutProps;
  const { t } = useTranslation();

  const router = useRouter();
  const { id } = router.query;

  if (!id) router.push("/projects");

  const { data, loading, error } = useQuery<QueryProjectLayoutQuery, QueryProjectLayoutQueryVariables>(
    QUERY_PROJECT_LAYOUT,
    { variables: { id: id as string } }
  );

  if (loading) return <LoadingOverlay />;

  if (error)
    return (
      <Banner title={t("Loading error")} status="critical">
        {error.message}
      </Banner>
    );

  const project = data?.economicResource as Partial<EconomicResource>;

  return <ProjectContext.Provider value={project}>{children}</ProjectContext.Provider>;
};

//

export default LoadProjectLayout;

//

export const QUERY_PROJECT_LAYOUT = gql`
  query QueryProjectLayout($id: ID!) {
    economicResource(id: $id) {
      id
      name
      note
      metadata
      license
      repo
      traceDpp
      trace {
        __typename
        ... on Process {
          id
          name
        }
        ... on EconomicEvent {
          inputOf {
            id
            name
          }
          outputOf {
            id
            name
          }
          hasPointInTime
          action {
            id
            label
            inputOutput
          }
        }
        ... on EconomicResource {
          id
          name
          note
        }
      }
      conformsTo {
        id
        name
      }
      onhandQuantity {
        hasUnit {
          id
          symbol
          label
        }
        hasNumericalValue
      }
      accountingQuantity {
        hasUnit {
          label
          symbol
        }
        hasNumericalValue
      }
      primaryAccountable {
        id
        name
      }
      currentLocation {
        id
        name
        mappableAddress
      }
      primaryAccountable {
        id
        name
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
