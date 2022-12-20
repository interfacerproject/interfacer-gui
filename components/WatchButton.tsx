import { useMutation } from "@apollo/client";
import { Button, Icon } from "@bbtgnn/polaris-interfacer";
import { HideMinor, ViewMinor } from "@shopify/polaris-icons";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { UPDATE_METADATA } from "../lib/QueryAndMutation";

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
    <Button
      id="addToWatch"
      fullWidth
      size="large"
      onClick={isWatching ? handleUnwatch : handleWatch}
      icon={<Icon source={isWatching ? HideMinor : ViewMinor} />}
    >
      {isWatching ? t("Unwatch") : t("Watch")}
    </Button>
  );
};

export default WatchButton;
