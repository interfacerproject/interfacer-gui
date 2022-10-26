import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";

const BrTags = ({ tags }: { tags?: Array<string>; onCancel?: (tag: string) => void; testID?: string }) => {
  const { user } = useAuth();
  return (
    <>
      <div className="w-full">
        {tags && tags.length > 0 && (
          <>
            {tags?.map((tag: string, index) => (
              <Link href={!!user ? `/assets?tags=${tag}` : "/sign_in"} key={index}>
                <a
                  key={tag}
                  className={`bg-[#CDE4DF] text-[#5DA091] border-[#5DA091] border border-1 rounded-[4px] text-sm float-left mb-1 mr-1 px-0.5`}
                >
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
