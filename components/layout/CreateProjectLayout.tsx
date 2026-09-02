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

import { ArrowLeftMinor } from "@shopify/polaris-icons";
import { useAuth } from "hooks/useAuth";
import { useTranslation } from "next-i18next";
import Link from "next/link";

type LayoutProps = {
  children: React.ReactNode;
};

// The prototype keeps the whole creation flow on one tinted page: the back
// link, the heading and the two columns all share a single 1200px column,
// rather than the link sitting on its own white band above the form.
const CreateProjectLayout: React.FunctionComponent<LayoutProps> = (layoutProps: LayoutProps) => {
  const { t } = useTranslation();
  const { children } = layoutProps;
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-ifr-profile" style={{ fontFamily: "var(--ifr-font-body)" }}>
      <div className="max-w-[1200px] mx-auto w-full px-4 md:px-6 py-6 md:py-[42px]">
        <Link href={user?.ulid ? `/profile/${user.ulid}` : "/"}>
          <a
            className="inline-flex items-center gap-2 mb-4 px-1 py-2 text-ifr-text-primary no-underline hover:bg-ifr-hover transition-colors"
            style={{
              borderRadius: "var(--ifr-radius-sm)",
              fontSize: "var(--ifr-fs-base)",
              fontWeight: "var(--ifr-fw-medium)",
            }}
          >
            <ArrowLeftMinor className="w-4 h-4 fill-current" />
            {t("Back to Profile")}
          </a>
        </Link>
        {children}
      </div>
    </div>
  );
};

export default CreateProjectLayout;
