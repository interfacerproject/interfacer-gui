import {useState} from "react";
import {gql, useQuery} from "@apollo/client";
import BrSelect from "./brickroom/BrSelect";
import devLog from "../lib/devLog";
type AddContributorsProps = {
    contributors?: Array<string>,
    setContributors: (contributors: Array<string>) => void,
}

const AddContributors = ({contributors, setContributors}:AddContributorsProps)=> {
    const QUERY_AGENTS = gql`query ($first: Int, $id: ID){
  agents(first:$first, after: $id) {
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
      }
    }
  }
}`
    const agents = useQuery(QUERY_AGENTS).data?.agents.edges.map((agent:any)=>agent.node)
    devLog(agents)
    return<>
        <BrSelect array={agents} handleSelect={()=>setContributors}  label={'Contributors:'} multiple/>
    </>
}
export default AddContributors
