import { useTranslation } from "next-i18next";
import DyneLogo from "./DyneLogo";

const Footer = () => {
  const { t } = useTranslation("common");
  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex lg:items-center lg:justify-between flex-col lg:flex-row space-x-6 space-y-6">
          <p>{t("Software by")}</p>
          <DyneLogo />
          <p className="max-w-xs">
            {t("Project funded")}{" "}
            <a className="text-bold font-semibold" href="https://interfacerproject.eu" target="_blank" rel="noreferrer">
              {t("INTERFACER Project")}
            </a>
          </p>
          <img src="/logo-eu-white.png" className="h-full max-w-fit" />
          <img src="/logo-bwi-white.png" className="h-full max-w-fit" />
        </div>
      </div>
    </>
  );
};

export default Footer;
