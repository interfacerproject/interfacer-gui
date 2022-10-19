import BrInput from "./brickroom/BrInput";
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import BrMdEditor from "./brickroom/BrMdEditor";
import BrRadio from "./brickroom/BrRadio";
import BrImageUpload from "./brickroom/BrImageUpload";
import GeoCoderInput from "./GeoCoderInput";
import AddContributors from "./AddContributors";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "next-i18next";
import { useMutation, useQuery } from "@apollo/client";
import devLog from "../lib/devLog";
import dayjs from "dayjs";
import SelectTags from "./SelectTags";
import {
  QUERY_VARIABLES,
  CREATE_PROPOSAL,
  CREATE_ASSET,
  CREATE_INTENT,
  LINK_PROPOSAL_AND_INTENT,
  CREATE_LOCATION,
} from "../lib/QueryAndMutation";
import { EconomicEventCreateParams } from "../lib/types";

type Image = {
  description: string;
  extension: string;
  hash: string;
  mimeType: string;
  name: string;
  signature: any;
  size: number;
};
type Images = Array<Image>;

type NewAssetFormProps = {
  logs: Array<string>;
  setLogs: Dispatch<SetStateAction<Array<string>>>;
};

const NewAssetForm = ({ logs, setLogs }: NewAssetFormProps) => {
  const { user } = useAuth();
  const [projectType, setAssetType] = useState("");
  const [projectName, setAssetName] = useState("");
  const [projectDescription, setAssetDescription] = useState("");
  const [repositoryOrId, setRepositoryOrId] = useState("");
  const [assetTags, setAssetTags] = useState([] as string[]);
  const [locationId, setLocationId] = useState("");
  const [location, setLocation] = useState({} as any);
  const [locationName, setLocationName] = useState("");
  const [price] = useState("1");
  const [resourceSpec, setResourceSpec] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [images, setImages] = useState([] as Images);
  const [contributors, setContributors] = useState([] as { id: string; name: string }[]);
  const [imagesFiles, setImagesFiles] = useState([] as Array<any>);
  const [assetCreatedId, setAssetCreatedId] = useState(undefined as string | undefined);
  const { t } = useTranslation("createProjectProps");

  const isButtonEnabled = () => {
    return (
      resourceSpec.length > 0 &&
      projectName.length > 0 &&
      projectDescription.length > 0 &&
      repositoryOrId.length > 0 &&
      locationId.length > 0 &&
      price.length > 0
    );
  };

  useEffect(() => {
    isButtonEnabled()
      ? setLogs(logs.concat(["info: mandatory fields compiled"]))
      : setLogs(logs.concat(["warning: compile all mandatory fields"]));
    switch (projectType) {
      case "Design":
        setResourceSpec(instanceVariables?.specs?.specProjectDesign.id);
        break;
      case "Service":
        setResourceSpec(instanceVariables?.specs?.specProjectService.id);
        break;
      case "Product":
        setResourceSpec(instanceVariables?.specs?.specProjectProduct.id);
        break;
    }
    devLog("typeId", resourceSpec);
  }, [projectType, projectName, projectDescription, repositoryOrId, locationId, locationName, price]);

  const colors = ["error", "success", "warning", "info"];
  const logsClass = (text: string) =>
    colors.includes(text.split(":")[0]) ? `text-${text.split(":")[0]} uppercase my-3` : "my-2";

  const handleEditorChange = ({ html, text }: any) => {
    devLog("handleEditorChange", html, text);
    setAssetDescription(text);
  };

  const instanceVariables = useQuery(QUERY_VARIABLES(true)).data?.instanceVariables;
  const [createAsset, { data, error }] = useMutation(CREATE_ASSET("raise"));
  const [createLocation, { data: spatialThing }] = useMutation(CREATE_LOCATION);
  const [createProposal, { data: proposal }] = useMutation(CREATE_PROPOSAL);
  const [createIntent, { data: intent }] = useMutation(CREATE_INTENT);
  const [linkProposalAndIntent, { data: link }] = useMutation(LINK_PROPOSAL_AND_INTENT);

  const handleCreateLocation = async (loc: any) => {
    devLog("handleCreateLocation", loc);
    setLocation(loc);
    const name = locationName === "" ? "*untitled*" : locationName;
    await createLocation({
      variables: {
        name: name,
        addr: loc.address.label,
        lat: loc.lat,
        lng: loc.lng,
      },
    })
      .then(r => {
        setLocationId(r.data.createSpatialThing.spatialThing.id);
        setLogs(
          logs
            .concat(["info: location created"])
            .concat([`    id: ${r.data.createSpatialThing.spatialThing.id}`])
            .concat([`    latitude: ${r.data.createSpatialThing.spatialThing.lat}`])
            .concat([`    longitude: ${r.data.createSpatialThing.spatialThing.long}`])
        );
      })
      .catch(e => {
        setLogs(logs.concat(["error: location creation failed"]).concat([e.message]));
      });
  };

  async function onSubmit(e: any) {
    e.preventDefault();
    const variables = {
      resourceSpec: resourceSpec,
      agent: user?.ulid,
      name: projectName,
      note: `description: ${projectDescription}, repositoryOrId: ${repositoryOrId}`,
      metadata: JSON.stringify({ repositoryOrId: repositoryOrId, contributors: contributors }),
      location: locationId,
      oneUnit: instanceVariables?.units?.unitOne.id,
      creationTime: dayjs().toISOString(),
      images: images,
      tags: assetTags?.map(t => encodeURI(t)),
    };
    let logsText = logs.concat("info:Creating raise resource economicEvent").concat(JSON.stringify(variables, null, 2));

    const asset = await createAsset({
      variables: variables,
    })
      .catch(error => {
        logsText = logsText.concat("error:".concat(error.message));
        setLogs(logsText);
      })
      .then((re: any) => {
        logsText = logsText.concat(
          logsText.concat([
            `success: Resource with id ${re?.data.createEconomicEvent.economicEvent.resourceInventoriedAs.id} created`,
          ])
        );
        setLogs(logsText);
        setResourceId(re?.data?.createEconomicEvent.economicEvent.resourceInventoriedAs.id);
        logsText = logsText.concat([
          `success: Created resource inventoried with iD: ${re?.data?.createEconomicEvent.economicEvent.resourceInventoriedAs.id}`,
          "info: Creating proposal",
        ]);
        setLogs(logsText);
        devLog("2", re?.data?.createEconomicEvent.economicEvent.resourceInventoriedAs.id);
        return re?.data;
      });

    images.forEach((i, index) => {
      logsText = logsText.concat(`info:Uploading image ${index + 1} of ${images.length}`);
      setLogs(logsText);
      const filesArray = new FormData();
      filesArray.append(i.hash, imagesFiles[index]);
      fetch(process.env.NEXT_PUBLIC_ZENFLOWS_FILE_URL!, {
        method: "post",
        body: filesArray,
      })
        .catch(error => {
          logsText = logsText.concat([`error:${error}`]);
          setLogs(logsText);
        })
        .then((r: any) => {
          devLog("image upload response", r);
        });
    });

    const proposal = await createProposal().then(proposal => {
      logsText = logsText.concat([
        `success: Created proposal with id: ${proposal.data?.createProposal.proposal.id}`,
        "info: Creating intents",
      ]);
      setLogs(logsText);
      devLog("3", proposal);
      return proposal.data;
    });

    const intent = await createIntent({
      variables: {
        agent: user?.ulid,
        resource: asset?.createEconomicEvent.economicEvent.resourceInventoriedAs.id,
        oneUnit: instanceVariables?.units.unitOne.id,
        howMuch: parseFloat(price),
        currency: instanceVariables?.specs.specCurrency.id,
      },
    }).then(intent => {
      logsText = logsText.concat([
        `success: Created intent with id: ${intent.data?.item.intent.id}`,
        "info: Linking proposal and intent",
      ]);
      setLogs(logsText);
      devLog("4", intent);
      return intent.data;
    });

    linkProposalAndIntent({
      variables: {
        proposal: proposal?.createProposal.proposal.id,
        item: intent?.item.intent.id,
        payment: intent?.payment.intent.id,
      },
    }).then(() => {
      logsText = logsText.concat(["success: Asset succesfull created!!!"]);
      setLogs(logsText);
      setAssetCreatedId(`/asset/${proposal?.createProposal.proposal.id}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <BrInput
        label={t("projectName.label")}
        hint={t("projectName.hint")}
        value={projectName}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setAssetName(e.target.value)}
        placeholder={t("projectName.placeholder")}
        testID="projectName"
      />
      <BrMdEditor
        onChange={handleEditorChange}
        className="my-2"
        editorClass="h-60"
        label={t("projectDescription.label")}
        hint={t("projectDescription.hint")}
        testID="projectDescription"
      />
      <BrRadio
        array={t("projectType.array", { returnObjects: true })}
        label={t("projectType.label")}
        hint={t("projectType.hint")}
        onChange={setAssetType}
        value={projectType}
        testID="projectType"
      />
      <BrImageUpload
        onChange={setImages}
        setImagesFiles={setImagesFiles}
        label={t("imageUpload.label")}
        placeholder={t("imageUpload.placeholder")}
        value={imagesFiles}
        hint={t("imageUpload.hint")}
        testID="imageUpload"
        clickToUpload={t("imageUpload.clickToUpload")}
      />
      <BrInput
        label={t("repositoryOrId.label")}
        hint={t("repositoryOrId.hint")}
        value={repositoryOrId}
        placeholder={t("repositoryOrId.placeholder")}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setRepositoryOrId(e.target.value)}
        testID="repositoryOrId"
      />
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
      {assetCreatedId ? (
        <Link href={assetCreatedId}>
          <a className="btn btn-accent">{t("go to the asset")}</a>
        </Link>
      ) : (
        <button type="submit" className="btn btn-accent" disabled={!isButtonEnabled()} data-test="submit">
          {t("button")}
        </button>
      )}
    </form>
  );
};

export default NewAssetForm;
