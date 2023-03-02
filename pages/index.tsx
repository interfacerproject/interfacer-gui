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

import { Button, ButtonGroup, Card, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { GlobeAltIcon, LightningBoltIcon, ScaleIcon } from "@heroicons/react/outline";
import Layout from "components/layout/Layout";
import ProjectsCards from "components/ProjectsCards";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { NextPageWithLayout } from "./_app";

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, [
        "common",
        "signInProps",
        "homeProps",
        "SideBarProps",
        "lastUpdatedProps",
      ])),
    },
  };
}

const Home: NextPageWithLayout = () => {
  const { t } = useTranslation("homeProps");
  const { authenticated } = useAuth();
  const features = [
    {
      icon: <LightningBoltIcon />,
      title: t("Reinforcing collaboration"),
      description: (
        <ul className="list-disc pl-5 space-y-1">
          <li>{t("Discover the work of your peers")}</li>
          <li>
            {t(
              "Upload your existing projects and get support for making your work more visible and readable, both by people and by machines"
            )}
          </li>
          <li>{t("Propose improvements, feedback and remixingDiscover the work of your peers")}</li>
        </ul>
      ),
    },
    {
      icon: <ScaleIcon />,
      title: t("‘Passwordless’ Log in"),

      description: (
        <ul className="list-disc pl-5 space-y-1">
          <li>{t("Based on 5 security questions, a set of keys are generated for you")}</li>
          <li>
            {t(
              "We create a seed as mnemonic passphrase (you will have to safely safeguard) that we use to recreate the private keys and enable you to sign in from different devices"
            )}
          </li>
          <li>{t("In case you lose the seed, it can be recreated by answering the security questions again")}</li>
        </ul>
      ),
    },
    {
      icon: <GlobeAltIcon />,
      title: t("End-to-end crypto wallet"),
      description: (
        <ul className="list-disc pl-5 space-y-1">
          <li>{t("Your sovereign identity")}</li>
          <li>{t("W3C compliant")}</li>
          <li>{t("Served by a Distributed identity controller")}</li>
        </ul>
      ),
    },
    {
      icon: <LightningBoltIcon />,
      title: t("Your first Digital Product Passport"),
      description: (
        <ul className="list-disc pl-5 space-y-1">
          <li>{t("Track resources, locations and contributions trough the whole supply-chain")}</li>
          <li>{t("Value and incentivate the production of products that recyclable and repairable")}</li>
        </ul>
      ),
    },
    {
      icon: <GlobeAltIcon />,
      title: t("Built-in Economic Model"),
      description: (
        <ul className="pl-5">
          <li>
            {t(
              "We introduce a transparent way to track the activity of your collaborators. The platform automatically assign points based on people’s contributions to a project. This makes an easy way to know which projects gather more participation"
            )}
          </li>
        </ul>
      ),
    },
  ];

  return (
    <>
      <div className="flex items-center justify-center bg-[#e9e9e8] w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center container mx-auto">
          <div className="space-y-6 px-8 py-12">
            <div className="mb-6 logo" />

            <Text variant="heading4xl" as="h1">
              {t("Empowering the Open Source Hardware Community")}
            </Text>

            <Text variant="bodyMd" as="p">
              {t(
                "Innovative federated open source platform for sharing and collaborating on Open Source Hardware projects. Find and share open source hardware projects, collaborate with others and discover new products and services. Import your projects to allow access to the community and grow your reputation."
              )}
            </Text>

            <div className="flex space-x-2">
              {!authenticated && (
                <ButtonGroup>
                  <Link href="/sign_in">
                    <Button size="large" primary>
                      {t("Log In")}
                    </Button>
                  </Link>
                  <Link href="/sign_up">
                    <Button size="large">{t("Register")}</Button>
                  </Link>
                </ButtonGroup>
              )}
              {authenticated && (
                <ButtonGroup>
                  <Link href="/create/project">
                    <Button size="large" primary>
                      {t("Create a new project")}
                    </Button>
                  </Link>
                  <Link href="/projects">
                    <Button size="large">{t("Explore")}</Button>
                  </Link>
                </ButtonGroup>
              )}
            </div>
          </div>
          <div className="order-first lg:order-last">
            <img src="/hero.png" alt="" className="contain w-full rounded-md" />
          </div>
        </div>
      </div>

      {/* PROJECT CARDS */}
      <div className="container mx-auto mb-24 mt-4">
        <ProjectsCards />
      </div>

      <div className="container mx-auto grid gap-8 md:grid-cols-2 mt-20 justify-between">
        <div className="col-span-2">
          <Text as="h2" variant="heading2xl">
            {t("What’s included 👌")}
          </Text>
        </div>
        {features.map((f, i) => {
          return (
            <div key={i} className="flex md:flex-col">
              <Card sectioned>
                <Stack vertical spacing="loose">
                  <Stack alignment="center">
                    <div className="w-12 h-12 p-3 mr-2 rounded-lg bg-[#E1EFEC] text-[#0B1324]">{f.icon}</div>
                    <h3 className="mt-5 mb-2">{f.title}</h3>
                  </Stack>
                  <Text as="p" variant="bodyMd" color="subdued">
                    {f.description}
                  </Text>
                </Stack>
              </Card>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center bg-[#335259] w-full text-white mt-20 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 items-center container mx-auto">
          <div className="col-span-2">
            <img src="/hero_1.png" alt="" className="contain w-full" />
          </div>
          <div className="space-y-6 p-8 order-first lg:order-last col-span-3">
            <Text variant="heading4xl" as="h1">
              {t("Sign-in and connect your designs")}
            </Text>

            <Text variant="bodyMd" as="p">
              {t(
                "Our platform brings together makers, designers, and engineers from all over the world, creating a space for collaboration and innovation. Whether you're looking for inspiration, need help with a project, or want to showcase your latest creation, together, we can push the boundaries of what's possible and create a more open and sustainable future for all."
              )}
            </Text>

            <div className="flex space-x-2">
              {!authenticated && (
                <ButtonGroup>
                  <Link href="/sign_in">
                    <Button size="large" primary>
                      {t("Log In")}
                    </Button>
                  </Link>
                  <Link href="/projects">
                    <Button size="large">{t("Explore")}</Button>
                  </Link>
                </ButtonGroup>
              )}
              {authenticated && (
                <ButtonGroup>
                  <Link href="/create/project">
                    <Button size="large" primary>
                      {t("Create a new project")}
                    </Button>
                  </Link>
                  <Link href="/projects">
                    <Button size="large">{t("Explore")}</Button>
                  </Link>
                </ButtonGroup>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

Home.publicPage = true;
Home.getLayout = page => <Layout>{page}</Layout>;

export default Home;
