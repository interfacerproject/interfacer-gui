import type { NextApiRequest, NextApiResponse } from "next";

const DPP_BASE_URL = process.env.NEXT_PUBLIC_DPP_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, type } = req.query;

  if (!id || typeof id !== "string") {
    res.status(400).end("Missing file id");
    return;
  }

  if (!DPP_BASE_URL) {
    res.status(500).end("Missing DPP base URL");
    return;
  }

  try {
    const response = await fetch(`${DPP_BASE_URL}/file/${encodeURIComponent(id)}`);
    if (!response.ok) {
      res.status(response.status).end();
      return;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const mimeType =
      typeof type === "string" ? type : response.headers.get("content-type") || "application/octet-stream";

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.send(buffer);
  } catch {
    res.status(502).end("Failed to fetch DPP file");
  }
}
