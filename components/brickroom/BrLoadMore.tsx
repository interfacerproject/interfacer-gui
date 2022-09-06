import React from "react";

type BrLoadMore = {
    handleClick: any,
    disabled: boolean,
    text: string
}

const BrLoadMore = (props: BrLoadMore) => {
    return (<div className="grid grid-cols-1 gap-4 place-items-center mt-4">
            <button className="btn btn-primary" onClick={props.handleClick}
                    disabled={props.disabled}>{props.text}</button>
        </div>
    )
}

export default BrLoadMore