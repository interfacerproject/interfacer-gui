import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ReactElement, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import type { NextPageWithLayout } from "./_app";

// Partials
import ControlWindow from "../components/partials/create_asset/ControlWindow";
import CreateAssetForm from "../components/partials/create_asset/CreateAssetForm";

// Layout
import Layout from "../components/layout/CreateAssetLayout";

//

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "createProjectProps",
        "signInProps",
        "SideBarProps",
        "SideBarProps",
        "BrImageUploadProps",
      ])),
    },
  };
}

//

const CreateProject: NextPageWithLayout = () => {
  const { t } = useTranslation("createProjectProps");

  const { user, loading } = useAuth();
  const [logs, setLogs] = useState<Array<string>>([`info: user ${user?.ulid}`]);

  //

  return (
    <>
      {loading && <div>creating...</div>}

      {!loading && (
        <div className="mx-auto p-8 max-w-xl">
          {/* Heading */}
          <div>
            <h2 className="text-primary">{t("headline.title")} </h2>
            <p>{t("headline.description")}</p>
          </div>

          <CreateAssetForm
            onSubmit={data => {
              console.log(data);
            }}
          />
          <ControlWindow logs={logs} />
          {/* {createdAssetId ? (
        <Link href={createdAssetId}>
          <a className="btn btn-accent">{t("go to the asset")}</a>
        </Link> */}
        </div>
      )}
    </>
  );
};

//

CreateProject.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default CreateProject;

//

/* Questo sta a parte dopo */
// imagesFiles: [],

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

// const instanceVariables = useQuery(QUERY_VARIABLES(true)).data?.instanceVariables;
// const [createAsset, { data, error }] = useMutation(CREATE_ASSET);
// const [createLocation, { data: spatialThing }] = useMutation(CREATE_LOCATION);
// const [createProposal, { data: proposal }] = useMutation(CREATE_PROPOSAL);
// const [createIntent, { data: intent }] = useMutation(CREATE_INTENT);
// const [linkProposalAndIntent, { data: link }] = useMutation(LINK_PROPOSAL_AND_INTENT);

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

//   const QUERY_VARIABLES = gql`
//   query {
//     instanceVariables {
//       specs {
//         specCurrency {
//           id
//         }
//         specProjectDesign {
//           id
//         }
//         specProjectProduct {
//           id
//         }
//         specProjectService {
//           id
//         }
//       }
//       units {
//         unitOne {
//           id
//         }
//       }
//     }
//   }
// `;

// const SelectAssetTypeRadio = ({ setConformsTo }: { setConformsTo: (id: string) => void }) => {
//   const [assetType, setAssetType] = useState("");
//   const instanceVariables = useQuery(QUERY_VARIABLES).data?.instanceVariables;
//   const { t } = useTranslation("createProjectProps");
//   const onChange = (value: string) => {
//     setAssetType(value);
//     devLog(assetType);
//     switch (value) {
//       case t("projectType.array.0.value"):
//         setConformsTo(instanceVariables?.specs?.specProjectDesign?.id);
//         break;
//       case t("projectType.array.1.value", { returnObjects: true }):
//         setConformsTo(instanceVariables?.specs?.specProjectProduct?.id);
//         break;
//       case t("projectType.array.2.value", { returnObjects: true }):
//         setConformsTo(instanceVariables?.specs?.specProjectService?.id);
//         break;
//     }
//   };
