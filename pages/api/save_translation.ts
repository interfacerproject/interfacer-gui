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
import * as fs from "fs";
import path from "path";

type Data = { text: string };

const saveTranslation = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const _parsedRequest = JSON.parse(req.body);
  const _file = _parsedRequest.file;
  const _lang = _parsedRequest.lang;
  const _translations = JSON.stringify(_parsedRequest.translations);
  const jsonDirectory = path.join(process.cwd(), "public/locales/");

  fs.writeFile(`${jsonDirectory}${_lang}/${_file}`, _translations, error => {
    if (error) {
      console.log(error);
      res.status(500).json({ text: "Error saving translation" });
    } else {
      res.status(200).json({ text: "success" });
    }
  });
};

export default saveTranslation;
