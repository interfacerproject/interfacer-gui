// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { useTranslation } from "next-i18next";
import { ChangeEvent } from "react";
// import AddContributors from "./AddContributors";
import BrInput from "./brickroom/BrInput";
import GeoCoderInput from "./GeoCoderInput";

//

export interface Contributor {
  id: string;
  name: string;
}

//

type TagsGeoContributorsProps = {
  setProjectTags: (tags: string[]) => void;
  setLocationName: (locationName: string) => void;
  handleCreateLocation: (location: any) => void;
  locationName: string;
  locationAddress: string;
  setContributors: (contributors: Array<Contributor>) => void;
  contributors: Array<Contributor>;
  projectTags: string[];
};

const TagsGeoContributors = ({
  setProjectTags,
  setLocationName,
  handleCreateLocation,
  locationName,
  setContributors,
  locationAddress,
  contributors,
  projectTags,
}: TagsGeoContributorsProps) => {
  const { t } = useTranslation("createProjectProps");
  return (
    <>
      {/* <TagsSelect
        label={t("Tags:")}
        hint={t("Press space to add a new tag")}
        canCreateTags
        onChange={setProjectTags}
        placeholder={t("chair laser-cutter open-source 3d-printing")}
        testID="tagsList"
        selectedTags={projectTags}
      /> */}
      <div className="grid grid-cols-2 gap-2">
        <BrInput
          name="Location Name"
          label={t("Location name:")}
          hint={t("Name of the location where the project can be found")}
          type="text"
          value={locationName}
          placeholder={t("E&#46g&#46 Hamburg Warehouse")}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationName(e.target.value)}
          testID="location.name"
        />
        <GeoCoderInput
          onSelect={handleCreateLocation}
          selectedAddress={locationAddress}
          label={t("Address:")}
          hint={t("Address of the project location")}
          placeholder={t("E&#46g&#46 Hamburg")}
          testID="location.address"
        />
      </div>
      {/* <AddContributors
        label={t("contributors.label")}
        hint={t("contributors.hint")}
        setContributors={c => setContributors(c)}
        contributors={contributors}
        testID="contributors"
      /> */}
    </>
  );
};

export default TagsGeoContributors;
