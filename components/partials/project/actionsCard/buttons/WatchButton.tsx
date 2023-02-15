import useSocial from "hooks/useSocial";
import useWallet from "hooks/useWallet";
import { IdeaPoints } from "lib/PointsDistribution";
import { useTranslation } from "next-i18next";

// Components
import { Button, Icon } from "@bbtgnn/polaris-interfacer";
import { HideMinor, ViewMinor } from "@shopify/polaris-icons";

//

export interface WatchButtonProps {
  id: string;
  owner: string;
}

export default function WatchButton(props: WatchButtonProps) {
  const { id, owner } = props;
  const { followActivity, isWatched, erFollowerLength } = useSocial(id);
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
      onClick={handleWatch}
      disabled={watched}
      icon={<Icon source={watched ? HideMinor : ViewMinor} />}
    >
      {t("Watch")!} {"(" + erFollowerLength + ")"}
    </Button>
  );
}
