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

import { useMutation } from "@apollo/client";
import { Button, Card, Link, Stack, Tabs, Text } from "@bbtgnn/polaris-interfacer";
import { ClipboardListIcon, CubeIcon } from "@heroicons/react/outline";
import Avatar from "boring-avatars";
import Spinner from "components/brickroom/Spinner";
import FullWidthBanner from "components/FullWidthBanner";
import FetchUserLayout, { useUser } from "components/layout/FetchUserLayout";
import Layout from "components/layout/Layout";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import ProjectsCards from "components/ProjectsCards";
import TokensResume from "components/TokensResume";
import { useAuth } from "hooks/useAuth";
import useStorage from "hooks/useStorage";
import { Token } from "hooks/useWallet";
import { CLAIM_DID } from "lib/QueryAndMutation";
import type { GetStaticPaths } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { useCallback, useEffect, useState } from "react";
import useFilters from "../../../hooks/useFilters";

//

const Profile: NextPageWithLayout = () => {
  const { getItem } = useStorage();
  const [didUrl, setDidUrl] = useState<string>(process.env.NEXT_PUBLIC_DID_EXPLORER!);
  const router = useRouter();
  const { tab } = router.query;
  const { t } = useTranslation("ProfileProps");
  const { proposalFilter } = useFilters();
  const { user } = useAuth();

  const [selected, setSelected] = useState(0);
  const [projectTabSelected, setProjectTabSelected] = useState(0);
  const handleTabChange = useCallback((selectedTabIndex: number) => setSelected(selectedTabIndex), []);
  const handleProjectTabChange = useCallback((selectedTabIndex: number) => setProjectTabSelected(selectedTabIndex), []);

  const [claimPerson] = useMutation(CLAIM_DID);

  const { person, id } = useUser();
  const isUser = user?.ulid === id;
  proposalFilter.primaryAccountable = [id];

  const hasCollectedProjects = isUser && !!getItem("projectsCollected");
  let collectedProjects: { id: string[] } = {
    id: [],
  };
  if (hasCollectedProjects) {
    collectedProjects["id"] = JSON.parse(getItem("projectsCollected"));
  }

  useEffect(() => {
    claimPerson({ variables: { id: id } }).then(data => {
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
      <TokensResume stat={t(Token.Idea)} id={id! as string} />
      <TokensResume stat={t(Token.Strengths)} id={id!} />
    </div>,
    <div className="flex" key={"month"}>
      <TokensResume stat={t(Token.Idea)} id={id!} />
      <TokensResume stat={t(Token.Strengths)} id={id!} />
    </div>,
    <div className="flex" key="cyclal">
      <TokensResume stat={t(Token.Idea)} id={id!} />
      <TokensResume stat={t(Token.Strengths)} id={id!} />
    </div>,
  ];

  return (
    <>
      {!person && <Spinner />}
      {person && (
        <>
          {isUser && (
            <FullWidthBanner open status="basic">
              <Text as="p" variant="bodySm">
                {t("This is your profilepage. Edit it to add your bio and other information.")}
              </Text>
              <Link url={`/profile/${user.ulid}/edit`} monochrome>
                <Button monochrome outline>
                  {t("Edit")}
                </Button>
              </Link>
            </FullWidthBanner>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 container mx-auto pt-7 px-2 lg:px-0 space-y-2 mb-2">
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
              <Stack>
                <Text as="span" variant="bodyLg" color="subdued">
                  {t("About:")}
                </Text>
                <div className="py-1 px-4 overflow-scroll w-64 max-h-36 bg-white border-2 rounded-md">
                  <Text as="span" variant="bodyMd">
                    {person?.note}
                  </Text>
                </div>
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
          </div>

          <div className="container mx-auto mb-4">
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
                <div className="w-full">
                  <ProjectsCards
                    filter={proposalFilter}
                    hideHeader={false}
                    hideFilters={false}
                    header={isUser ? t("My projects") : t("Her projects")}
                  />
                </div>
              )}
              {projectTabSelected === 1 && (
                <>
                  <ProjectsCards header={t("My list")} filter={collectedProjects} hideHeader={false} />
                </>
              )}
            </Tabs>
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

Profile.getLayout = page => (
  <Layout bottomPadding="none">
    <FetchUserLayout>{page}</FetchUserLayout>
  </Layout>
);

export default Profile;
