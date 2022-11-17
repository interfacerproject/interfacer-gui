import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useMutation } from "@apollo/client";
import { UPDATE_METADATA } from "../lib/QueryAndMutation";
import { useTranslation } from "next-i18next";

const WatchButton = ({ id, metadata }: { id: string; metadata: any }) => {
  const { user } = useAuth();
  const [isWatching, setIsWatching] = useState<boolean>(metadata?.watchers?.includes(user?.ulid));
  const [updateEconomicResource] = useMutation(UPDATE_METADATA);
  const { t } = useTranslation("common");
  const handleWatch = async () => {
    const _metadata = {
      ...metadata,
      watchers: metadata.watchers ? [...metadata.watchers, user!.ulid] : [user!.ulid],
    };
    await updateEconomicResource({ variables: { metadata: JSON.stringify(_metadata), id: id } }).then(r => {
      setIsWatching(true);
    });
  };
  const handleUnwatch = async () => {
    const _metadata = {
      ...metadata,
      watchers: metadata.watchers?.filter((w: any) => w !== user!.ulid),
    };
    await updateEconomicResource({ variables: { metadata: JSON.stringify(_metadata), id: id } }).then(r => {
      setIsWatching(false);
    });
  };

  return (
    <button
      className="btn btn-accent btn-outline btn-block"
      tabIndex={-1}
      role="button"
      aria-disabled={true}
      onClick={isWatching ? handleUnwatch : handleWatch}
    >
      {isWatching ? t("unwatch") : t("watch")}
    </button>
  );
};

export default WatchButton;
