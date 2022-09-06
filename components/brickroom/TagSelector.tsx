import React, {ChangeEvent, useEffect} from 'react';
import BrTextField from "./BrTextField";

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
    const colors = (i:number)=>{
        switch((i+1)%6){
            case 1:
                return 'primary'
            case 2:
                return 'error'
            case 3:
                return 'accent'
            case 4:
                return 'warning'
            case 5:
                return 'success'
            case 0:
                return 'neutral'
        }
    }

    return (<>
        <div className={`form-control ${props.className}`}>
             <label className="label mb-[-3px]">
                <span className="label-text">{props.label}</span>
            </label>
            <div className="hidden badge-neutral badge-error badge-accent badge-primary badge-succes badge-warning"/>
            <div className="w-full">
                 {tags && tags.length > 0 && <>{
                tags?.map((tag: string, index) => <span key={tag} className={`badge badge-${colors(index)} rounded-md float-left mb-1 mr-1 py-4 pr-4`}><button  className={'btn btn-ghost btn-xs ml-0'} onClick={()=>cancelTag(tag)}>x</button> {tag}</span>)
            }</>}
            </div>

            <BrTextField placeholder={props.placeholder} hint={props.hint} error={props.error} onChange={handleAdd}/>
        </div>
        </>)
}

export default TagSelelector;