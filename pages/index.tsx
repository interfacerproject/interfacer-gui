import { Button } from "@bbtgnn/polaris-interfacer";
import { CheckCircleIcon, GlobeAltIcon, LightningBoltIcon, ScaleIcon } from "@heroicons/react/outline";
import AssetsTable from "components/AssetsTable";
import Layout from "components/layout/Layout";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { NextPageWithLayout } from "./_app";

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["signInProps", "homeProps", "SideBarProps", "lastUpdatedProps"])),
    },
  };
}

const Home: NextPageWithLayout = () => {
  const { t } = useTranslation("homeProps");
  const { authenticated } = useAuth();
  const features = [
    { icon: <LightningBoltIcon /> },
    { icon: <ScaleIcon /> },
    { icon: <GlobeAltIcon /> },
    { icon: <LightningBoltIcon /> },
    { icon: <ScaleIcon /> },
    { icon: <GlobeAltIcon /> },
  ];

  const subtitles = [
    t("Welcome to Interfacer's Fabcity OS alpha staging 😎"),
    t("Create or import assets and collaborate with others in digital designs or in manufacturing physical products."),
  ];

  return (
    <>
      <div className="p-8 min-h-[60vh] max-h-[800px] flex items-center justify-center bg-[#f8f7f4] w-full bg-right bg-no-repeat bg-cover bg-[url('/bg_nru_md.svg')]">
        <div className="space-y-6">
          <div className="mb-6 logo" />

          <h2 className="text-3xl">{t("Building the digital infrastructure for Fab Cities")}</h2>

          <div className="space-y-1">
            {subtitles.map(s => (
              <div className="flex items-center" key={s}>
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                <p>{s}</p>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            {!authenticated && (
              <>
                <Link href="/sign_in">
                  <Button size="large" primary>
                    {t("Log In")}
                  </Button>
                </Link>
                <Link href="/sign_up">
                  <Button size="large">{t("Register")}</Button>
                </Link>
              </>
            )}
            {authenticated && (
              <>
                <Link href="/create_asset">
                  <Button size="large" primary>
                    {t("Create a new asset")}
                  </Button>
                </Link>
                <Link href="/resources">
                  <Button size="large">{t("Import a resource from LOSH")}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 container mx-auto overflow-x-scroll">
        {<AssetsTable hideHeader={true} hidePagination={true} />}
      </div>

      {/* <div className="grid gap-16 md:pl-32 md:grid-cols-3 mt-44">
        {features.map((f, i) => {
          return (
            <div key={i} className="flex md:flex-col">
              <div className="w-12 h-12 p-3 mr-2 text-white rounded-lg bg-[#5DA091]">{f.icon}</div>
              <h3 className="mt-5 mb-2">{t("Feature {{n}}", { n: i })}</h3>
              <p className="text-[#8a8e96]">{t("Coming soon")}</p>
            </div>
          );
        })}
      </div> */}
    </>
  );
};

Home.publicPage = true;
Home.getLayout = page => <Layout>{page}</Layout>;

export default Home;
