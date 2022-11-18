import { useTranslation } from "next-i18next";
import { Button } from "@bbtgnn/polaris-interfacer";

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
      <Button size="large" primary fullWidth id="submit" data-test="viaPassphrase" onClick={viaPassphrase}>
        {t("Login via passphrase 🔑")}
      </Button>

      {/* Login via questions */}
      <div className="mt-4">
        <Button size="large" primary fullWidth id="submit" data-test="viaQuestions" onClick={viaQuestions}>
          {t("Login answering the signup questions 💬")}
        </Button>
      </div>
    </div>
  );
}
