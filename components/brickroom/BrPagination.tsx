import React, {useState} from "react";

type BrPaginationProps = {
    max: number,
    handleStart: any,
    handleEnd: any,
}

const BrPagination = (props: BrPaginationProps) => {
    const [current, setCurrent] = useState(0)
    const isNearCurrent = (a:number)=>((current-2)<a)&&((current+2)>a)||(a===0)||(a===(props.max-1))
    const isBeforeOrAfterCurrent = (a:number)=>((current-2)===a)||((current+2)===a)&&(a!==0)&&(a!==props.max-1)

    return (<div className="grid grid-cols-1 gap-4 place-items-center">
        <div className="btn-group ">
            {props.max&&Array.from(Array(props.max).keys()).map((a) => (<>
                {isNearCurrent(a)&&<button key={a+1}
                    onClick={() => {
                        props.handleStart(a * 10)
                        props.handleEnd((a * 10) + 10)
                        setCurrent(a)
                    }}
                    className="btn btn-ghost btn-xs">
                    {a+1}
                </button>}
                {isBeforeOrAfterCurrent(a)&&<span>...</span>}
                </>))}
        </div>
    </div>
    )
}

export default BrPagination