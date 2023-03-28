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

import { Button, Card, Link, Stack, Tabs, Text } from "@bbtgnn/polaris-interfacer";
import { ClipboardListIcon, CubeIcon } from "@heroicons/react/outline";
import Spinner from "components/brickroom/Spinner";
import FullWidthBanner from "components/FullWidthBanner";
import FetchUserLayout, { useUser } from "components/layout/FetchUserLayout";
import Layout from "components/layout/Layout";
import ProfileHeading from "components/partials/profile/[id]/ProfileHeading";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import ProjectsCards from "components/ProjectsCards";
import TokensResume from "components/TokensResume";
import { useAuth } from "hooks/useAuth";
import useStorage from "hooks/useStorage";
import { Token, TrendPeriod } from "hooks/useWallet";
import type { GetStaticPaths } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { useCallback, useState } from "react";
import useFilters from "../../../hooks/useFilters";

//

const Profile: NextPageWithLayout = () => {
  const { getItem } = useStorage();
  const router = useRouter();
  const { tab } = router.query;
  const { t } = useTranslation("common");
  const { proposalFilter } = useFilters();
  const { user } = useAuth();
  const initialTab = tab ? Number(tab) : 0;

  const [selected, setSelected] = useState(0);
  const [projectTabSelected, setProjectTabSelected] = useState(initialTab);
  const handleTabChange = useCallback((selectedTabIndex: number) => setSelected(selectedTabIndex), []);
  const handleProjectTabChange = useCallback((selectedTabIndex: number) => setProjectTabSelected(selectedTabIndex), []);

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
      <TokensResume stat={t(Token.Idea)} id={id} period={TrendPeriod.Week} />
      <TokensResume stat={t(Token.Strengths)} id={id} period={TrendPeriod.Week} />
    </div>,
    <div className="flex" key={"month"}>
      <TokensResume stat={t(Token.Idea)} id={id} period={TrendPeriod.Month} />
      <TokensResume stat={t(Token.Strengths)} id={id} period={TrendPeriod.Month} />
    </div>,
    <div className="flex" key="cyclal">
      <TokensResume stat={t(Token.Idea)} id={id} period={TrendPeriod.Cycle} />
      <TokensResume stat={t(Token.Strengths)} id={id} period={TrendPeriod.Cycle} />
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
                {t("This is your profile page. Edit it to add your bio and other informations.")}
              </Text>
              <Link url={`/profile/${user.ulid}/edit`} monochrome>
                <Button monochrome outline>
                  {t("Edit")}
                </Button>
              </Link>
            </FullWidthBanner>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 container mx-auto pt-7 px-2 lg:px-0 space-x-2">
            <ProfileHeading />

            <Stack vertical spacing="extraLoose">
              <PTitleSubtitle
                title={t("Track record")}
                subtitle={t(
                  "We keep track of your recent activity on the platform, such as the number of designs you have contributed, the feedback you have received, and your level of engagement in the community. About the economic model"
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

          <div className="container mx-auto my-4">
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
                    header={isUser ? t("My projects") : t("Projects")}
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
      ...(await serverSideTranslations(locale, [
        "signInProps",
        "lastUpdatedProps",
        "SideBarProps",
        "ProfileProps, common",
      ])),
    },
  };
}

Profile.getLayout = page => (
  <Layout bottomPadding="none">
    <FetchUserLayout>{page}</FetchUserLayout>
  </Layout>
);

export default Profile;
