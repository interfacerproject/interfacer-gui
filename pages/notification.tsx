import {gql, useQuery} from "@apollo/client";
import {useAuth} from "../lib/auth";
import dayjs from "../lib/dayjs";
import Link from "next/link";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";

const QUERY_ASSETS = gql`query ($first: Int, $after: ID, $last: Int, $before: ID, $filter:ProposalFilterParams) {
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
            primaryAccountable{
              name
              id
            }
          }
        }
      }
    }
  }
}
`

const Notification = () => {
    const {authId} = useAuth();
    const {t} = useTranslation("notificationProps");
    const {data, startPolling} = useQuery(QUERY_ASSETS, {variables: {last: 50}})
    startPolling(4000)
    const notifications = data?.proposals.edges.filter((proposal: any) => proposal.node.primaryIntents[0]?.
    resourceInventoriedAs?.metadata?.contributors.some((c: {id:string, name:string}) => c.id === authId))
    return <div className="grid grid-cols-1 justify-items-center p-12">
        {notifications?.map((n: any) => <div key={n.node.id} className="my-6">
            <b className="mr-1 p-8">{dayjs(n.node.created).fromNow()}</b>
            <Link href={`/profile/${n.node.primaryIntents[0].resourceInventoriedAs.primaryAccountable.id}`}>
                <a className="text-primary hover:underline">
                    {n.node.primaryIntents[0].resourceInventoriedAs.primaryAccountable.name}
                </a>
            </Link> {t("added")}
            <Link href={`/asset/${n.node.id}`}>
                <a className="text-primary hover:underline"> {n.node.primaryIntents[0].resourceInventoriedAs.name}</a>
            </Link>
        </div>)}
    </div>
}

export async function getStaticProps({locale}: any) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['signInProps', 'notificationProps', 'SideBarProps'])),
        },
    };
}

export default Notification
