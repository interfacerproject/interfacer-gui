import {gql, useQuery} from "@apollo/client";
import {BellIcon} from "@heroicons/react/outline";
import React from "react";
import {useAuth} from "../lib/auth";
import devLog from "../lib/devLog";
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
            metadata
          }
        }
      }
    }
  }
}
`


const NotificationBell = () => {
    const {authId} = useAuth();
    const {data, startPolling} = useQuery(QUERY_ASSETS, {variables: {last: 50}})
    startPolling(4000)
    const notifications = data?.proposals.edges.filter((proposal: any) => proposal.node.primaryIntents[0]?.resourceInventoriedAs?.metadata?.contributors.some((c: any) => c.id === authId))
    devLog("notifications", notifications)
    return (<Link href="/notification">
            <a className="relative mr-4">
                <button className="bg-white btn btn-circle btn-accent">
                    <BellIcon className="w-5 h-5"/>
                </button>
                {notifications?.length > 0 && <sup
                    className="btn btn-active  btn-circle btn-success btn-xs absolute top-0 right-0">{notifications.length}</sup>}
            </a>
        </Link>
    )
}

export default NotificationBell
