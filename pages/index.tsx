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

import { Button, ButtonGroup, Text } from "@bbtgnn/polaris-interfacer";
import { GlobeAltIcon, LightningBoltIcon, ScaleIcon } from "@heroicons/react/outline";
import ProjectsCards from "components/ProjectsCards";
import ProjectMaps from "components/ProjectsMaps";
import Layout from "components/layout/Layout";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { ReactNode } from "react";
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
        <ProjectsCards hideFilters />
      </div>

      {/* MAP */}
      <div className="container mx-auto mb-24 mt-4">
        <ProjectMaps />
      </div>

      <Features />

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
                "Our platform brings together makers, designers, and engineers from all over the world, creating a space for collaboration and innovation. Whether you"
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

/* Partials */

type Feature = { icon: ReactNode; title: string; items: Array<string> };

function Feature(props: { feature: Feature }) {
  const { feature } = props;
  return (
    <div className="p-4 space-y-4 rounded-md border-1 border-border-subdued bg-white">
      <div className="flex flex-row items-center space-x-3">
        <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-lg bg-primary/10 text-text">
          <div className="w-6 h-6">{feature.icon}</div>
        </div>
        <Text as="h3" variant="headingLg">
          {feature.title}
        </Text>
      </div>

      <ul className="list-disc pl-4">
        {feature.items.map((item, i) => (
          <li key={i} className="text-text-subdued">
            <Text as="p" variant="bodyMd">
              {item}
            </Text>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Features() {
  const { t } = useTranslation("homeProps");

  const features: Array<Feature> = [
    {
      icon: <LightningBoltIcon />,
      title: t("Your designs, products, services"),
      items: [
        t("Showcase your digital designs, physical products and services"),
        t("Import from git, thingiverse, losh"),
      ],
    },
    {
      icon: <ScaleIcon />,
      title: t("Collaboration"),
      items: [t("Collaborate on projects"), t("Compose your projects from other users’ projects")],
    },
    {
      icon: <GlobeAltIcon />,
      title: t("Geolocation"),
      items: [t("See who and what is near you"), t("Search projects, collaborators, experts and labs on the map")],
    },
    {
      icon: <LightningBoltIcon />,
      title: t("Digital Product Passport"),
      items: [
        t("Trace and visualize your projects components"),
        t("Prove the green factor and recyclability of your products"),
      ],
    },
    {
      icon: <GlobeAltIcon />,
      title: t("W3C-DID, password-less crypto wallet"),
      items: [
        t("Your user is linked to a W3C-DID based crypto wallet"),
        t("Complete end-to-end encryption with password-less login"),
      ],
    },
    {
      icon: <ScaleIcon />,
      title: t("Economic model"),
      items: [
        t("Reward system for continous activity on the platform"),
        t("Reward points are converted to crypto-tokens"),
      ],
    },
  ];

  return (
    <div className="container mx-auto space-y-4 max-sm:px-4">
      <Text as="h2" variant="heading2xl">
        {t("What’s included")} {"👌"}
      </Text>
      <div className="grid max-sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
        {features.map((f, i) => {
          return <Feature feature={f} key={f.title} />;
        })}
      </div>
    </div>
  );
}
