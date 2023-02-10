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

const RelationshipTree = ({ dpp }: { dpp: JSON }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const { t } = useTranslation("lastUpdatedProps");
  const findProject = (level: any) => {
    if (!!level?.children[0]?.children[0]?.node?.accounting_quantity_has_numerical_value) {
      const _projects = level?.children?.map((child: any) => ({
        name: child?.children[0]?.node.name,
        id: child?.children[0]?.node.id,
        description: child?.children[0]?.node.note,
      }));
      setProjects(projects.concat(_projects));
    } else {
      for (let i = 0; i < level?.children?.length; i++) {
        findProject(level.children[i]);
      }
    }
  };
  useEffect(() => {
    findProject(dpp);
  }, [dpp]);
  return (
    <div className="w-full mt-2" id="relationshipTree">
      <div className="font-bold text-xl mb-2">{t("Included or cited projects")}</div>
      {projects.map(project => (
        <div key={project.id} className="flex flex-column mt-2 border-b-2">
          <Link href={`/project/${project.id}`}>
            <a>
              <ResourceDetailsCard resource={project} />
            </a>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default RelationshipTree;
