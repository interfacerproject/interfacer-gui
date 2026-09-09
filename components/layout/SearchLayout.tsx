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

import Topbar from "components/partials/topbar/Topbar";
import React, { ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import Footer from "../Footer";

type layoutProps = {
  children: ReactNode;
};

const Layout: React.FunctionComponent<layoutProps> = (layoutProps: layoutProps) => {
  const { authenticated, loading } = useAuth();

  // Public search pages should keep the same shell for signed-out visitors.
  // Only defer rendering when an authenticated session is still being restored.
  if (authenticated && loading) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar search={false} />
      <main className="bg-[var(--ifr-bg-surface)] max-w-full flex-grow">{layoutProps?.children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
