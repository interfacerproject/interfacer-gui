import useStorage from "hooks/useStorage";

type HandleCollectProps = {
  asset: string;
  setInList: (inList: boolean) => void;
};

const HandleCollect = ({ asset, setInList }: HandleCollectProps) => {
  const { getItem, setItem } = useStorage();
  const _list = getItem("assetsCollected");
  const _listParsed = _list ? JSON.parse(_list) : [];
  if (_listParsed.includes(asset)) {
    setItem("assetsCollected", JSON.stringify(_listParsed.filter((a: string) => a !== asset)));
    setInList(false);
  } else {
    const _listParsedUpdated = [..._listParsed, asset];
    setItem("assetsCollected", JSON.stringify(_listParsedUpdated));
    setInList(true);
  }
};

export default HandleCollect;
