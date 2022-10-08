import React from "react";

const BrTags = ({
  tags,
  onCancel,
  testID,
}: {
  tags?: Array<string>;
  onCancel?: (tag: string) => void;
  testID?: string;
}) => {
  return (
    <>
      {/* <div className="hidden badge-neutral badge-error badge-accent badge-primary badge-success badge-warning" /> */}
      <div className="w-full">
        {tags && tags.length > 0 && (
          <>
            {tags?.map((tag: string, index) => (
              <span key={tag} className={`badge badge-primary rounded-md float-left mb-1 mr-1 p-3`}>
                {onCancel && (
                  <button
                    className={"btn btn-ghost btn-xs ml-0"}
                    onClick={() => {
                      onCancel(tag);
                    }}
                    data-test={testID}
                  >
                    x
                  </button>
                )}
                {tag}
              </span>
            ))}
          </>
        )}
      </div>
    </>
  );
};
export default BrTags;
