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
        label={t("projectTags.label")}
        hint={t("projectTags.hint")}
        canCreateTags
        onChange={setAssetTags}
        placeholder={t("projectTags.placeholder")}
        testID="tagsList"
        selectedTags={assetTags}
      />
      <div className="grid grid-cols-2 gap-2">
        <BrInput
          type="text"
          name="location"
          label={t("location.name.label")}
          hint={t("location.name.hint")}
          value={locationName}
          placeholder={t("location.name.placeholder")}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationName(e.target.value)}
          testID="location.name"
        />
        <GeoCoderInput
          onSelect={handleCreateLocation}
          selectedAddress={locationAddress}
          label={t("location.address.label")}
          hint={t("location.address.hint")}
          placeholder={t("location.address.placeholder")}
          testID="location.address"
        />
      </div>
      <AddContributors
        label={t("contributors.label")}
        hint={t("contributors.hint")}
        setContributors={c => setContributors(c)}
        contributors={contributors}
        testID="contributors"
      />
    </>
  );
};

export default TagsGeoContributors;
