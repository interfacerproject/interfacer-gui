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

import FetchUserLayout from "components/layout/FetchUserLayout";
import Layout from "components/layout/Layout";
import EditProfileBanner from "components/partials/profile/[id]/EditProfileBanner";
import ProfileHeading from "components/partials/profile/[id]/ProfileHeading";
import ProfileTabs from "components/partials/profile/[id]/ProfileTabs";
import type { GetStaticPaths } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "pages/_app";

//

const Profile: NextPageWithLayout = () => {
  return (
    <>
      <EditProfileBanner />
      <div className="p-4 container mx-auto space-y-8 pb-12">
        <ProfileHeading />
        <ProfileTabs />
      </div>
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
