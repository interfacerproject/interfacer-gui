import { Frame, Navigation, TextField, ButtonGroup, Button } from "@bbtgnn/polaris-interfacer";
import { useCallback, useEffect, useState } from "react";
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

  const LangMenu = () => (
    <ButtonGroup>
      {["en", "de", "fr", "it"].map(lan => (
        <Button
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
        <div className={"flex gap-2"} key={key}>
          <div className={"flex-col pt-6"}>
            <Button primary onClick={() => autoTranslate(key)}>
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
                  },
                  label: item.split(".json")[0],
                }))}
              />
            </Navigation>
          </div>
          <div className="flex flex-col">
            {enTranslations && (
              <div className="flex flex-col gap-2 pt-4 pl-2">
                <LangMenu />
                <Editor />
              </div>
            )}
          </div>
        </div>
      </Frame>
    </div>
  );
};

export default Babel;
