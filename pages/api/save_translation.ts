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
  console.log(_file);

  fs.writeFile(`${jsonDirectory}${_lang}/${_file}`, _translations, error => {
    if (error) {
      console.log(error);
    } else {
      res.status(200).json({ text: "success" });
    }
  });
};

export default saveTranslation;
