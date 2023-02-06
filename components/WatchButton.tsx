import { Button, Icon } from "@bbtgnn/polaris-interfacer";
import { HideMinor, ViewMinor } from "@shopify/polaris-icons";
import useSocial from "hooks/useSocial";
import useWallet from "hooks/useWallet";
import { IdeaPoints } from "lib/PointsDistribution";
import { useTranslation } from "next-i18next";

const WatchButton = ({ id, owner }: { id: string; owner: string }) => {
  const { followActivity, isWatched } = useSocial(id);
  const { t } = useTranslation("common");
  const { addIdeaPoints } = useWallet();
  const watched = isWatched();
  const handleWatch = async () => {
    followActivity();
    //economic system: points assignments
    addIdeaPoints(owner, IdeaPoints.OnWatch);
  };

  return (
    <Button
      id="addToWatch"
      fullWidth
      size="large"
      onClick={handleWatch}
      disabled={watched}
      icon={<Icon source={watched ? HideMinor : ViewMinor} />}
    >
      {t("Watch")}
    </Button>
  );
};

export default WatchButton;
