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

type Data = { content: string };

export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const _file = JSON.parse(req.body).file;
  const _lang = JSON.parse(req.body).lang;
  const _keys = JSON.parse(req.body).keys;

  const jsonDirectory = path.join(process.cwd(), "public/locales/");
  const _fileContents = await fs.readFile(`${jsonDirectory}${_lang}/${_file}`, "utf8");
  const _fileContentsParsed = JSON.parse(_fileContents);
  _keys.forEach((key: string) => {
    key in _fileContentsParsed || (_fileContentsParsed[key] = "");
  });

  res.status(200).json({ content: JSON.stringify(_fileContentsParsed) });
};
