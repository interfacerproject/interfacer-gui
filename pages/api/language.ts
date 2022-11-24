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
