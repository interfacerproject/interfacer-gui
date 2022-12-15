import devLog from "../lib/devLog";
import { useEffect, useState } from "react";
import Link from "next/link";
import MdParser from "../lib/MdParser";
import { useTranslation } from "next-i18next";

const Dpp = ({ dpp }: { dpp: JSON }) => {
  const [assets, setAssets] = useState<any[]>([]);
  const { t } = useTranslation("lastUpdatedProps");
  const findAsset = (level: any) => {
    devLog("level", level);
    if (!!level?.children[0]?.children[0]?.node?.accounting_quantity_has_numerical_value) {
      const _assets = level?.children?.map((child: any) => ({
        name: child?.children[0]?.node.name,
        id: child?.children[0]?.node.id,
        description: child?.children[0]?.node.note,
      }));
      setAssets(assets.concat(_assets));
    } else {
      for (let i = 0; i < level?.children?.length; i++) {
        findAsset(level.children[i]);
      }
    }
  };
  useEffect(() => {
    findAsset(dpp);
  }, [dpp]);
  devLog("assets", assets);
  return (
    <div className="w-full mt-2">
      <div className="font-bold text-xl mb-2">{t("Included or cited assets")}</div>
      {assets.map(asset => (
        <div key={asset.id} className="flex flex-column mt-2 border-b-2">
          <Link href={`/asset/${asset.id}`}>
            <a>
              <div className="flex flex-row">
                <div className="flex">
                  <b>{asset.name}</b>
                </div>
                <div className="flex-grow pl-2">
                  {asset.description! && (
                    <span dangerouslySetInnerHTML={{ __html: MdParser.render(asset.description!) }} />
                  )}
                </div>
              </div>
            </a>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Dpp;
