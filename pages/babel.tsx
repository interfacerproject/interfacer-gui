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

import { Frame, Navigation, TextField, ButtonGroup, Button } from "@bbtgnn/polaris-interfacer";
import { useEffect, useState } from "react";
import devLog from "../lib/devLog";

const Babel = () => {
  const [nameSpaces, setNameSpaces] = useState<any>({});
  const [file, setFile] = useState<string>("");
  const [enTranslations, setEnTranslations] = useState<any>(undefined);
  const [keys, setKeys] = useState<string[]>();
  const [focus, setFocus] = useState<string | undefined>("");
  const [lang, setLang] = useState<string>("en");
  const [translations, setTranslations] = useState<any>({});

  const fetchNameSpaces = async () => {
    await fetch("/api/translations", { method: "get" }).then(async r => setNameSpaces(JSON.parse(await r.text())));
  };
  const fetchContent = async (file: string) => {
    await fetch("/api/translation", { method: "post", body: file }).then(async r => {
      const tr = JSON.parse(JSON.parse(await r.text()).content);
      setEnTranslations(tr);
      setKeys(Object.keys(tr));
      devLog(keys);
    });
  };
  const fetchLanguage = async (lang: string) => {
    await fetch("/api/language", {
      method: "post",
      body: JSON.stringify({ keys: keys, lang: lang, file: file }),
    }).then(async r => setTranslations(JSON.parse(JSON.parse(await r.text()).content)));
  };
  useEffect(() => {
    fetchNameSpaces();
  }, []);

  const items = nameSpaces?.fileNames || [];

  const autoTranslate = async (text: string) => {
    await fetch("/api/translate", {
      method: "post",
      body: JSON.stringify({ text: text, lang: lang }),
    }).then(async r => setTranslations({ ...translations, [text]: JSON.parse(await r.text()).text }));
  };

  const saveTranslation = async () => {
    await fetch("/api/save_translation", {
      method: "post",
      body: JSON.stringify({ file: file, translations: translations, lang: lang }),
    }).then(async r => devLog(await r.text()));
  };

  const LangMenu = () => (
    <ButtonGroup>
      {["en", "de", "fr", "it"].map(lan => (
        <Button
          pressed={lan === lang}
          key={lan}
          onClick={() => {
            setLang(lan);
            fetchLanguage(lan);
          }}
        >
          {lan}
        </Button>
      ))}
    </ButtonGroup>
  );

  const Editor = () => (
    <div className="full">
      {keys?.map(key => (
        <div className={`flex gap-2 full px-2 pb-6 ${translations[key]?.length == 0 ? "bg-slate-300" : ""}`} key={key}>
          <div className={"flex-col pt-6"}>
            <Button primary disabled={lang === "en"} onClick={() => autoTranslate(key)}>
              {"translate"}
            </Button>
          </div>
          <div className={"flex-col"}>
            <TextField
              type="text"
              id={key}
              name={key}
              label={key}
              placeholder={enTranslations[key]}
              onFocus={() => setFocus(key)}
              onChange={value => setTranslations({ ...translations, [key]: value })}
              value={translations[key]}
              autoComplete="off"
              focused={focus === key}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4">
      <h1 className="ml-8">{"Babel"}</h1>
      <Frame>
        <div className={"flex"}>
          <div className={"flex flex-col"}>
            <Navigation location="/">
              <Navigation.Section
                fill
                items={items?.map((item: any) => ({
                  onClick() {
                    setFile(item);
                    fetchContent(item);
                    setLang("en");
                  },
                  label: item.split(".json")[0],
                }))}
              />
            </Navigation>
          </div>
          <div className="flex flex-col">
            {enTranslations && (
              <div className="flex flex-col gap-2 pt-4 pl-2">
                <h2>{file}</h2>
                <LangMenu />
                <Editor />
                <ButtonGroup>
                  <Button onClick={() => fetchLanguage(lang)}>{"reset"}</Button>
                  <Button primary onClick={saveTranslation}>
                    {"save"}
                  </Button>
                </ButtonGroup>
              </div>
            )}
          </div>
        </div>
      </Frame>
    </div>
  );
};

export default Babel;
