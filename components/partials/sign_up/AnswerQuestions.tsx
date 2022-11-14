import { useTranslation } from "next-i18next";
import { ReactNode } from "react";

//

export default function AnswerQuestions(props: { children?: ReactNode }) {
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
