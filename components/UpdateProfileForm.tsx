import { useAuth } from "../hooks/useAuth";
import { gql, useMutation } from "@apollo/client";
import { ChangeEvent, useState } from "react";
import BrInput from "./brickroom/BrInput";
import BrTextField from "./brickroom/BrTextField";
import { useTranslation } from "next-i18next";
import GeoCoderInput from "./GeoCoderInput";
import devLog from "../lib/devLog";
import { CREATE_LOCATION } from "../lib/QueryAndMutation";

const UPDATE_USER = gql(`mutation ($name: String, $id: ID!, $note:String, $primaryLocation: ID, $user: String) {
    updatePerson(person: { id: $id, name:$name, note: $note, primaryLocation: $primaryLocation, user: $user}) {
      agent {
        id
        name
        note
        primaryLocation{
          id
          lat
          long
          name
        }
      }
    }
  }
  `);

const UpdateProfileForm = () => {
  const { user } = useAuth();
  const { t } = useTranslation("ProfileProps");
  const [name, setName] = useState(user?.name || "");
  const [note, setNote] = useState("");
  const [username, setUsername] = useState(user?.username || "");
  const [locationName, setLocationName] = useState("untitled");
  const [locationAddress, setLocationAddress] = useState("");
  const [locationId, setLocationId] = useState("");

  const [createLocation, { data: spatialThing }] = useMutation(CREATE_LOCATION);

  const [updateUser] = useMutation(UPDATE_USER, {
    variables: {
      id: user?.ulid,
      name,
      note,
      primaryLocation: locationId,
      user: username,
    },
  });
  const handleCreateLocation = async (loc?: any) => {
    devLog("handleCreateLocation", loc);

    const name = locationName === "" ? "*untitled*" : locationName;
    if (loc) {
      setLocationAddress(loc.address.label);
      createLocation({
        variables: {
          name: locationName,
          addr: loc.address.label,
          lat: loc.lat,
          lng: loc.lng,
        },
      })
        .then(r => {
          setLocationId(r.data.createSpatialThing.spatialThing.id);
        })
        .catch(e => {});
    } else {
      setLocationId("");
      setLocationAddress("");
    }
  };

  return (
    <form className="max-w-screen-md">
      <div className="flex flex-col">
        <BrInput
          value={name}
          name="name"
          label="Name"
          onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        />
        <BrInput
          value={username}
          name="username"
          label="Username"
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <BrInput
            type="text"
            name="location"
            label={t("Location name")}
            hint={t("")}
            value={locationName}
            placeholder={t("Hamburg warehouse")}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationName(e.target.value)}
            testID="location.name"
          />
          <GeoCoderInput
            onSelect={handleCreateLocation}
            selectedAddress={locationAddress}
            label={t("Select Address")}
            hint={t("Start typing then select from the list")}
            placeholder={t("Hamburg")}
            testID="location.address"
          />
        </div>
        <BrTextField
          value={note}
          label="Note"
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNote(e.target.value)}
        />
      </div>
      <div className="flex flex-col items-end">
        <button className="btn btn-accent" onClick={() => updateUser}>
          {t("Update")}
        </button>
      </div>
    </form>
  );
};

export default UpdateProfileForm;
