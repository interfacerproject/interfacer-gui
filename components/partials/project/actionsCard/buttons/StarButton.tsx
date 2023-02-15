import useSocial from "hooks/useSocial";
import useWallet from "hooks/useWallet";
import { IdeaPoints } from "lib/PointsDistribution";
import { useTranslation } from "next-i18next";

// Components
import { Button, Icon } from "@bbtgnn/polaris-interfacer";
import { StarFilledMinor, StarOutlineMinor } from "@shopify/polaris-icons";

//

export interface StarButtonProps {
  id: string;
  owner: string;
}

export default function StarButton(props: StarButtonProps) {
  const { id, owner } = props;
  const { likeER, isLiked } = useSocial(id);
  const hasAlreadyStarred = isLiked(id);
  const { t } = useTranslation("common");
  const { addIdeaPoints } = useWallet();
  const handleClick = async () => {
    await likeER();
    //economic system: points assignments
    addIdeaPoints(owner, IdeaPoints.OnStar);
  };

  return (
    <Button
      id="likeButton"
      onClick={handleClick}
      fullWidth
      disabled={hasAlreadyStarred}
      icon={<Icon source={hasAlreadyStarred ? StarFilledMinor : StarOutlineMinor} />}
    >
      {`${hasAlreadyStarred ? t("You already star it!") : t("Star")}`}
    </Button>
  );
}
