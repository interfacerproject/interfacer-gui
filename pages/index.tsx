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

import { Button } from "@bbtgnn/polaris-interfacer";
import { CheckCircleIcon, GlobeAltIcon, LightningBoltIcon, ScaleIcon } from "@heroicons/react/outline";
import Layout from "components/layout/Layout";
import ProjectsTable from "components/ProjectsTable";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { NextPageWithLayout } from "./_app";

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["signInProps", "homeProps", "SideBarProps", "lastUpdatedProps"])),
    },
  };
}

const Home: NextPageWithLayout = () => {
  const { t } = useTranslation("homeProps");
  const { authenticated } = useAuth();
  const features = [
    {
      icon: <LightningBoltIcon />,
      title: t("Share"),
      description: t("Share your projects and services with makers and users"),
    },
    { icon: <ScaleIcon />, title: t("Collaborate"), description: t("Collaborate with the community") },
    {
      icon: <GlobeAltIcon />,
      title: t("DPP"),
      description: t("Validate your projects with a digital product passport"),
    },
    {
      icon: <LightningBoltIcon />,
      title: t("Combine"),
      description: t("Create projects by including other maker's work"),
    },
    { icon: <ScaleIcon />, title: t("Explore"), description: t("Explore projects to find components and services") },
    { icon: <GlobeAltIcon />, title: t("Import"), description: t("Import your work from existing repositories") },
  ];

  const subtitles = [
    t("Welcome to Interfacer's Fabcity OS alpha staging 😎"),
    t(
      "Create or import projects and collaborate with others in digital designs or in manufacturing physical products"
    ) + ".",
  ];

  return (
    <>
      <div className="p-8 min-h-[60vh] max-h-[800px] flex items-center justify-center bg-[#f8f7f4] w-full bg-right bg-no-repeat bg-cover bg-[url('/bg_nru_md.svg')]">
        <div className="space-y-6">
          <div className="mb-6 logo" />

          <h2 className="text-3xl" id="homeTitle">
            {t("Building the digital infrastructure for Fab Cities")}
          </h2>

          <div className="space-y-1">
            {subtitles.map(s => (
              <div className="flex items-center" key={s}>
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                <p>{s}</p>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            {!authenticated && (
              <>
                <Link href="/sign_in">
                  <Button size="large" primary>
                    {t("Log In")}
                  </Button>
                </Link>
                <Link href="/sign_up">
                  <Button size="large">{t("Register")}</Button>
                </Link>
              </>
            )}
            {authenticated && (
              <>
                <Link href="/create/project">
                  <Button size="large" primary>
                    {t("Create a new project")}
                  </Button>
                </Link>
                <Link href="/resources">
                  <Button size="large">{t("Import from LOSH")}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 container mx-auto overflow-x-scroll">
        {<ProjectsTable hideHeader={true} hidePagination={true} hideFilters />}
      </div>

      <div className="grid gap-16 md:pl-32 md:grid-cols-3 mt-44">
        {features.map((f, i) => {
          return (
            <div key={i} className="flex md:flex-col mb-10">
              <div className="w-12 h-12 p-3 mr-2 text-white rounded-lg bg-[#5DA091]">{f.icon}</div>
              <h3 className="mt-5 mb-2">{f.title}</h3>
              <p className="text-[#8a8e96]">{f.description}</p>
            </div>
          );
        })}
      </div>
    </>
  );
};

Home.publicPage = true;
Home.getLayout = page => <Layout>{page}</Layout>;

export default Home;
