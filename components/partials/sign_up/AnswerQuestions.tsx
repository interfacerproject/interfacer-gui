import { useTranslation } from "next-i18next";
import { ReactNode } from "react";

//

export default function AnswerQuestions(props: { children?: ReactNode }) {
  const { t } = useTranslation("signUpProps");

  return (
    <div>
      <h2>{t("Sign up")}</h2>
      <p>{t("Answer to these questions to complete your signup 🧩")}</p>
      <p className="mt-4 font-semibold text-primary">
        {t("You will have to remember the answers and keep them for later as they are necessary for the log in&#46;")}
      </p>
      {props.children}
    </div>
  );
}
