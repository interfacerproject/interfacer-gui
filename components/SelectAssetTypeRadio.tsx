import { gql, useQuery } from "@apollo/client";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import devLog from "../lib/devLog";
import BrRadio from "./brickroom/BrRadio";

const QUERY_VARIABLES = gql`
  query {
    instanceVariables {
      specs {
        specCurrency {
          id
        }
        specProjectDesign {
          id
        }
        specProjectProduct {
          id
        }
        specProjectService {
          id
        }
      }
      units {
        unitOne {
          id
        }
      }
    }
  }
`;

const SelectAssetTypeRadio = ({ setConformsTo }: { setConformsTo: (id: string) => void }) => {
  const [assetType, setAssetType] = useState("");
  const instanceVariables = useQuery(QUERY_VARIABLES).data?.instanceVariables;
  const { t } = useTranslation("createProjectProps");
  const onChange = (value: string) => {
    setAssetType(value);
    devLog(assetType);
    switch (value) {
      case t("projectType.array.0.value"):
        setConformsTo(instanceVariables?.specs?.specProjectDesign?.id);
        break;
      case t("projectType.array.1.value", { returnObjects: true }):
        setConformsTo(instanceVariables?.specs?.specProjectProduct?.id);
        break;
      case t("projectType.array.2.value", { returnObjects: true }):
        setConformsTo(instanceVariables?.specs?.specProjectService?.id);
        break;
    }
  };

  return (
    <BrRadio
      array={t("projectType.array", { returnObjects: true })}
      label={t("projectType.label")}
      hint={t("projectType.hint")}
      onChange={onChange}
      value={assetType}
    />
  );
};

export default SelectAssetTypeRadio;
