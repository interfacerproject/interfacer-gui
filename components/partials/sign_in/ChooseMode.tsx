import { useTranslation } from "next-i18next";

export interface ChooseModeProps {
  viaPassphrase?: () => void;
  viaQuestions?: () => void;
}

export default function ChooseMode(props: ChooseModeProps) {
  const { viaPassphrase = () => {}, viaQuestions = () => {} } = props;
  const { t } = useTranslation("signInProps", { keyPrefix: "chooseMode" });

  return (
    <div>
      {/* Intro */}
      <h2>{t("title")}</h2>
      <p className="mt-2 mb-6">{t("description")}</p>

      {/* Login via passphrase */}
      <button className="btn btn-block btn-primary" type="button" onClick={viaPassphrase} data-test="viaPassphrase">
        {t("buttons.passphrase")}
      </button>

      {/* Login via questions */}
      <button className="mt-4 btn btn-block btn-primary" type="button" onClick={viaQuestions} data-test="viaQuestions">
        {t("buttons.questions")}
      </button>
    </div>
  );
}
