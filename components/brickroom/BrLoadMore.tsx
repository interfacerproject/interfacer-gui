import React from "react";

type BrLoadMore = {
  handleClick: any;
  hidden: boolean;
  text: string;
};

const BrLoadMore = (props: BrLoadMore) => {
  return (
    <div className="grid grid-cols-1 gap-4 place-items-center mt-4">
      {!props.hidden && (
        <button className="btn btn-primary" onClick={props.handleClick}>
          {props.text}
        </button>
      )}
    </div>
  );
};

export default BrLoadMore;
