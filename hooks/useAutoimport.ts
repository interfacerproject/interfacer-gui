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

import { useAuth } from "./useAuth";
import { AutoimportInput } from "./useAutoimportDefs";
import { CreateProjectValues } from "components/partials/create/project/CreateProjectForm";

type AutoImportReturnValue = {
  importRepository: (input: AutoimportInput) => Promise<Partial<CreateProjectValues> | undefined>;
  analyzeRepository: (repo: string) => Promise<any>;
};

const useAutoImport = (): AutoImportReturnValue => {
  const { client } = useAuth();

  const importRepository = async (data: AutoimportInput) => {
    if (!client) return undefined;
    try {
      if (data.source === "github" && data.github?.url) {
        const result = await client.import.importFromGithub(data.github.url);
        return {
          main: {
            title: result.main?.title || "",
            link: result.main?.link || "",
            description: result.main?.description || "",
            tags: result.main?.tags || [],
          },
          licenses: result.licenses || [],
        } as Partial<CreateProjectValues>;
      }
      return undefined;
    } catch {
      return undefined;
    }
  };

  return {
    importRepository,
    analyzeRepository: async () => false,
  };
};

export default useAutoImport;
