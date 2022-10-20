import SelectTags from "./SelectTags";
import BrInput from "./brickroom/BrInput";
import { ChangeEvent } from "react";
import GeoCoderInput from "./GeoCoderInput";
import AddContributors from "./AddContributors";
import { useTranslation } from "next-i18next";
import BrRadio from "./brickroom/BrRadio";

type TypeTagsGeoContributorsProps = {
  setAssetTags: (tags: string[]) => void;
  setLocationName: (locationName: string) => void;
  handleCreateLocation: (location: any) => void;
  locationName: string;
  setContributors: (contributors: { id: string; name: string }[]) => void;
  contributors: { id: string; name: string }[];
};

const TagsGeoContributors = ({
  setAssetTags,
  setLocationName,
  handleCreateLocation,
  locationName,
  setContributors,
  contributors,
}: TypeTagsGeoContributorsProps) => {
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
      />
      <div className="grid grid-cols-2 gap-2">
        <BrInput
          label={t("location.name.label")}
          hint={t("location.name.hint")}
          value={locationName}
          placeholder={t("location.name.placeholder")}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationName(e.target.value)}
          testID="location.name"
        />
        <GeoCoderInput
          onSelect={handleCreateLocation}
          value={location}
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