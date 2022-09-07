import React, {ChangeEvent, useEffect} from 'react';
import BrTextField from "./BrTextField";
import BrTags from "./BrTags";

type TagSelectorProps = {
    tags?: Array<string>,
    selectedTags?: Array<string>,
    onSelect?: (tags: string[]) => void,
    onSubmit?: () => void,
    onCancel?: () => void,
    className?: string,
    hint?: string,
    error?: string,
    label?: string,
    placeholder?: string,
}

const TagSelelector = (props: TagSelectorProps) => {
    const [tags, setTags] = React.useState(props.tags &&[...props.tags]);

    const handleAdd = async (e: ChangeEvent<HTMLInputElement>) => {
        setTags(Array.from(new Set(
            e.target.value.split(/\s/).filter(tag => tag.length > 0)
        )))
    }
    const cancelTag = (tag:string) => {
        setTags([...tags!.filter(t => t !== tag)])
    }
    useEffect(() => {
        props.onSelect && props.onSelect(tags!);
    }, [tags]);

    return (<>
        <div className={`form-control ${props.className}`}>
             <label className="label mb-[-3px]">
                <span className="label-text">{props.label}</span>
            </label>
            <BrTags onCancel={cancelTag} tags={tags}/>
            <BrTextField placeholder={props.placeholder} hint={props.hint} error={props.error} onChange={handleAdd}/>
        </div>
        </>)
}

export default TagSelelector;