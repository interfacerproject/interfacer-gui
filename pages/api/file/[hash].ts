import type { NextApiRequest, NextApiResponse } from "next";

const ZENFLOWS_FILE_URL = process.env.NEXT_PUBLIC_ZENFLOWS_FILE_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { hash } = req.query;
  if (!hash || typeof hash !== "string") {
    res.status(400).end("Missing hash");
    return;
  }

  try {
    const response = await fetch(`${ZENFLOWS_FILE_URL}/${hash}`);
    if (!response.ok) {
      res.status(response.status).end();
      return;
    }

    const base64 = await response.text();
    const buffer = Buffer.from(base64, "base64");

    const mimeType = (req.query.type as string) || "application/octet-stream";
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.send(buffer);
  } catch {
    res.status(502).end("Failed to fetch file");
  }
}
