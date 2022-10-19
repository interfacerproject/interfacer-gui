import React from "react";
import Link from "next/link";

const BrTags = ({ tags }: { tags?: Array<string>; onCancel?: (tag: string) => void; testID?: string }) => {
  // @ts-ignore
  const stringToColour: (str: string) => CSS.Properties = (str: string) => {
    let hash = str.split("").reduce((pre, cur, index) => {
      return str.charCodeAt(index) + ((pre << 5) - pre);
    }, 0);
    var colour = "#";
    for (var i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 0xff;
      colour += ("00" + value.toString(16)).substr(-2);
    }
    return { backgroundColor: colour };
  };

  return (
    <>
      <div className="hidden badge-neutral badge-error badge-accent badge-primary badge-succes badge-warning" />
      <div className="w-full">
        {tags && tags.length > 0 && (
          <>
            {tags?.map((tag: string, index) => (
              <Link href={`/assets?tags=${tag}`} key={index}>
                <a key={tag} style={stringToColour(tag)} className={`badge  rounded-md float-left mb-1 mr-1 p-3`}>
                  {tag}
                </a>
              </Link>
            ))}
          </>
        )}
      </div>
    </>
  );
};
export default BrTags;
