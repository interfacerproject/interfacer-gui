import type { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import path from "path";

type Data = any;

export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const _file = JSON.parse(req.body).file;
  const _lang = JSON.parse(req.body).lang;
  const _keys = JSON.parse(req.body).keys;
  console.log(_file, _lang, _keys);
  //Find the absolute path of the json directory
  const jsonDirectory = path.join(process.cwd(), "public/locales/");
  //Read the json data file data.json
  const fileContents = await fs.readFile(` ${jsonDirectory}${_lang}/${_file}`, "utf8");
  res.status(200).json({ content: fileContents });
};
