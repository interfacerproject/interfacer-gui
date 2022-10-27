import { ChildrenComponent as CC } from "components/brickroom/utils";
import { useTranslation } from "next-i18next";

//

export interface AnswerQuestionsProps {}

//

export default function AnswerQuestions(props: CC<AnswerQuestionsProps>) {
  const { t } = useTranslation("signUpProps", { keyPrefix: "AnswerQuestions" });

  return (
    <div>
      <h2>{t("title")}</h2>
      <p>{t("description")}</p>
      <p className="mt-4 font-semibold text-primary">{t("hint")}</p>
      {props.children}
    </div>
  );
}
