import {Dispatch, SetStateAction, useState} from "react";
import BrSearchableSelect from "./brickroom/BrSearchableSelect";
import {gql, useQuery} from "@apollo/client";
import devLog from "../lib/devLog";

const QUERY = gql`{
   economicResourceClassifications
}`

type SelectAssetTypeProps = {
    label?: string,
    hint?: string,
    error?: string
}

const SelectTags = ({ label, hint, error}: SelectAssetTypeProps) => {
    const onChange = ()=>"mimmo";
    const [inputValue, setInputValue] = useState('')
    const tags = useQuery(QUERY).data?.economicResourceClassifications
    devLog("taggggs", tags)
    const options = tags && tags.map((tag:string) => ({
        value: tag,
        label: tag
    }))

    return (<>
            <BrSearchableSelect options={options} onInputChange={setInputValue} onChange={onChange}
                                label={label} hint={hint} error={error}
                                inputValue={inputValue} multiple/>

        </>
    )
}

export default SelectTags
