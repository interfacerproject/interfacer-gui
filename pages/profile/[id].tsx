import { useQuery } from "@apollo/client";
import { AdjustmentsIcon, ClipboardListIcon, CubeIcon } from "@heroicons/react/outline";
import { ArrowSmDownIcon, ArrowSmUpIcon } from "@heroicons/react/solid";
import Avatar from "boring-avatars";
import cn from "classnames";
import { FETCH_USER } from "lib/QueryAndMutation";
import type { NextPage } from "next";
import { GetStaticPaths } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import useFilters from "../../hooks/useFilters";

//
import AssetsTable from "../../components/AssetsTable";
import BrTabs from "../../components/brickroom/BrTabs";
import Spinner from "../../components/brickroom/Spinner";
import { useAuth } from "../../hooks/useAuth";
import useStorage from "../../hooks/useStorage";
import UpdateProfileForm from "../../components/UpdateProfileForm";

const Profile: NextPage = () => {
  const { getItem } = useStorage();
  const router = useRouter();
  const { id, tab } = router.query;
  const { t } = useTranslation("ProfileProps");
  const { proposalFilter } = useFilters();
  const { user } = useAuth();

  const isUser: boolean = id === "my_profile" || id === user?.ulid;
  const idToBeFetch = isUser ? user?.ulid : id;

  const person = useQuery(FETCH_USER, { variables: { id: idToBeFetch } }).data?.person;
  typeof idToBeFetch === "string"
    ? (proposalFilter.primaryIntentsResourceInventoriedAsPrimaryAccountable = [idToBeFetch])
    : idToBeFetch!;
  const hasCollectedAssets = isUser && !!getItem("assetsCollected");
  let collectedAssets: { primaryIntentsResourceInventoriedAsId: string[] } = {
    primaryIntentsResourceInventoriedAsId: [],
  };
  if (hasCollectedAssets) {
    collectedAssets["primaryIntentsResourceInventoriedAsId"] = JSON.parse(getItem("assetsCollected"));
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
                  <StatValue title={t("Goals")} value={42} trend={12} />
                  <StatValue title={t("Strength")} value="58%" trend={2.02} />
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
                      {t("Assets")}
                    </span>
                  ),
                  component: (
                    <div>
                      <h3 className="my-8">{isUser ? t("My Assets") : t("Assets")}</h3>
                      <AssetsTable filter={proposalFilter} hideHeader={true} />
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
                      <AssetsTable filter={collectedAssets} hideHeader={true} />
                    </div>
                  ),
                  disabled: hasCollectedAssets,
                },
                {
                  title: (
                    <span className="flex items-center space-x-4">
                      <AdjustmentsIcon className="w-5 h-5 mr-1" />
                      {t("update profile")}
                    </span>
                  ),
                  component: (
                    <div>
                      <h3 className="my-8">{t("update personal info")}</h3>
                      <UpdateProfileForm person={person} />
                    </div>
                  ),
                  hidden: !isUser,
                },
              ]}
            />
          </div>
        </>
      )}
    </>
  );
};

const StatValue = ({ title, value, trend }: { title: string; value: number | string; trend: number }) => {
  const { t } = useTranslation("ProfileProps");
  const positive = trend > 0;

  return (
    <div className="stat">
      <div className="stat-figure">
        <span
          className={cn("flex rounded-full space-x-2 py-1 px-2 items-center", {
            "bg-green-100": positive,
            "bg-red-100": !positive,
          })}
        >
          {positive ? (
            <ArrowSmUpIcon className="w-5 h-5 text-green-500" />
          ) : (
            <ArrowSmDownIcon className="w-5 h-5 text-red-500" />
          )}
          <span>{trend}%</span>
        </span>
      </div>
      <div className="stat-title">{title}</div>
      <div className="text-2xl font-semibold stat-value text-primary font-display">{value}&nbsp;</div>
    </div>
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
