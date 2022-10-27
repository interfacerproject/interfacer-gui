import { ChildrenComponent as CC } from "components/brickroom/utils";
import useStorage from "hooks/useStorage";
import { useTranslation } from "next-i18next";
import SeedBox from "./SeedBox";

export interface PassphraseProps {}

export default function Passphrase(props: CC<PassphraseProps>) {
  const { getItem } = useStorage();
  const { t } = useTranslation("authProps", { keyPrefix: "Passphrase" });

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div>
        <h2>{t("title")}</h2>
        <p>{t("description")}</p>
      </div>

      {/* Seed box */}
      <SeedBox>{getItem("seed")}</SeedBox>

      {/* Space for buttons */}
      {props.children}
    </div>
  );
}
