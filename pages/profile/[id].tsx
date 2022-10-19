import { gql, useQuery } from "@apollo/client";
import { ClipboardListIcon, CubeIcon } from "@heroicons/react/outline";
import { ArrowSmDownIcon, ArrowSmUpIcon } from "@heroicons/react/solid";
import Avatar from "boring-avatars";
import cn from "classnames";
import type { NextPage } from "next";
import { GetStaticPaths } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import AssetsTable from "../../components/AssetsTable";
import Spinner from "../../components/brickroom/Spinner";
import { useAuth } from "../../hooks/useAuth";
import devLog from "../../lib/devLog";
import BrTabs from "../../components/brickroom/BrTabs";
import useStorage from "../../hooks/useStorage";

const Profile: NextPage = () => {
  const { getItem } = useStorage();
  const router = useRouter();
  const { id, conformTo, tags } = router.query;
  const { t } = useTranslation("ProfileProps");
  const FETCH_USER = gql(`query($id:ID!) {
  person(id:$id) {
    id
    name
    email
    user
    ethereumAddress
    primaryLocation {
      name
      mappableAddress
    }
  }
}`);
  const { user } = useAuth();
  const isUser: boolean = id === "my_profile" || id === user?.ulid;
  const idToBeFetch = isUser ? user?.ulid : id;
  const person = useQuery(FETCH_USER, { variables: { id: idToBeFetch } }).data?.person;
  const filter = { primaryIntentsResourceInventoriedAsPrimaryAccountable: idToBeFetch };
  const hasCollectedAssets = isUser && !!getItem("assetsCollected");
  let collectedAssets: { primaryIntentsResourceInventoriedAsId: string[] } = {
    primaryIntentsResourceInventoriedAsId: [],
  };
  if (conformTo) {
    // @ts-ignore
    filter["primaryIntentsResourceInventoriedAsConformsTo"] = conformTo.split(",");
  }
  if (tags) {
    // @ts-ignore
    filter["primaryIntentsResourceInventoriedAsClassifiedAs"] = tags.split(",");
  }
  devLog(user);
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
                      {isUser ? <>{t("hi")},&nbsp;</> : <> </>}
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
                  <p>{isUser ? t("description") : t("")} </p>
                  <h4 className="mt-2">
                    {isUser ? t("user id title") : t("other user id title")}{" "}
                    <span className="text-primary">{person?.id}</span>
                  </h4>
                </div>
                <div className="my-4 shadow md:mr-20 stats stats-vertical">
                  <StatValue title={t("Goals")} value={71.897} totals={70.946} trend={12} />
                  <StatValue title={t("Strength")} value={10} totals={2.02} trend={-2.02} />
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 pt-32 md:mr-12 md:px-10 md:pt-0">
            <BrTabs
              tabsArray={[
                {
                  title: (
                    <span className="flex items-center space-x-4">
                      <CubeIcon className="w-5 h-5 mr-1" />
                      {t("Assets")}
                    </span>
                  ),
                  component: <AssetsTable filter={filter} noPrimaryAccountableFilter />,
                },
                {
                  title: (
                    <span className="flex items-center space-x-4">
                      <ClipboardListIcon className="w-5 h-5 mr-1" />
                      {t("Lists")}
                    </span>
                  ),
                  component: <AssetsTable filter={collectedAssets} />,
                  disabled: hasCollectedAssets,
                },
              ]}
            />
          </div>
        </>
      )}
    </>
  );
};

const StatValue = ({
  title,
  value,
  totals,
  trend,
}: {
  title: string;
  value: number;
  totals: number;
  trend: number;
}) => {
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
      <div className="text-2xl font-semibold stat-value text-primary font-display">
        {value}&nbsp;
        <span className="text-sm font-normal text-slate-300">
          {t("from")}&nbsp;{totals}
        </span>
      </div>
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
