// import dayjs from "dayjs";
// import devLog from "lib/devLog";
import {
  CREATE_ASSET,
  CREATE_INTENT,
  CREATE_LOCATION,
  CREATE_PROPOSAL,
  LINK_PROPOSAL_AND_INTENT,
  QUERY_VARIABLES,
} from "lib/QueryAndMutation";
import { Dispatch, SetStateAction } from "react";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

// Hooks
import { useMutation, useQuery } from "@apollo/client";
import { useAuth } from "hooks/useAuth";
import { useTranslation } from "next-i18next";

// Components
import BrImageUpload from "components/brickroom/BrImageUpload";
import BrInput from "components/brickroom/BrInput";
import BrMdEditor from "components/brickroom/BrMdEditor";
import { Contributor } from "components/TagsGeoContributors";

//

export namespace CreateAssetNS {
  export interface Props {
    logs: Array<string>;
    setLogs: Dispatch<SetStateAction<Array<string>>>;
  }

  export interface FormValues {
    name: string;
    description: string;
    type: string;
    repositoryOrId: string;
    tags: Array<string>;
    locationId: string;
    location: string;
    locationName: string;
    price: string;
    resourceSpec: string;
    images: Array<File>;
    contributors: Array<Contributor>;
    // imagesFiles: Array<any>; // Forse non serve qui
  }
}

//

