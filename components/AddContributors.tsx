import React, {useState} from "react";
import {gql, useQuery} from "@apollo/client";
import BrSelect from "./brickroom/BrSelect";
import devLog from "../lib/devLog";
import {SearchIcon} from "@heroicons/react/outline";
import {ExclamationIcon} from "@heroicons/react/solid";

type AddContributorsProps = {
    contributors: Array<string>,
    setContributors: (contributors: Array<string>) => void,
    label?: string,
    hint?: string,
    error?: string
}
export const QUERY_AGENTS = gql`query ($first: Int, $id: ID){
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

const AddContributors = ({contributors, setContributors, label, hint, error}: AddContributorsProps) => {
    const [searchTerm, setSearchTerm] = useState<string>("");

    const agents = useQuery(QUERY_AGENTS).data?.agents.edges.map((agent: any) => agent.node)
    devLog('agents:', agents)
    const filteredContributors = agents?.filter((contributor: { id: string, name: string }) => {
        return contributor.name.toLowerCase().includes(searchTerm.toLowerCase())
    })
    devLog(searchTerm, 'filtered contributors:', filteredContributors)
    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // @ts-ignore
        const updatedOptions = [...e.target.options]
            .filter(option => option.selected)
            .map(x => x.value);
        devLog("contributors", updatedOptions);
        setContributors(updatedOptions);
    }
    const handleCancel = (contr: string) => {
        const updatedOptions = contributors.filter(contributor => contributor !== contr)
        setContributors(updatedOptions)
    }
    return <div className="w-full">
        <label className="label">
            <h4 className="label-text capitalize">{label}</h4>
        </label>
        <label htmlFor="searchTerm" className="relative py-2 text-gray-400 focus-within:text-gray-600 block">
            <SearchIcon className="pointer-events-none w-8 h-8 absolute top-1/2 transform -translate-y-1/2 left-3"/>
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full input input-bordered focus:input-primary pl-14"/>
        </label>

        {searchTerm !== "" && filteredContributors.length > 0 &&
        <select onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSelect(e)}
                className="select select-bordered w-full mt-1 focus:select-primary" multiple>
            {filteredContributors?.map((contributor: { id: string, name: string }) =>
                (<option key={contributor?.id} value={contributor?.id}>
                    {contributor?.name}</option>))}
        </select>
        }

        {contributors.length > 0 && <div className="w-full flex flex-wrap mt-1">{contributors.map((contributor: string) => <>
            <div key={contributor}
                 className="badge badge-success bg-green-200 rounded-md float-left mb-1 mr-1 p-3 break-normal">
                <button className={'btn btn-ghost btn-xs ml-0'} onClick={() => handleCancel(contributor)}>x</button>
                {agents.find((a: { id: string, name: string }) => a.id === contributor).name}</div>
        </>)}
        </div>}
        <label className="label">
            {error &&
            <span className="flex flex-row items-center justify-between label-text-alt text-warning">
                    <ExclamationIcon className='w-5 h-5'/>
                {error}</span>}
            {hint && <span className="label-text-alt">{hint}
                </span>}
        </label>
    </div>
}
export default AddContributors
