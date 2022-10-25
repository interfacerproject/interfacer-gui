import { useTranslation } from "next-i18next";
import { ChangeEvent } from "react";
import AddContributors from "./AddContributors";
import BrInput from "./brickroom/BrInput";
import GeoCoderInput from "./GeoCoderInput";
import SelectTags from "./SelectTags";

type TagsGeoContributorsProps = {
  setAssetTags: (tags: string[]) => void;
  setLocationName: (locationName: string) => void;
  handleCreateLocation: (location: any) => void;
  locationName: string;
  locationAddress: string;
  setContributors: (contributors: { id: string; name: string }[]) => void;
  contributors: { id: string; name: string }[];
  assetTags: string[];
};

const TagsGeoContributors = ({
  setAssetTags,
  setLocationName,
  handleCreateLocation,
  locationName,
  setContributors,
  locationAddress,
  contributors,
  assetTags,
}: TagsGeoContributorsProps) => {
  const { t } = useTranslation("createProjectProps");
  return (
    <>
      <SelectTags
        label={t("Tags:")}
        hint={t("Press space to add a new tag")}
        canCreateTags
        onChange={setAssetTags}
        placeholder={t("chair laser-cutter open-source 3d-printing")}
        testID="tagsList"
        selectedTags={assetTags}
      />
      <div className="grid grid-cols-2 gap-2">
        <BrInput
          name="Location Name"
          label={t("Location name:")}
          hint={t("Name of the location where the asset can be found")}
          value={locationName}
          placeholder={t("E&#46g&#46 Hamburg Warehouse")}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationName(e.target.value)}
          testID="location.name"
        />
        <GeoCoderInput
          onSelect={handleCreateLocation}
          selectedAddress={locationAddress}
          label={t("Address:")}
          hint={t("Address of the asset location")}
          placeholder={t("E&#46g&#46 Hamburg")}
          testID="location.address"
        />
      </div>
      <AddContributors
        label={t("Contributors:")}
        hint={t("Contributors must have an account")}
        setContributors={c => setContributors(c)}
        contributors={contributors}
        testID="contributors"
      />
    </>
  );
};

export default TagsGeoContributors;
