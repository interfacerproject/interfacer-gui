import { Link, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import NextLink from "next/link";

const Footer = () => {
  const { t } = useTranslation("common");

  return (
    <div className="border-t-1 border-t-border-subdued bg-white">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-9 py-8 lg:py-12 bg-white">
          <div className="col-span-4 max-w-sm text-primary lg:place-self-end pr-12">
            <Stack vertical>
              <div className="logo h-16 w-20"></div>
              <Text as={"h1"} variant={"headingLg"}>
                {t("Building the digital infrastructure for Fab Cities")}
              </Text>
            </Stack>
          </div>

          <div className="flex font-bold col-span-5 justify-between lg:justify-evenly">
            <Stack vertical spacing="loose">
              <Text as="h3" variant="headingLg">
                {t("Projects")}
              </Text>
              <NextLink href="/projects">
                <a>
                  <Text as="p" color="subdued" variant="headingMd">
                    {t("All projects")}
                  </Text>
                </a>
              </NextLink>
              <NextLink href="/create/project">
                <a>
                  <Text as="p" color="subdued" variant="headingMd">
                    {t("Add project")}
                  </Text>
                </a>
              </NextLink>
              <NextLink href="/resources">
                <a>
                  <Text as="p" color="subdued" variant="headingMd">
                    {t("Import from LOSH")}
                  </Text>
                </a>
              </NextLink>
            </Stack>
            <Stack vertical spacing="loose">
              <Text as="h3" variant="headingLg">
                {t("About")}
              </Text>
              <NextLink href="https://interfacerproject.dyne.org/">
                <a target="_blank" rel="noreferrer">
                  <Text as="p" color="subdued" variant="headingMd">
                    {t("This platform")}
                  </Text>
                </a>
              </NextLink>
              <a href="https://www.interfacerproject.eu/" target="_blank" rel="noreferrer">
                <Text as="p" color="subdued" variant="headingMd">
                  {t("Interfacer Project")}
                </Text>
              </a>
              <a href="https://fab.city/" target="_blank" rel="noreferrer">
                <Text as="p" color="subdued" variant="headingMd">
                  {"Fab City Foundation"}
                </Text>
              </a>
            </Stack>
            <Stack vertical spacing="loose">
              <Text as="h3" variant="headingLg">
                {t("Help pages")}
              </Text>
              <NextLink href="https://interfacerproject.github.io/interfacer-docs/">
                <a target={"_blank"}>
                  <Text as="p" color="subdued" variant="headingMd">
                    {t("User manual")}
                  </Text>
                </a>
              </NextLink>
              <NextLink href="https://github.com/dyne/interfacer-gui/issues/new">
                <a target="_blank" rel="noreferrer">
                  <Text as="p" color="subdued" variant="headingMd">
                    {t("Report a bug")}
                  </Text>
                </a>
              </NextLink>
              <NextLink href="https://github.com/interfacerproject">
                <a target="_blank" rel="noreferrer">
                  <Text as="p" color="subdued" variant="headingMd">
                    {"Github"}
                  </Text>
                </a>
              </NextLink>
            </Stack>
          </div>
        </div>
      </div>
      <div>
        <div className=" flex flex-col items-start space-y-6 md:flex-row md:items-center md:justify-center md:space-x-6 md:space-y-0 border border-subdued p-8">
          <div className="flex items-center space-x-2">
            <Text as="p" variant="bodySm">
              {t("Software by")}
            </Text>
            <NextLink href="https://dyne.org">
              <a>
                <img className="h-10" src="/logo-dyne.svg" alt="Dyne.org Logo" />
              </a>
            </NextLink>
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
      <div className="p-4 text-center bg-background">
        {"©" + t("2023 Interfacer. All rights reserved.")}{" "}
        <Link url="https://www.iubenda.com/privacy-policy/75616407" external>
          {t("Privacy policy.")}
        </Link>
      </div>
    </div>
  );
};

export default Footer;
