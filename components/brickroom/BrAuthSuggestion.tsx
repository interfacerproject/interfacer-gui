import { LinkIcon } from "@heroicons/react/outline";
import Link from "next/link";

//

export interface BrAuthSuggestionProps {
  baseText: string;
  linkText: string;
  url: string;
}

//

export default function BrAuthSuggestion(props: BrAuthSuggestionProps) {
  const { baseText, linkText, url } = props;

  return (
    <div className="flex flex-row justify-between items-baseline">
      {/* The text */}
      <p>{baseText}</p>

      {/* The link */}
      <p>
        <Link href={url}>
          <a className="flex flex-row font-semibold items-baseline">
            <LinkIcon className="w-5 h-5 mr-1 self-center" />
            {linkText}
          </a>
        </Link>
      </p>
    </div>
  );
}
