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

import { useMutation, useQuery } from "@apollo/client";
import { Button, Card, Link, Stack, Tabs, Text } from "@bbtgnn/polaris-interfacer";
import { ClipboardListIcon, CubeIcon } from "@heroicons/react/outline";
import Avatar from "boring-avatars";
import Spinner from "components/brickroom/Spinner";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import ProjectsTable from "components/ProjectsTable";
import TokensResume from "components/TokensResume";
import { useAuth } from "hooks/useAuth";
import useStorage from "hooks/useStorage";
import { Token } from "hooks/useWallet";
import { CLAIM_DID, FETCH_USER } from "lib/QueryAndMutation";
import type { GetStaticPaths, NextPage } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import useFilters from "../../hooks/useFilters";

//

const Profile: NextPage = () => {
  const { getItem } = useStorage();
  const [didUrl, setDidUrl] = useState<string>(process.env.NEXT_PUBLIC_DID_EXPLORER!);
  const router = useRouter();
  const { id, tab } = router.query;
  const { t } = useTranslation("ProfileProps");
  const { proposalFilter } = useFilters();
  const { user } = useAuth();
  const [selected, setSelected] = useState(0);
  const [projectTabSelected, setProjectTabSelected] = useState(0);
  const handleTabChange = useCallback((selectedTabIndex: number) => setSelected(selectedTabIndex), []);
  const handleProjectTabChange = useCallback((selectedTabIndex: number) => setProjectTabSelected(selectedTabIndex), []);
  const isUser: boolean = id === "my_profile" || id === user?.ulid;
  const idToBeFetch = isUser ? user?.ulid : String(id);

  const [claimPerson] = useMutation(CLAIM_DID);

  const person = useQuery(FETCH_USER, { variables: { id: idToBeFetch } }).data?.person;
  typeof idToBeFetch === "string" ? (proposalFilter.primaryAccountable = [idToBeFetch]) : idToBeFetch!;
  const hasCollectedProjects = isUser && !!getItem("projectsCollected");
  let collectedProjects: { id: string[] } = {
    id: [],
  };
  if (hasCollectedProjects) {
    collectedProjects["id"] = JSON.parse(getItem("projectsCollected"));
  }

  useEffect(() => {
    claimPerson({ variables: { id: idToBeFetch } }).then(data => {
      setDidUrl(`${process.env.NEXT_PUBLIC_DID_EXPLORER!}details/${data.data.claimPerson.did.didDocument?.id}`);
    });
  }, []);

  const tabs = [
    {
      id: "week",
      content: t("This week"),
    },
    {
      id: "month",
      content: t("This month"),
    },
    {
      id: "cycle",
      content: t("This cycle"),
    },
  ];

  const tabsContent = [
    <div className="flex" key={"week"}>
      <TokensResume stat={t(Token.Idea)} id={idToBeFetch!} />
      <TokensResume stat={t(Token.Strengths)} id={idToBeFetch!} />
    </div>,
    <div className="flex" key={"month"}>
      <TokensResume stat={t(Token.Idea)} id={idToBeFetch!} />
      <TokensResume stat={t(Token.Strengths)} id={idToBeFetch!} />
    </div>,
    <div className="flex" key="cyclal">
      <TokensResume stat={t(Token.Idea)} id={idToBeFetch!} />
      <TokensResume stat={t(Token.Strengths)} id={idToBeFetch!} />
    </div>,
  ];

  return (
    <>
      {!person && <Spinner />}
      {person && (
        <>
          <div className="grid grid-cols-2 container mx-auto pt-7">
            <Stack vertical>
              <Stack spacing="tight" alignment="leading">
                <Text as="h2" variant="headingXl">
                  {isUser ? <>{t("Hi,") + " "}</> : <> </>}
                  <span className="text-primary">{person?.name}</span>
                </Text>
                <div className="w-10 rounded-full">
                  <Avatar
                    size={"full"}
                    name={person?.name}
                    variant="beam"
                    colors={["#F1BD4D", "#D8A946", "#02604B", "#F3F3F3", "#014837"]}
                  />
                </div>
              </Stack>
              <Stack>
                <Text as="span" variant="bodyLg" color="subdued">
                  {t("Username:")}
                </Text>
                <Text as="span" variant="bodyLg">
                  <span className="text-primary">@{person?.user}</span>
                </Text>
              </Stack>
              {isUser && (
                <Stack>
                  <Text as="span" variant="bodyLg" color="subdued">
                    {t("Email:")}
                  </Text>
                  <Text as="span" variant="bodyLg">
                    <span className="text-primary">{person?.email}</span>
                  </Text>
                </Stack>
              )}
              <Stack alignment="center">
                <Text as="span" variant="bodyLg" color="subdued">
                  {t("DID:")}
                </Text>
                <Text as="span" variant="bodyLg">
                  <Link url={didUrl}>
                    <a>
                      <Button primary>{t("DID Explorer")}</Button>
                    </a>
                  </Link>
                </Text>
              </Stack>
              <Stack>
                <Text as="span" variant="bodyLg" color="subdued">
                  {t("ID:")}
                </Text>
                <Text as="span" variant="bodyLg" color="subdued">
                  {person?.id}
                </Text>
              </Stack>
            </Stack>

            <Stack vertical spacing="extraLoose">
              <PTitleSubtitle
                title={t("Track record")}
                subtitle={t(
                  "We keep track of your recent activity on the platform, such as the number of designs you've contributed, the feedback you've received, and your level of engagement in the community. About the economic model"
                )}
                titleTag="h2"
              ></PTitleSubtitle>
              <Card>
                <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
                  {tabsContent[selected]}
                </Tabs>
              </Card>
            </Stack>

            <div>
              <Tabs
                tabs={[
                  {
                    id: "projects",
                    content: (
                      <span className="flex items-center space-x-4">
                        <CubeIcon className="w-5 h-5 mr-1" />
                        {t("Projects")}
                      </span>
                    ),
                  },

                  {
                    id: "list",
                    content: (
                      <span className="flex items-center space-x-4">
                        <ClipboardListIcon className="w-5 h-5 mr-1" />
                        {t("List")}
                      </span>
                    ),
                  },
                ]}
                selected={projectTabSelected}
                onSelect={handleProjectTabChange}
              >
                {projectTabSelected === 0 && (
                  <>
                    <ProjectsTable filter={proposalFilter} hideHeader={true} hideFilters={true} />
                  </>
                )}
                {projectTabSelected === 1 && (
                  <>
                    <ProjectsTable filter={collectedProjects} hideHeader={true} hideFilters={true} />
                  </>
                )}
              </Tabs>
            </div>
          </div>
        </>
      )}
    </>
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
      ...(await serverSideTranslations(locale, ["signInProps", "lastUpdatedProps", "SideBarProps", "ProfileProps"])),
    },
  };
}

export default Profile;
