import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";

// Components
import ProjectsTable from "components/ProjectsTable";
import NewProjectButton from "components/NewProjectButton";
import useFilters from "../hooks/useFilters";

//

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["signInProps", "lastUpdatedProps", "SideBarProps"])),
    },
  };
}

//

export default function Projects() {
  const { t } = useTranslation("lastUpdatedProps");
  const { proposalFilter } = useFilters();
  return (
    <div className="p-8">
      <div className="mb-6 w-96">
        <h1>{t("Latest projects")}</h1>
        <p className="my-2">{t("Most recently updated projects")}</p>
        <NewProjectButton />
        <Link href="https://github.com/dyne/interfacer-gui/issues/new">
          <a target="_blank" className="ml-2 normal-case btn btn-accent btn-outline btn-md">
            {t("Report a bug")}
          </a>
        </Link>
      </div>

      {/*  */}
      <ProjectsTable filter={proposalFilter} />
    </div>
  );
}
