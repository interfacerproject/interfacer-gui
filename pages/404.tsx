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

import { Button, Stack } from "@bbtgnn/polaris-interfacer";
import Layout from "components/layout/Layout";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";

const FourOhFour: NextPageWithLayout = () => {
  const router = useRouter();
  const { t } = useTranslation("common");
  return (
    <div className="grid h-full grid-cols-6">
      <div className="col-span-6 p-2 md:col-span-4 md:col-start-2 md:col-end-6">
        <div className="w-full h-full pt-56">
          <Stack vertical spacing="loose">
            <h1 className="text-4xl font-bold">{t("Oops We Couldnt Find What You Were Looking For")}</h1>
            <h3 id="error404" className="text-primary text-3xl">
              {t("Error: 404")}
            </h3>
            <p className="text-l">
              {t(
                "Our open source hardware database is constantly growing but sometimes even we cant keep up If youve arrived on this page it means that the project you were looking for isnt currently available"
              ) + "."}
            </p>
            <Stack spacing="loose">
              <Button primary size="large" onClick={() => router.push("/products")}>
                {t("See all projects")}
              </Button>
              <Button size="large" onClick={() => router.push("/")}>
                {t("Back to Homepage")}
              </Button>
            </Stack>
          </Stack>
        </div>
      </div>
    </div>
  );
};

FourOhFour.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout>
      <div className="container bg-[#F3F3F1] max-w-full">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <img
            id="sideBgImage"
            alt="404"
            src="/404bg.png"
            className={"w-full h-full object-contain bg-[#013026] md:h-screen hidden md:block"}
          />
          <div className="h-full">{page}</div>
        </div>
      </div>
    </Layout>
  );
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["signInProps", "common"])),
    },
  };
}

export const publicPage = true;

export default FourOhFour;
