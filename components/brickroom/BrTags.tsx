import React from "react";

const BrTags = ({tags, onCancel}:{tags?:Array<string>, onCancel?: (tag:string)=>void}) => {
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
    return <><div className="hidden badge-neutral badge-error badge-accent badge-primary badge-succes badge-warning"/>
            <div className="w-full">
                 {tags && tags.length > 0 && <>{
                tags?.map((tag: string, index) => <span key={tag} className={`badge badge-${colors(index)} rounded-md float-left mb-1 mr-1 p-3`}>
                    {onCancel &&<button  className={'btn btn-ghost btn-xs ml-0'} onClick={()=>{onCancel(tag)}}>x</button>}
                    {tag}</span>)
            }</>}
            </div></>
}
export default BrTags
