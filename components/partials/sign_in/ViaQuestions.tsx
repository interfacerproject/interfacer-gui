import { ChildrenComponent as CC } from "components/brickroom/types";
import { useTranslation } from "next-i18next";

//

export namespace ViaQuestionsNS {
  export interface Props {}
}

//

export default function ViaQuestions(props: CC<ViaQuestionsNS.Props>) {
  const { t } = useTranslation("signInProps");

  return (
    <div>
      {/* Intro */}
      <h2>{t("Login")}</h2>
      <p className="mt-2 mb-6">{t("Answer the questions that you answered during the signup process")}</p>

      {/* Here goes the `Questions` component */}
      {props.children}
    </div>
  );
}