export default function NewAssetForm(props: CreateAssetNS.Props) {
  const { logs, setLogs } = props;
  const { user } = useAuth();
  const { t } = useTranslation("createProjectProps");

  const defaultValues: CreateAssetNS.FormValues = {
    name: "",
    description: "",
    type: "",
    repositoryOrId: "",
    tags: [],
    locationId: "",
    location: "",
    locationName: "",
    price: "1",
    resourceSpec: "",
    images: [], //as Array<File>
    contributors: [], // Array<{id:string, name:string}>
  };

  /* Questo sta a parte dopo */
  // imagesFiles: [],

  const schema = yup
    .object({
      name: yup.string().required(),
      description: yup.string().required(),
      type: yup.string().required(),
      repositoryOrId: yup.string().required(),
      tags: yup.array(yup.string()),
      locationId: yup.string().required(),
      location: yup.string().required(),
      locationName: yup.string().required(),
      price: yup.string().required(),
      resourceSpec: yup.string().required(),
      images: yup.array(yup.object()), // Array<File & {preview: string}>
      contributors: yup.array(
        yup.object({
          id: yup.string(),
          name: yup.string(),
        })
      ),
    })
    .required();

  const form = useForm<CreateAssetNS.FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { formState, handleSubmit, register, control, setValue, watch } = form;
  const { isValid, errors } = formState;

  function onSubmit(values: CreateAssetNS.FormValues) {
    console.log(values);
  }

  //

  // useEffect(() => {
  //   isButtonEnabled()
  //     ? setLogs(logs.concat(["info: mandatory fields compiled"]))
  //     : setLogs(logs.concat(["warning: compile all mandatory fields"]));
  //   switch (assetType) {
  //     case "Design":
  //       setResourceSpec(instanceVariables?.specs?.specProjectDesign.id);
  //       break;
  //     case "Service":
  //       setResourceSpec(instanceVariables?.specs?.specProjectService.id);
  //       break;
  //     case "Product":
  //       setResourceSpec(instanceVariables?.specs?.specProjectProduct.id);
  //       break;
  //   }
  //   devLog("typeId", resourceSpec);
  // }, [assetType, assetName, assetDescription, repositoryOrId, locationId, locationName, price]);

  const instanceVariables = useQuery(QUERY_VARIABLES(true)).data?.instanceVariables;
  const [createAsset, { data, error }] = useMutation(CREATE_ASSET);
  const [createLocation, { data: spatialThing }] = useMutation(CREATE_LOCATION);
  const [createProposal, { data: proposal }] = useMutation(CREATE_PROPOSAL);
  const [createIntent, { data: intent }] = useMutation(CREATE_INTENT);
  const [linkProposalAndIntent, { data: link }] = useMutation(LINK_PROPOSAL_AND_INTENT);

  // const handleCreateLocation = async (loc?: any) => {
  //   devLog("handleCreateLocation", loc);

  //   const name = locationName === "" ? "*untitled*" : locationName;
  //   if (loc) {
  //     setLocation(loc.address.label);
  //     createLocation({
  //       variables: {
  //         name: name,
  //         addr: loc.address.label,
  //         lat: loc.lat,
  //         lng: loc.lng,
  //       },
  //     })
  //       .then(r => {
  //         setLocationId(r.data.createSpatialThing.spatialThing.id);
  //         setLogs(
  //           logs
  //             .concat(["info: location created"])
  //             .concat([`    id: ${r.data.createSpatialThing.spatialThing.id}`])
  //             .concat([`    latitude: ${r.data.createSpatialThing.spatialThing.lat}`])
  //             .concat([`    longitude: ${r.data.createSpatialThing.spatialThing.long}`])
  //         );
  //       })
  //       .catch(e => {
  //         setLogs(logs.concat(["error: location creation failed"]).concat([e.message]));
  //       });
  //   } else {
  //     setLocationId("");
  //     setLocation("");
  //     setLogs(logs.concat(["info: no location provided"]));
  //   }
  // };

  // async function onSubmit(e: any) {
  //   e.preventDefault();
  //   const variables = {
  //     resourceSpec: resourceSpec,
  //     agent: user?.ulid,
  //     name: assetName,
  //     note: assetDescription,
  //     metadata: JSON.stringify({ repositoryOrId: repositoryOrId, contributors: contributors }),
  //     location: locationId,
  //     oneUnit: instanceVariables?.units?.unitOne.id,
  //     creationTime: dayjs().toISOString(),
  //     images: images,
  //     tags: assetTags?.map(t => encodeURI(t)),
  //   };
  //   let logsText = logs.concat("info:Creating raise resource economicEvent").concat(JSON.stringify(variables, null, 2));

  //   const asset = await createAsset({
  //     variables: variables,
  //   })
  //     .catch(error => {
  //       logsText = logsText.concat("error:".concat(error.message));
  //       setLogs(logsText);
  //     })
  //     .then((re: any) => {
  //       logsText = logsText.concat(
  //         logsText.concat([
  //           `success: Resource with id ${re?.data.createEconomicEvent.economicEvent.resourceInventoriedAs.id} created`,
  //         ])
  //       );
  //       setLogs(logsText);
  //       logsText = logsText.concat([
  //         `success: Created resource inventoried with iD: ${re?.data?.createEconomicEvent.economicEvent.resourceInventoriedAs.id}`,
  //         "info: Creating proposal",
  //       ]);
  //       setLogs(logsText);
  //       devLog("2", re?.data?.createEconomicEvent.economicEvent.resourceInventoriedAs.id);
  //       return re?.data;
  //     });

  //   images.forEach((i, index) => {
  //     logsText = logsText.concat(`info:Uploading image ${index + 1} of ${images.length}`);
  //     setLogs(logsText);
  //     const filesArray = new FormData();
  //     filesArray.append(i.hash, imagesFiles[index]);
  //     fetch(process.env.NEXT_PUBLIC_ZENFLOWS_FILE_URL!, {
  //       method: "post",
  //       body: filesArray,
  //     })
  //       .catch(error => {
  //         logsText = logsText.concat([`error:${error}`]);
  //         setLogs(logsText);
  //       })
  //       .then((r: any) => {
  //         devLog("image upload response", r);
  //       });
  //   });

  //   const proposal = await createProposal().then(proposal => {
  //     logsText = logsText.concat([
  //       `success: Created proposal with id: ${proposal.data?.createProposal.proposal.id}`,
  //       "info: Creating intents",
  //     ]);
  //     setLogs(logsText);
  //     devLog("3", proposal);
  //     return proposal.data;
  //   });

  //   const intent = await createIntent({
  //     variables: {
  //       agent: user?.ulid,
  //       resource: asset?.createEconomicEvent.economicEvent.resourceInventoriedAs.id,
  //       oneUnit: instanceVariables?.units.unitOne.id,
  //       howMuch: parseFloat(price),
  //       currency: instanceVariables?.specs.specCurrency.id,
  //     },
  //   }).then(intent => {
  //     logsText = logsText.concat([
  //       `success: Created intent with id: ${intent.data?.item.intent.id}`,
  //       "info: Linking proposal and intent",
  //     ]);
  //     setLogs(logsText);
  //     devLog("4", intent);
  //     return intent.data;
  //   });

  //   linkProposalAndIntent({
  //     variables: {
  //       proposal: proposal?.createProposal.proposal.id,
  //       item: intent?.item.intent.id,
  //       payment: intent?.payment.intent.id,
  //     },
  //   }).then(() => {
  //     logsText = logsText.concat(["success: Asset succesfull created!!!"]);
  //     setLogs(logsText);
  //     setAssetCreatedId(`/asset/${proposal?.createProposal.proposal.id}`);
  //   });
  // }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full pt-12 space-y-12">
      <BrInput
        {...register("name")}
        label={t("projectName.label")}
        hint={t("projectName.hint")}
        placeholder={t("projectName.placeholder")}
        testID="projectName"
        error={errors.name?.message}
      />

      <BrMdEditor
        name="description"
        editorClass="h-60"
        label={t("projectDescription.label")}
        hint={t("projectDescription.hint")}
        testID="projectDescription"
        subtitle={t("projectDescription.md-editor-explainer")}
        onChange={({ text, html }) => {
          setValue("description", text);
        }}
        error={errors.description?.message}
      />

      <BrImageUpload
        {...register("images")}
        label={t("imageUpload.label")}
        hint={t("imageUpload.hint")}
        testID="imageUpload"
        onDrop={acceptedFiles => {
          console.log(acceptedFiles);
          setValue("images", acceptedFiles);
        }}
      />

      <BrInput
        {...register("repositoryOrId")}
        name="repositoryOrId"
        label={t("repositoryOrId.label")}
        hint={t("repositoryOrId.hint")}
        placeholder={t("repositoryOrId.placeholder")}
        testID="repositoryOrId"
      />

      {/* <BrRadio
        array={t("projectType.array", { returnObjects: true })}
        label={t("projectType.label")}
        hint={t("projectType.hint")}
        onChange={setAssetType}
        value={assetType}
        testID="projectType"
      /> */}

      <pre>{JSON.stringify(watch(), null, 2)}</pre>

      {/* 
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
      {createdAssetId ? (
        <Link href={createdAssetId}>
          <a className="btn btn-accent">{t("go to the asset")}</a>
        </Link>
      ) : (
      )} */}
      <button type="submit" className="btn btn-accent" disabled={!isValid} data-test="submit">
        {t("button")}
      </button>
    </form>
  );
}
