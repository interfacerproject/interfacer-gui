import { useQuery } from "@apollo/client";
import { ClipboardListIcon, CubeIcon } from "@heroicons/react/outline";
import Avatar from "boring-avatars";
import BrTabs from "components/brickroom/BrTabs";
import Spinner from "components/brickroom/Spinner";
import ProjectsTable from "components/ProjectsTable";
import TokensResume from "components/TokensResume";
import { useAuth } from "hooks/useAuth";
import useStorage from "hooks/useStorage";
import { Token } from "hooks/useWallet";
import { FETCH_USER } from "lib/QueryAndMutation";
import type { NextPage } from "next";
import { GetStaticPaths } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import useFilters from "../../hooks/useFilters";

//

const Profile: NextPage = () => {
  const { getItem } = useStorage();
  const router = useRouter();
  const { id, tab } = router.query;
  const { t } = useTranslation("ProfileProps");
  const { proposalFilter } = useFilters();
  const { user } = useAuth();

  const isUser: boolean = id === "my_profile" || id === user?.ulid;
  const idToBeFetch = isUser ? user?.ulid : String(id);

  const person = useQuery(FETCH_USER, { variables: { id: idToBeFetch } }).data?.person;
  typeof idToBeFetch === "string" ? (proposalFilter.primaryAccountable = [idToBeFetch]) : idToBeFetch!;
  const hasCollectedProjects = isUser && !!getItem("projectsCollected");
  let collectedProjects: { id: string[] } = {
    id: [],
  };
  if (hasCollectedProjects) {
    collectedProjects["id"] = JSON.parse(getItem("projectsCollected"));
  }

  return (
    <>
      {!person && <Spinner />}
      {person && (
        <>
          <div className="relative h-128 md:h-72">
            <div
              className="w-full bg-center bg-cover h-128 md:h-72"
              style={{ backgroundImage: "url('/profile_bg.jpeg')", filter: "blur(1px)" }}
            />
            <div className="absolute w-full p-2 bottom-8 top-2 md:p-0 md:bottom-12 md:h-100">
              <div className="grid grid-cols-1 px-2 md:pt-8 md:grid-cols-2 md:pl-8">
                <div className="flex flex-col">
                  <div className="flex flex-row">
                    <h2 className="pt-5 mb-6 mr-2">
                      {isUser ? <>{t("Hi") + " "}</> : <> </>}
                      <span className="text-primary">{person?.name}</span>
                    </h2>
                    <div className="w-10 rounded-full">
                      <Avatar
                        size={"full"}
                        name={person?.name}
                        variant="beam"
                        colors={["#F1BD4D", "#D8A946", "#02604B", "#F3F3F3", "#014837"]}
                      />
                    </div>
                  </div>
                  <p>{isUser ? t("Welcome to your Interfacer profile") : t("")} </p>
                  <h4 className="mt-2">
                    {isUser
                      ? t("Your user id is: {{id}}", { id: person?.id })
                      : t("The user id is: {{id}}", { id: person?.id })}{" "}
                  </h4>
                </div>
                <div className="my-4 shadow md:mr-20 stats stats-vertical">
                  <TokensResume stat={t(Token.Idea)} id={idToBeFetch!} />
                  <TokensResume stat={t(Token.Strengths)} id={idToBeFetch!} />
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 pt-32 md:mr-12 md:px-10 md:pt-0">
            <BrTabs
              initialTab={(typeof tab === "string" && parseInt(tab)) || undefined}
              tabsArray={[
                {
                  title: (
                    <span className="flex items-center space-x-4">
                      <CubeIcon className="w-5 h-5 mr-1" />
                      {t("Projects")}
                    </span>
                  ),
                  component: (
                    <div>
                      <h3 className="my-8">{isUser ? t("My Projects") : t("Projects")}</h3>
                      <ProjectsTable filter={proposalFilter} hideHeader={true} hideFilters={true} />
                    </div>
                  ),
                },
                {
                  title: (
                    <span className="flex items-center space-x-4">
                      <ClipboardListIcon className="w-5 h-5 mr-1" />
                      {t("List")}
                    </span>
                  ),
                  component: (
                    <div>
                      <h3 className="my-8">{isUser ? t("My List") : t("List")}</h3>
                      <ProjectsTable filter={collectedProjects} hideHeader={true} hideFilters={true} />
                    </div>
                  ),
                  disabled: hasCollectedProjects,
                },
              ]}
            />
          </div>
        </>
      )}
    </>
  );
};

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["signInProps", "lastUpdatedProps", "SideBarProps", "ProfileProps"])),
    },
  };
}

export default Profile;
