import {Dispatch, SetStateAction, useState} from "react";
import BrSearchableSelect from "./brickroom/BrSearchableSelect";
import {gql, useQuery} from "@apollo/client";

const QUERY_VARIABLES = gql`query {
  instanceVariables{
    specs{
      specProjectDesign {
        name
        id
      }
      specProjectProduct {
        name
        id
      }
      specProjectService {
        name
        id
      }
    }
  }
}`

const SelectAssetType = ({onChange}:{onChange:Dispatch<SetStateAction<string[]>>}) => {
    const [inputValue, setInputValue] = useState('')
    const instanceVariables = useQuery(QUERY_VARIABLES).data?.instanceVariables.specs
    const options = instanceVariables && Object.keys(instanceVariables).map((key)=>({value:instanceVariables[key].id, label:instanceVariables[key].name}) )

    return (
        <BrSearchableSelect options={options} onChange={onChange} onInputChange={setInputValue} inputValue={inputValue} multiple/>
    )
}

export default SelectAssetType
