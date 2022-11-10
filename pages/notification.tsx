import { gql, useQuery } from "@apollo/client";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useEffect } from "react";
import BrDisplayUser from "../components/brickroom/BrDisplayUser";
import { useAuth } from "../hooks/useAuth";
import useStorage from "../hooks/useStorage";
import dayjs from "../lib/dayjs";

const QUERY_ASSETS = gql`
  query ($first: Int, $after: ID, $last: Int, $before: ID, $filter: ProposalFilterParams) {
    proposals(first: $first, after: $after, before: $before, last: $last, filter: $filter) {
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
        totalCount
        pageLimit
      }
      edges {
        cursor
        node {
          id
          name
          created
          primaryIntents {
            resourceInventoriedAs {
              id
              name
              metadata
              primaryAccountable {
                name
                id
              }
            }
          }
        }
      }
    }
  }
`;

const Notification = () => {
  const { user } = useAuth();
  const { t } = useTranslation("notificationProps");
  const { getItem, setItem } = useStorage();
  const { data, startPolling } = useQuery(QUERY_ASSETS, { variables: { last: 50 } });
  startPolling(4000);
  const notifications = data?.proposals.edges.filter((proposal: any) =>
    proposal.node.primaryIntents[0]?.resourceInventoriedAs?.metadata?.contributors?.some(
      (c: { id: string; name: string }) => c.id === user?.ulid
    )
  );
  useEffect(() => {
    setInterval(() => {
      notifications?.map((n: any) => setItem(n.node.id, "read"));
    }, 2000);
    if (getItem("watchedList")) {
      const _watchedList = JSON.parse(getItem("watchedList"));
    }
  }, [notifications]);

  return (
    <div className="grid grid-cols-1 p-12">
      {notifications?.map((n: any) => (
        <div key={n.node.id} className="pb-2 my-2 border-b-2">
          <p className="mr-1">{dayjs(n.node.created).fromNow()}</p>
          <p className="text-xs">{dayjs(n.node.created).format("HH:mm DD/MM/YYYY")}</p>
          <div className="flex flex-row my-2 center">
            <div className="mr-2">
              <BrDisplayUser
                id={n.node.primaryIntents[0].resourceInventoriedAs.primaryAccountable.id}
                name={n.node.primaryIntents[0].resourceInventoriedAs.primaryAccountable.name}
              />
            </div>
            <div className="pt-3">
              <span className="mr-1">{t("added you as contributor to")}</span>
              <Link href={`/asset/${n.node.id}`}>
                <a className="text-primary hover:underline">{n.node.primaryIntents[0].resourceInventoriedAs.name}</a>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["signInProps", "notificationProps", "SideBarProps"])),
    },
  };
}

export default Notification;
