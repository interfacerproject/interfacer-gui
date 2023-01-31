import { useMutation } from "@apollo/client";
import { Button, Icon } from "@bbtgnn/polaris-interfacer";
import { HideMinor, ViewMinor } from "@shopify/polaris-icons";
import useWallet from "hooks/useWallet";
import { IdeaPoints } from "lib/PointsDistribution";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { UPDATE_METADATA } from "../lib/QueryAndMutation";

const WatchButton = ({ id, metadata, owner }: { id: string; metadata: any; owner: string }) => {
  const { user } = useAuth();
  const [isWatching, setIsWatching] = useState<boolean>(metadata?.watchers?.includes(user?.ulid));
  const [updateEconomicResource] = useMutation(UPDATE_METADATA);
  const { t } = useTranslation("common");
  const { addIdeaPoints } = useWallet();
  const handleWatch = async () => {
    const _metadata = {
      ...metadata,
      watchers: metadata.watchers ? [...metadata.watchers, user!.ulid] : [user!.ulid],
    };
    await updateEconomicResource({ variables: { metadata: JSON.stringify(_metadata), id: id } }).then(r => {
      setIsWatching(true);
    });

    //economic system: points assignments
    addIdeaPoints(owner, IdeaPoints.OnWatch);
  };
  const handleUnwatch = async () => {
    const _metadata = {
      ...metadata,
      watchers: metadata.watchers?.filter((w: any) => w !== user!.ulid),
    };
    await updateEconomicResource({ variables: { metadata: JSON.stringify(_metadata), id: id } }).then(r => {
      setIsWatching(false);
    });

    //economic system: points assignments
    addIdeaPoints(owner, -IdeaPoints.OnWatch);
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
