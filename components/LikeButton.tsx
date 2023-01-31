import { Button, Icon } from "@bbtgnn/polaris-interfacer";
import { ThumbsDownMajor, ThumbsUpMajor } from "@shopify/polaris-icons";
import useSocial from "hooks/useSocial";
import { useTranslation } from "next-i18next";

//

const LikeButton = ({ id }: { id: string }) => {
  const { likeObject, isLiked } = useSocial();
  const hasAlreadyLiked = isLiked(id);
  const { t } = useTranslation("common");
  const handleClick = async () => {
    await likeObject(id);
  };

  return (
    <Button
      id="likeButton"
      onClick={handleClick}
      fullWidth
      disabled={hasAlreadyLiked}
      size="large"
      icon={<Icon source={hasAlreadyLiked ? ThumbsDownMajor : ThumbsUpMajor} />}
    >
      {`${hasAlreadyLiked ? t("Unlike") : t("Like")}`}
    </Button>
  );
};

export default LikeButton;
