import { useTranslation } from "next-i18next";
import { ControlledTextField } from "../components/ControlledTextField";

export const CertificatesSection = () => {
  const { t } = useTranslation("createProjectProps");

  return <ControlledTextField name="dpp.certificates.nameOfCertificate.value" label={t("Name of Certificate")} />;
};
