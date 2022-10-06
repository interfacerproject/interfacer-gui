import {gql, useQuery} from "@apollo/client";
import {useAuth} from "../lib/auth";
import dayjs from "../lib/dayjs";
import Link from "next/link";

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
    const {data, startPolling} = useQuery(QUERY_ASSETS, {variables: {last: 50}})
    startPolling(4000)
    const notifications = data?.proposals.edges.filter((proposal: any) => proposal.node.primaryIntents[0]?.resourceInventoriedAs?.metadata?.contributors.some((c: {id:string, name:string}) => c.id === authId))
    return <div className="grid grid-cols-1 justify-items-center p-12">
        {notifications?.map((n: any) => <div key={n.node.id} className="my-6">
            <b className="mr-1 p-8">{dayjs(n.node.created).fromNow()}</b>
            <Link href={`/profile/${n.node.primaryIntents[0].resourceInventoriedAs.primaryAccountable.id}`}>
                <a className="text-primary hover:underline">{n.node.primaryIntents[0].resourceInventoriedAs.primaryAccountable.name}</a>
            </Link> added you as contributor to
            <Link href={`/asset/${n.node.id}`}>
                <a className="text-primary hover:underline"> {n.node.primaryIntents[0].resourceInventoriedAs.name}</a>
            </Link>
        </div>)}
    </div>

}

export default Notification
