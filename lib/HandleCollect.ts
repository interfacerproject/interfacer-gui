import useStorage from "hooks/useStorage";

type HandleCollectProps = {
  project: string;
  setInList: (inList: boolean) => void;
};

const HandleCollect = ({ project, setInList }: HandleCollectProps) => {
  const { getItem, setItem } = useStorage();
  const _list = getItem("projectsCollected");
  const _listParsed = _list ? JSON.parse(_list) : [];
  if (_listParsed.includes(project)) {
    setItem("projectsCollected", JSON.stringify(_listParsed.filter((a: string) => a !== project)));
    setInList(false);
  } else {
    const _listParsedUpdated = [..._listParsed, project];
    setItem("projectsCollected", JSON.stringify(_listParsedUpdated));
    setInList(true);
  }
};

export default HandleCollect;
