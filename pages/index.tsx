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

  return (
    <>
      <div className="p-4 md:pl-32 flex items-center bg-[#f8f7f4] w-full bg-right bg-no-repeat bg-contain md:h-[596px] bg-[url('/bg_nru_md.svg')]">
        <div className="md:mt-40">
          <div className="mb-6 logo" />
          <h2 className="text-3xl">{t("Building the digital infrastructure for Fab Cities")}</h2>
          <p className="flex items-center mt-8">
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            {t("Welcome to Interfacer's Fabcity OS alpha staging 😎")}
          </p>
          <p className="flex items-center mt-2">
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            {t(
              "Create or import assets and collaborate with others in digital designs or in manufacturing physical products&#46;"
            )}
          </p>

          <Link href="/sign_in">
            <a className={`btn btn-primary mt-6 ${authenticated ? "btn-disabled" : ""}`}>{t("Create")}</a>
          </Link>
          <Link href="/">
            <a className="ml-4 btn btn-outline btn-primary">{t("Create new assets or import from LOSH")}</a>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 px-2 md:px-8 pt">{<AssetsTable hideHeader={true} hidePagination={true} />}</div>

      <div className="grid gap-16 md:pl-32 md:grid-cols-3 mt-44">
        {features.map((f, i) => {
          return (
            <div key={i} className="flex md:flex-col">
              <div className="w-12 h-12 p-3 mr-2 text-white rounded-lg bg-[#5DA091]">{f.icon}</div>
              <h3 className="mt-5 mb-2">{t("Feature {{n}}", { n: i })}</h3>
              <p className="text-[#8a8e96]">{t("Coming soon")}</p>
            </div>
          );
        })}
      </div>
    </>
  );
};

Home.publicPage = true;
Home.getLayout = page => <Layout>{page}</Layout>;

export default Home;
