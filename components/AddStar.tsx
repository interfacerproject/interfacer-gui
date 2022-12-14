import { useMutation } from "@apollo/client";
import { useTranslation } from "next-i18next";
import { UPDATE_METADATA } from "../lib/QueryAndMutation";

// Components
import { Button, Icon } from "@bbtgnn/polaris-interfacer";
import { StarFilledMinor, StarOutlineMinor } from "@shopify/polaris-icons";

//

const AddStar = ({
  id,
  metadata,
  userId,
  onStarred,
  onDestarred,
}: {
  id: string;
  metadata: { starred?: string[] };
  userId?: string;
  onStarred?: () => void;
  onDestarred?: () => void;
}) => {
  const [updateEconomicResource] = useMutation(UPDATE_METADATA);
  const hasAlreadyStarred = metadata?.starred?.includes(userId!);
  const { t } = useTranslation("common");
  const disabled = !metadata;
  const handleClick = () => {
    if (!hasAlreadyStarred) {
      const _metadata = { ...metadata, starred: !!metadata?.starred ? [...metadata.starred!, userId] : [userId] };
      updateEconomicResource({ variables: { id: id, metadata: JSON.stringify(_metadata) } }).then(
        () => onDestarred && onDestarred()
      );
    } else {
      const _metadata = { ...metadata, starred: metadata.starred!.filter(star => star !== userId) };
      updateEconomicResource({ variables: { id: id, metadata: JSON.stringify(_metadata) } }).then(
        () => onStarred && onStarred()
      );
    }
  };
  return (
    <Button
      id="addStar"
      onClick={handleClick}
      disabled={disabled}
      fullWidth
      size="large"
      icon={<Icon source={hasAlreadyStarred ? StarFilledMinor : StarOutlineMinor} />}
    >
      {`${hasAlreadyStarred ? t("Unstar") : t("Star")} (${metadata?.starred?.length || 0})`}
    </Button>
  );
};

export default AddStar;
