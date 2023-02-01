import { Button, Icon } from "@bbtgnn/polaris-interfacer";
import { StarFilledMinor, StarOutlineMinor } from "@shopify/polaris-icons";
import useSocial from "hooks/useSocial";
import useWallet from "hooks/useWallet";
import { IdeaPoints } from "lib/PointsDistribution";
import { useTranslation } from "next-i18next";

//

const AddStar = ({ id, owner }: { id: string; owner: string }) => {
  const { likeObject, isLiked } = useSocial();
  const hasAlreadyStarred = isLiked(id);
  const { t } = useTranslation("common");
  const { addIdeaPoints } = useWallet();
  const handleClick = async () => {
    await likeObject(id);

    //economic system: points assignments
    addIdeaPoints(owner, IdeaPoints.OnStar);
  };

  return (
    <Button
      id="likeButton"
      onClick={handleClick}
      fullWidth
      disabled={hasAlreadyStarred}
      size="large"
      icon={<Icon source={hasAlreadyStarred ? StarFilledMinor : StarOutlineMinor} />}
    >
      {`${hasAlreadyStarred ? t("You already star it!") : t("Star")}`}
    </Button>
  );
};

export default AddStar;
