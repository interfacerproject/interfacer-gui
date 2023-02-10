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

import { useAuth } from "hooks/useAuth";
import { NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const Logged_in: NextPage = () => {
  const { user } = useAuth();

  return (
    <div className="p-8">
      {/*<h1>Hello {user?.username}</h1>*/}
      {/*<h2>How did you arrived here? This app is still under construction!</h2>*/}
    </div>
  );
};
export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["signInProps", "SideBarProps"])),
    },
  };
}
export default Logged_in;
