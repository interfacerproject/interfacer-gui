import type { NextApiRequest, NextApiResponse } from "next";

type Data = { text: string };

const translate = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const xmlStyleReplacer = (index: number) => `<span translate="no">${index}</span>`;

  const matchI18Next = (input: string) => {
    const matches = input.match(/(\{\{.+?\}\}|\$t\(.+?\)|\$\{.+?\})/g);

    return (matches || []).map((match, index) => ({
      from: match,
      to: xmlStyleReplacer(index),
    }));
  };

  const replaceInterpolations = (input: string) => {
    const replacements = matchI18Next(input);

    const clean = replacements.reduce((acc, cur) => acc.replace(cur.from, cur.to), input);

    return { clean, replacements };
  };

  const reInsertInterpolations = (clean: string, replacements: { from: string; to: string }[]) =>
    replacements.reduce((acc, cur) => acc.replace(cur.to, cur.from), clean);

  const _parsedRequest = JSON.parse(req.body);
  const { clean, replacements } = replaceInterpolations(_parsedRequest.text);

  const textTranslated = await fetch("https://api-free.deepl.com/v2/translate", {
    body: `text=${clean}&target_lang=${_parsedRequest.lang}`,
    headers: {
      Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  }).then(response => response.json());
  res.status(200).json({ text: reInsertInterpolations(textTranslated.translations[0].text, replacements) });
};

export default translate;
