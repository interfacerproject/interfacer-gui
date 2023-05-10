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

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import ResourceDetailsCard from "../components/ResourceDetailsCard";

const Relations = ({ dpp }: { dpp: JSON }) => {
  const [relations, setRelations] = useState<any[]>([]);
  const { t } = useTranslation("lastUpdatedProps");

  const Line = ({ id, children, type }: { id: string; children: React.ReactNode; type: string }) => (
    <div key={id} className="flex flex-column mt-2 border-b-2">
      <Link href={`/${type}/${id}`}>
        <a>{children}</a>
      </Link>
    </div>
  );

  useEffect(() => {
    const findProject = (level: any) => {
      if (level?.type === "Process") {
        const _projects = level?.children?.map((child: any) =>
          child.children.length === 0 ? (
            <Line id={child.node.provider_id} key={child.node.provider_id} type="profile">
              <p>
                {"this user: "}
                {child.node.provider_id}
                {" contributes"}
              </p>
            </Line>
          ) : (
            <Line id={child?.children[0]?.node.id} key={child?.children[0]?.node.id} type="project">
              <ResourceDetailsCard resource={child?.children[0]?.node} />
            </Line>
          )
        );
        setRelations(r => r.concat(_projects));
      } else {
        for (let i = 0; i < level?.children?.length; i++) {
          findProject(level.children[i]);
        }
      }
    };
    findProject(dpp);
  }, [dpp]);

  return (
    <div className="w-full mt-2">
      <div className="font-bold text-xl mb-2">{t("Included or cited projects")}</div>
      {relations.map(project => project)}
    </div>
  );
};

export default Relations;
