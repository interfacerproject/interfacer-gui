import { ChildrenComponent as CC } from "components/brickroom/types";
import { useTranslation } from "next-i18next";

//

export namespace ViaQuestionsNS {
  export interface Props {}
}

//

export default function ViaQuestions(props: CC<ViaQuestionsNS.Props>) {
  const { t } = useTranslation("signInProps", { keyPrefix: "viaQuestions" });

  return (
    <div>
      {/* Intro */}
      <h2>{t("title")}</h2>
      <p className="mt-2 mb-6">{t("description")}</p>

      {/* Here goes the `Questions` component */}
      {props.children}
    </div>
  );
}