import { useTranslation } from "next-i18next";

export interface ChooseModeProps {
  viaPassphrase?: () => void;
  viaQuestions?: () => void;
}

export default function ChooseMode(props: ChooseModeProps) {
  const { viaPassphrase = () => {}, viaQuestions = () => {} } = props;
  const { t } = useTranslation("signInProps");

  return (
    <div>
      {/* Intro */}
      <h2>{t("Login")}</h2>
      <p className="mt-2 mb-6">
        {t("Login by providing your generated passphrase or by answering the questions during your Signup proccess")}
      </p>

      {/* Login via passphrase */}
      <button className="btn btn-block btn-primary" type="button" onClick={viaPassphrase} data-test="viaPassphrase">
        {t("Login via passphrase 🔑")}
      </button>

      {/* Login via questions */}
      <button className="mt-4 btn btn-block btn-primary" type="button" onClick={viaQuestions} data-test="viaQuestions">
        {t("Login answering the signup questions 💬")}
      </button>
    </div>
  );
}
