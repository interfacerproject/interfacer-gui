import { useMutation, useQuery } from "@apollo/client";
import dayjs from "dayjs";
import {
  CREATE_ASSET,
  CREATE_INTENT,
  CREATE_LOCATION,
  CREATE_PROPOSAL,
  LINK_PROPOSAL_AND_INTENT,
  QUERY_VARIABLES,
} from "lib/QueryAndMutation";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import devLog from "../lib/devLog";
import BrImageUpload from "./brickroom/BrImageUpload";
import BrInput from "./brickroom/BrInput";
import BrMdEditor from "./brickroom/BrMdEditor";
import BrRadio from "./brickroom/BrRadio";
import TagsGeoContributors from "./TagsGeoContributors";
import { EconomicEvent, Intent, Proposal, Unnamed_5_Mutation } from "../lib/types";

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
  const [location, setLocation] = useState("");
  const [locationName, setLocationName] = useState("");
  const [price] = useState("1");
  const [resourceSpec, setResourceSpec] = useState("");
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

  const handleEditorChange = ({ html, text }: any) => {
    devLog("handleEditorChange", html, text);
    setAssetDescription(text);
  };

  const instanceVariables = useQuery(QUERY_VARIABLES(true)).data?.instanceVariables;
  const [createAsset, { data, error }] = useMutation(CREATE_ASSET);
  const [createLocation, { data: spatialThing }] = useMutation(CREATE_LOCATION);
  const [createProposal, { data: proposal }] = useMutation(CREATE_PROPOSAL);
  const [createIntent, { data: intent }] = useMutation(CREATE_INTENT);
  const [linkProposalAndIntent, { data: link }] = useMutation(LINK_PROPOSAL_AND_INTENT);

  const handleCreateLocation = async (loc?: any) => {
    devLog("handleCreateLocation", loc);

    const name = locationName === "" ? "*untitled*" : locationName;
    if (loc) {
      setLocation(loc.address.label);
      createLocation({
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
    } else {
      setLocationId("");
      setLocation("");
      setLogs(logs.concat(["info: no location provided"]));
    }
  };

  async function onSubmit(e: any) {
    e.preventDefault();
    const variables = {
      resourceSpec: resourceSpec,
      agent: user?.ulid,
      name: projectName,
      note: projectDescription,
      metadata: JSON.stringify({ repositoryOrId: repositoryOrId, contributors: contributors }),
      location: locationId,
      oneUnit: instanceVariables?.units?.unitOne.id,
      creationTime: dayjs().toISOString(),
      images: images,
      tags: assetTags?.map(t => encodeURI(t)),
    };
    let logsText = logs.concat("info:Creating raise resource economicEvent").concat(JSON.stringify(variables, null, 2));

    const economicEvent: EconomicEvent | string = await createAsset({
      variables: variables,
    })
      .catch(error => {
        logsText = logsText.concat("error:".concat(error.message));
        setLogs(logsText);
        return "error";
      })
      .then((re: any) => {
        logsText = logsText.concat(
          logsText.concat([
            `success: Resource with id ${re?.data.createEconomicEvent.economicEvent.resourceInventoriedAs.id} created`,
          ])
        );
        setLogs(logsText);
        logsText = logsText.concat([
          `success: Created resource inventoried with iD: ${re?.data?.createEconomicEvent.economicEvent.resourceInventoriedAs.id}`,
          "info: Creating proposal",
        ]);
        setLogs(logsText);
        devLog("2", re?.data?.createEconomicEvent.economicEvent.resourceInventoriedAs.id);
        return re?.data.createEconomicEvent.economicEvent;
      });
    if (typeof economicEvent === "string") {
      return;
    } else {
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

      const proposal: Proposal = await createProposal().then(proposal => {
        logsText = logsText.concat([
          `success: Created proposal with id: ${proposal.data?.createProposal.proposal.id}`,
          "info: Creating intents",
        ]);
        setLogs(logsText);
        devLog("3", proposal);
        return proposal.data.createProposal.proposal;
      });

      const intent: { item: Intent; payment: Intent } = await createIntent({
        variables: {
          agent: user?.ulid,
          resource: economicEvent?.resourceInventoriedAs?.id,
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
        return { item: intent.data.item.intent, payment: intent.data.payment.intent };
      });

      linkProposalAndIntent({
        variables: {
          proposal: proposal?.id,
          item: intent?.item.id,
          payment: intent?.payment.id,
        },
      }).then(() => {
        logsText = logsText.concat(["success: Asset succesfull created!!!"]);
        setLogs(logsText);
        setAssetCreatedId(`/asset/${proposal?.id}`);
      });
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <BrInput
        name="projectName"
        label={t("Asset name")}
        hint={t("Working name of the asset, visible to the whole community")}
        value={projectName}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setAssetName(e.target.value)}
        placeholder={t("Fabulaser")}
        testID="projectName"
      />
      <BrMdEditor
        onChange={handleEditorChange}
        className="my-2"
        editorClass="h-60"
        label={t("General information")}
        hint={t("Short description to be displayed on the asset page")}
        testID="projectDescription"
        subTitle={t("in this markdown editor, the right box shows a preview; Type up to 2048 characters")}
      />
      <BrImageUpload
        onChange={setImages}
        setImagesFiles={setImagesFiles}
        label={t("Upload up to 10 pictures:")}
        placeholder={t("SVG, PNG, JPG or GIF (MAX 2MB)")}
        value={imagesFiles}
        hint={t("SVG, PNG, JPG or GIF (MAX 2MB)")}
        testID="imageUpload"
        clickToUpload={t("Click to upload")}
      />
      <BrInput
        name="repositoryOrId"
        label={t("Repository link or Interfacer ID:")}
        hint={t("Reference to the asset's repository or Interfacer ID of the asset")}
        value={repositoryOrId}
        placeholder={t("github&#46;com/my-repo")}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setRepositoryOrId(e.target.value)}
        testID="repositoryOrId"
      />
      <BrRadio
        array={[t("Design"), t("Service"), t("Product")]}
        label={t("Select asset type:")}
        hint={t("")}
        onChange={setAssetType}
        value={projectType}
        testID="projectType"
      />
      <TagsGeoContributors
        setAssetTags={setAssetTags}
        setLocationName={setLocationName}
        handleCreateLocation={handleCreateLocation}
        locationName={locationName}
        locationAddress={location}
        setContributors={setContributors}
        contributors={contributors}
        assetTags={assetTags}
      />
      {assetCreatedId ? (
        <Link href={assetCreatedId}>
          <a className="btn btn-accent">{t("Go to the asset")}</a>
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
