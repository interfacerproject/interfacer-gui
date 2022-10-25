import { StarIcon } from "@heroicons/react/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/solid";
import { useTranslation } from "next-i18next";
import { useMutation } from "@apollo/client";
import { useAuth } from "../hooks/useAuth";
import { UPDATE_METADATA } from "../lib/QueryAndMutation";

const AddStar = ({ id, metadata }: { id: string; metadata: { starred?: string[] } }) => {
  const { user } = useAuth();
  const [updateEconomicResource] = useMutation(UPDATE_METADATA);
  const hasAlreadyStarred = metadata?.starred?.includes(user!.ulid);
  const { t } = useTranslation("common");
  const disabled = !metadata;
  const handleClick = () => {
    if (!hasAlreadyStarred) {
      const _metadata = { ...metadata, starred: hasAlreadyStarred ? [...metadata.starred!, user!.ulid] : [user!.ulid] };
      updateEconomicResource({ variables: { id: id, metadata: JSON.stringify(_metadata) } });
    } else {
      const _metadata = { ...metadata, starred: metadata.starred!.filter(star => star !== user!.ulid) };
      updateEconomicResource({ variables: { id: id, metadata: JSON.stringify(_metadata) } });
    }
  };
  return (
    <button
      className={"btn btn-outline btn-neutral px-4 btn-active border-gray-300"}
      onClick={handleClick}
      disabled={disabled}
    >
      {hasAlreadyStarred ? <StarIconSolid className="w-6 h-6" /> : <StarIcon className="w-6 h-6" />}
      <span className="mx-2 capitalize">{t("stars")}</span>
      <span className="bg-[#CDE4DF] text-[#5DA091] border-[#5DA091] border border-1 rounded-[4px] text-xs mr-1 px-0.5">
        {metadata?.starred?.length}
      </span>
    </button>
  );
};

export default AddStar;
