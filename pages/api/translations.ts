import type { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import path from "path";

type Data = any;

export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  // @ts-ignore
  const _fileNames = await fs.readdir("public/locales/en", (error, files) => {
    files.forEach((file: any) => {
      return file;
    });
  });
  //Find the absolute path of the json directory
  const jsonDirectory = path.join(process.cwd(), "public/locales/en");
  //Read the json data file data.json
  const fileContents = await fs.readFile(jsonDirectory + "/common.json", "utf8");
  res.status(200).json({ fileNames: _fileNames });
};
