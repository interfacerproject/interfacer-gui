import { Text } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";

const Footer = () => {
  const { t } = useTranslation("common");

  return (
    <div className="border-t-1 border-t-border-subdued">
      <div className="container mx-auto p-6">
        <div
          className="
        flex flex-col items-start space-y-6
        md:flex-row md:items-center md:justify-center md:space-x-6 md:space-y-0
      "
        >
          <div className="flex items-center space-x-2">
            <Text as="p" variant="bodySm">
              {t("Software by")}
            </Text>
            <img className="h-10" src="/logo-dyne.svg" alt="Dyne.org Logo" />
          </div>

          <div className="max-w-[250px] md:pl-4">
            <Text as="p" variant="bodySm">
              {t("Project funded")}{" "}
              <a
                className="font-bold underline hover:no-underline"
                href="https://interfacerproject.eu"
                target="_blank"
                rel="noreferrer"
              >
                {t("INTERFACER Project")}
              </a>
            </Text>
          </div>

          <img className="h-10" src="/logo-eu.svg" alt="European Union Logo" />

          <img className="h-10" src="/logo-bwi.svg" alt="Hamburg City Logo" />
        </div>
      </div>
    </div>
  );
};

export default Footer;
