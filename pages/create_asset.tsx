import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ReactElement, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import type { NextPageWithLayout } from "./_app";

// Partials
import ControlWindow from "../components/partials/create_asset/ControlWindow";
import NewAssetForm from "../components/partials/create_asset/NewAssetForm";

// Layout
import Layout from "../components/layout/CreateAssetLayout";

//

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["createProjectProps", "signInProps", "SideBarProps", "SideBarProps"])),
    },
  };
}

//

const CreateProject: NextPageWithLayout = () => {
  const { user, loading } = useAuth();
  const [logs, setLogs] = useState([`info: user ${user?.ulid}`] as string[]);
  const { t } = useTranslation("createProjectProps");

  return (
    <>
      {loading ? (
        <div>creating...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 p-8 md:grid-cols-12">
          <div className="w-full md:col-start-2 md:col-end-8">
            <div className="w-80">
              <h2 className="text-primary">{t("headline.title")} </h2>
              <p>{t("headline.description")}</p>
            </div>
            <br />
            <NewAssetForm logs={logs} setLogs={setLogs} />
          </div>
          <div className="w-full md:col-start-8 md:col-end-12">
            <ControlWindow logs={logs} />
          </div>
        </div>
      )}
    </>
  );
};

CreateProject.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default CreateProject;
