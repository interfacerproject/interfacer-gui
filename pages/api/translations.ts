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

import type { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";

type Data = any;

export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  // @ts-ignore
  const _fileNames = await fs.readdir("public/locales/en", (error, files) => {
    files.forEach((file: any) => {
      return file;
    });
  });

  res.status(200).json({ fileNames: _fileNames });
};
