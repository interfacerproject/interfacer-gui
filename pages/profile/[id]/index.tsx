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

import FetchUserLayout, { useUser } from "components/layout/FetchUserLayout";
import Layout from "components/layout/Layout";
import EditProfileBanner from "components/partials/profile/[id]/EditProfileBanner";
import ProfileHeading from "components/partials/profile/[id]/ProfileHeading";
import ProfileTabs from "components/partials/profile/[id]/ProfileTabs";
import TrackRecord from "components/partials/profile/[id]/TrackRecord";
import type { GetStaticPaths } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "pages/_app";

//

const Profile: NextPageWithLayout = () => {
  const { id } = useUser();
  if (!id) {
    return null;
  }
  return (
    <>
      <EditProfileBanner />
      <div className="container mx-auto space-y-8">
        <div className="flex flex-col md:flex-row pt-7 lg:space-x-8 space-y-2">
          <div className="flex grow">
            <ProfileHeading />
          </div>
          <div className="max-w-2xl ">
            <TrackRecord />
          </div>
        </div>
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
