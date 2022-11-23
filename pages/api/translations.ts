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
