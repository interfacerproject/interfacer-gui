import { Button, Icon } from "@bbtgnn/polaris-interfacer";
import { PlusMinor } from "@shopify/polaris-icons";
import useStorage from "hooks/useStorage";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

export interface AddToListButtonProps {
  project: EconomicResource;
}

export default function AddToListButton({ project }: AddToListButtonProps) {
  const { setItem, getItem } = useStorage();
  const { t } = useTranslation();
  const [inList, setInList] = useState<boolean>(false);

  useEffect(() => {
    const _list = getItem("projectsCollected");
    const _listParsed = _list ? JSON.parse(_list) : [];
    setInList(_listParsed.includes(project?.id));
  }, [project, getItem]);

  const handleCollect = () => {
    const _list = getItem("projectsCollected");
    const _listParsed = _list ? JSON.parse(_list) : [];
    if (_listParsed.includes(project!.id)) {
      setItem("projectsCollected", JSON.stringify(_listParsed.filter((a: string) => a !== project!.id)));
      setInList(false);
    } else {
      const _listParsedUpdated = [..._listParsed, project?.id];
      setItem("projectsCollected", JSON.stringify(_listParsedUpdated));
      setInList(true);
    }
  };
  return (
    <Button id="addToList" onClick={handleCollect} fullWidth icon={<Icon source={PlusMinor} />}>
      {inList ? t("Remove from list") : t("Add to list")}
    </Button>
  );
}
