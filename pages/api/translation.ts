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
import path from "path";

type Data = any;

export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  // @ts-ignore
  const _file = req.body;
  //Find the absolute path of the json directory
  const jsonDirectory = path.join(process.cwd(), "public/locales/en/");
  //Read the json data file data.json
  const fileContents = await fs.readFile(jsonDirectory + _file, "utf8");
  res.status(200).json({ content: fileContents });
};
