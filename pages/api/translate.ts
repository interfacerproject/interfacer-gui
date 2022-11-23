import type { NextApiRequest, NextApiResponse } from "next";

type Data = { text: string };

const translate = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const _parsedRequest = JSON.parse(req.body);
  const textTranslated = await fetch("https://api-free.deepl.com/v2/translate", {
    body: `text=${_parsedRequest.text}&target_lang=${_parsedRequest.lang}`,
    headers: {
      Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  }).then(response => response.json());
  res.status(200).json({ text: textTranslated.translations[0].text });
};

export default translate;
