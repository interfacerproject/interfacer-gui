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

import { Checkbox, Stack, Tabs } from "@bbtgnn/polaris-interfacer";
import { Cube, Events } from "@carbon/icons-react";
import ProjectsCards from "components/ProjectsCards";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";
import AgentsTable from "../components/AgentsTable";
import Layout from "../components/layout/SearchLayout";
import SearchBar from "../components/SearchBar";
import useFilters from "../hooks/useFilters";
import { NextPageWithLayout } from "./_app";

const Search: NextPageWithLayout = () => {
  const { q } = useRouter().query;
  const [checked, setChecked] = useState(false);
  const [searchType, setSearchType] = useState(0);
  const { proposalFilter } = useFilters();
  const { t } = useTranslation("common");

  //This is an hugly hack to make the search work until we fix the boolean logic at backend
  const isNotEmptyObj = (obj: any) => Boolean(Object.keys(obj).find(key => obj[key]?.length > 0));
  delete proposalFilter.notCustodian;
  const projectsOrFilter = {
    orName: q?.toString(),
    ...(!checked && { orNote: q?.toString() }),
  };
  const projectsFilter = {
    name: q?.toString(),
    ...(!checked && { orNote: q?.toString() }),
  };
  const filters = isNotEmptyObj(proposalFilter) ? { ...proposalFilter, ...projectsFilter } : projectsOrFilter;

  //

  return (
    <div className="container mx-auto">
      <div className="p-8">
        <div className="mb-6">
          <h1>
            <span className="text-[#5DA091]">{t("Search result for") + ": "}</span>
            {`"${q}"`}
          </h1>

          <div className="flex flex-col gap-2 my-8">
            <SearchBar />
            <Checkbox label={t("do not search inside the the description")} checked={checked} onChange={setChecked} />
          </div>
        </div>
        <Stack vertical spacing="loose">
          <Tabs
            tabs={[
              {
                id: "projects",
                content: (
                  <span className="flex items-center gap-2">
                    <Cube />
                    {t("Projects")}
                  </span>
                ),
                accessibilityLabel: t("Project overview"),
                panelID: "overview-content",
              },
              {
                id: "people",
                content: (
                  <span className="flex items-center gap-2">
                    <Events />
                    {t("People")}
                  </span>
                ),
                accessibilityLabel: t("Relationship tree"),
                panelID: "relationships-content",
              },
            ]}
            selected={searchType}
            onSelect={setSearchType}
          />
          {searchType === 0 && <ProjectsCards filter={filters} />}
          {searchType === 1 && <AgentsTable hideHeader searchTerm={q?.toString() || ""} />}
        </Stack>
        {/*<ProjectsCards filter={Projectfilter} />*/}
        {/*<ResourcesCards filter={Resourcefilter} />*/}
      </div>
    </div>
  );
};

Search.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Search;
