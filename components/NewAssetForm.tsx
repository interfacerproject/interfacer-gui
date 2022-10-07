import BrInput from "./brickroom/BrInput";
import {ChangeEvent, Dispatch, SetStateAction, useEffect, useState} from "react";
import BrMdEditor from "./brickroom/BrMdEditor";
import BrRadio from "./brickroom/BrRadio";
import BrImageUpload from "./brickroom/BrImageUpload";
import TagSelector from "./brickroom/TagSelector";
import GeoCoderInput from "./GeoCoderInput";
import AddContributors from "./AddContributors";
import Link from "next/link";
import {useAuth} from "../lib/auth";
import {useTranslation} from "next-i18next";
import {gql, useMutation, useQuery} from "@apollo/client";
import devLog from "../lib/devLog";
import dayjs from "dayjs";
import SelectTags from "./SelectTags";
import SelectAssetTypeRadio from "./SelectAssetTypeRadio";

type Image = {
    description: string,
    extension: string,
    hash: string,
    mimeType: string,
    name: string,
    signature: any,
    size: number
}
type Images = Array<Image>

type NewAssetFormProps = {
    logs:Array<string>,
    setLogs:Dispatch<SetStateAction<Array<string>>>,
}

const NewAssetForm = ({logs, setLogs}:NewAssetFormProps) => {
    const {authId} = useAuth()
    const [projectName, setAssetName] = useState('')
    const [projectDescription, setAssetDescription] = useState('')
    const [repositoryOrId, setRepositoryOrId] = useState('')
    const [assetTags, setAssetTags] = useState([] as string[])
    const [locationId, setLocationId] = useState('')
    const [location, setLocation] = useState({} as any)
    const [locationName, setLocationName] = useState('')
    const [price, setPrice] = useState('')
    const [resourceSpec, setResourceSpec] = useState('')
    const [resourceId, setResourceId] = useState('')
    const [images, setImages] = useState([] as Images)
    const [contributors, setContributors] = useState([] as { value: string, label: string }[])
    const [imagesFiles, setImagesFiles] = useState([] as Array<any>)
    const [assetCreatedId, setAssetCreatedId] = useState(undefined as string | undefined)
    const {t} = useTranslation('createProjectProps')

    const isButtonEnabled = () => {
        return resourceSpec.length > 0 &&
            projectName.length > 0 &&
            projectDescription.length > 0 &&
            repositoryOrId.length > 0 &&
            locationId.length > 0 &&
            price.length > 0
    }
    useEffect(() => {
        isButtonEnabled() ?
            setLogs(logs.concat(['info: mandatory fields compiled'])) :
            setLogs(logs.concat(['warning: compile all mandatory fields']))
    }, [projectName, projectDescription, repositoryOrId, locationId, locationName, price, resourceSpec])

    const colors = ["error", "success", "warning", "info"];
    const logsClass = (text: string) => colors.includes(text.split(':')[0]) ?
        `text-${text.split(':')[0]} uppercase my-3` : 'my-2'
    const QUERY_VARIABLES = gql`query {
  instanceVariables{
    specs{
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
}`

    const CREATE_PROPOSAL = gql`
    mutation {
  createProposal(proposal: {
    name: "price tag",
    unitBased: true
  }) {
    proposal {
      id
    }
  }
}
`
    const CREATE_INTENT = gql`mutation (
  $agent: ID!,
  $resource: ID!,
  $oneUnit: ID!,
  $currency: ID!,
  $howMuch: Float!
) {
  item: createIntent(
    intent: {
      name: "project",
      action: "transfer",
      provider: $agent,
      resourceInventoriedAs: $resource,
      resourceQuantity: { hasNumericalValue: 1, hasUnit: $oneUnit }
    }
  ) {
    intent {
      id
    }
  }

  payment: createIntent(
    intent: {
      name: "payment",
      action: "transfer",
      receiver: $agent,
      resourceConformsTo: $currency,
      resourceQuantity: { hasNumericalValue: $howMuch, hasUnit: $oneUnit }
    }
  ) {
    intent {
      id
    }
  }
}
`

    const LINK_PROPOSAL_AND_INTENT = gql`mutation ($proposal: ID!, $item: ID!, $payment: ID!) {
  linkItem: proposeIntent(
    publishedIn: $proposal
    publishes: $item
    reciprocal: false
  ) {
    proposedIntent {
      id
    }
  }

  linkPayment: proposeIntent(
    publishedIn: $proposal
    publishes: $payment
    reciprocal: true
  ) {
    proposedIntent {
      id
    }
  }
}
`


    const CREATE_LOCATION = gql`mutation ($name: String!, $addr: String!, $lat: Float!, $lng: Float!) {
  createSpatialThing(spatialThing: { name: $name, mappableAddress: $addr, lat:$lat, long:$lng }) {
    spatialThing {
      id
      lat
      long
    }
  }
}
`

    const CREATE_ASSET = gql`mutation (
  $name: String!,
  $metadata: String!,
  $agent: ID!,
  $creationTime: DateTime!,
  $location: ID!,
  $tags: [URI!],
  $resourceSpec: ID!,
  $oneUnit: ID!,
  $images: [IFile!]
) {
  createEconomicEvent(
    event: {
      action: "raise",
      provider: $agent,
      receiver: $agent,
      hasPointInTime: $creationTime,
      resourceClassifiedAs: $tags,
      resourceConformsTo: $resourceSpec,
      resourceQuantity: { hasNumericalValue: 1, hasUnit: $oneUnit },
      toLocation: $location
    }
    newInventoriedResource: { name: $name, note: $metadata, images: $images }
  ) {
    economicEvent {
      id
      resourceInventoriedAs {
        id
      }
    }
  }
}
`
    const handleEditorChange = ({html, text}: any) => {
        devLog('handleEditorChange', html, text);
        setAssetDescription(text)
    }

    const instanceVariables = useQuery(QUERY_VARIABLES).data?.instanceVariables

    const [createAsset, {data, error}] = useMutation(CREATE_ASSET)

    const [createLocation, {data: spatialThing}] = useMutation(CREATE_LOCATION)

    const [createProposal, {data: proposal}] = useMutation(CREATE_PROPOSAL)

    const [createIntent, {data: intent}] = useMutation(CREATE_INTENT)

    const [linkProposalAndIntent, {data: link}] = useMutation(LINK_PROPOSAL_AND_INTENT)

    const handleCreateLocation = async (loc: any) => {
        devLog('handleCreateLocation', loc)
        setLocation(loc)
        const name = locationName === '' ? '*untitled*' : locationName
        await createLocation({
            variables: {
                name: name,
                addr: loc.address.label,
                lat: loc.lat,
                lng: loc.lng
            }
        }).then((r) => {
            setLocationId(r.data.createSpatialThing.spatialThing.id)
            setLogs(logs.concat(['info: location created'])
                .concat([`    id: ${r.data.createSpatialThing.spatialThing.id}`])
                .concat([`    latitude: ${r.data.createSpatialThing.spatialThing.lat}`])
                .concat([`    longitude: ${r.data.createSpatialThing.spatialThing.long}`]))
        }).catch((e) => {
            setLogs(logs.concat(['error: location creation failed'])
                .concat([e.message]))
        })
    }

    async function onSubmit(e: any) {
        e.preventDefault()
        const variables = {
            resourceSpec: resourceSpec,
            agent: authId,
            name: projectName,
            metadata: `description: ${projectDescription}, repositoryOrId: ${repositoryOrId}`,
            location: locationId,
            oneUnit: instanceVariables?.units?.unitOne.id,
            creationTime: dayjs().toISOString(),
            images: images,
            tags: assetTags?.map((t) => encodeURI(t))
        }
        let logsText = logs.concat('info:Creating raise resource economicEvent').concat(JSON.stringify(variables, null, 2))

        const asset = await createAsset({
            variables: variables
        }).catch((error) => {
            logsText = logsText.concat('error:'.concat(error.message))
            setLogs(logsText)
        })
            .then((re: any) => {
                logsText = logsText.concat(logsText.concat([`success: Resource with id ${re?.data.createEconomicEvent.economicEvent.resourceInventoriedAs.id} created`]))
                setLogs(logsText)
                setResourceId(re?.data?.createEconomicEvent.economicEvent.resourceInventoriedAs.id)
                logsText = logsText.concat([`success: Created resource inventoried with iD: ${re?.data?.createEconomicEvent.economicEvent.resourceInventoriedAs.id}`, 'info: Creating proposal'])
                setLogs(logsText)
                devLog('2', re?.data?.createEconomicEvent.economicEvent.resourceInventoriedAs.id)
                return re?.data
            })

        images.forEach((i, index) => {
                    logsText = logsText.concat(`info:Uploading image ${index + 1} of ${images.length}`)
                    setLogs(logsText)
                    const filesArray = new FormData()
                    filesArray.append(i.hash, imagesFiles[index])
                    fetch(process.env.NEXT_PUBLIC_ZENFLOWS_FILE_URL!, {
                        method: "post",
                        body: filesArray,
                    }).catch((error) => {
                        logsText = logsText.concat([`error:${error}`])
                        setLogs(logsText)
                    }).then((r: any) => {
                        devLog('image upload response', r)
                    })
                })

        const proposal = await createProposal()
            .then((proposal) => {
                logsText = logsText.concat([`success: Created proposal with id: ${proposal.data?.createProposal.proposal.id}`, 'info: Creating intents'])
                setLogs(logsText)
                devLog('3', proposal)
                return proposal.data
            })

        const intent = await createIntent({
            variables: {
                agent: authId,
                resource: asset?.createEconomicEvent.economicEvent.resourceInventoriedAs.id,
                oneUnit: instanceVariables?.units.unitOne.id,
                howMuch: parseFloat(price),
                currency: instanceVariables?.specs.specCurrency.id
            }
        }).then((intent) => {
            logsText = logsText.concat([`success: Created intent with id: ${intent.data?.item.intent.id}`, 'info: Linking proposal and intent'])
            setLogs(logsText)
            devLog('4', intent)
            return intent.data
        })

        linkProposalAndIntent({
            variables: {
                proposal: proposal?.createProposal.proposal.id,
                item: intent?.item.intent.id,
                payment: intent?.payment.intent.id
            }
        }).then(() => {
            logsText = logsText.concat(['success: Asset succesfull created!!!'])
            setLogs(logsText)
            setAssetCreatedId(`/asset/${proposal?.createProposal.proposal.id}`)
        })
    }
    return (
        <form onSubmit={onSubmit} className="w-full">

                <BrInput label={t('projectName.label')} hint={t('projectName.hint')} value={projectName}
                         onChange={(e: ChangeEvent<HTMLInputElement>) => setAssetName(e.target.value)}
                         placeholder={t('projectName.placeholder')}/>
                <BrMdEditor onChange={handleEditorChange} className="my-2" editorClass="h-60"
                            label={t('projectDescription.label')}
                            hint={t('projectDescription.hint')}/>
                <SelectAssetTypeRadio setConformsTo={setResourceSpec} />
                <BrImageUpload onChange={setImages} setImagesFiles={setImagesFiles} label={t('imageUpload.label')}
                               placeholder={t('imageUpload.placeholder')} value={imagesFiles}
                               hint={t('imageUpload.hint')}/>
                <BrInput label={t('repositoryOrId.label')} hint={t('repositoryOrId.hint')}
                         value={repositoryOrId} placeholder={t('repositoryOrId.placeholder')}
                         onChange={(e: ChangeEvent<HTMLInputElement>) => setRepositoryOrId(e.target.value)}/>
            <SelectTags label={t('projectTags.label')} hint={t('projectTags.hint')} canCreateTags
                        onChange={setAssetTags}placeholder={t('projectTags.placeholder')}/>
                <div className="grid grid-cols-2 gap-2">
                    <BrInput label={t('location.name.label')} hint={t('location.name.hint')}
                             value={locationName} placeholder={t('location.name.placeholder')}
                             onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationName(e.target.value)}/>
                    <GeoCoderInput onSelect={handleCreateLocation} value={location}
                                   label={t('location.address.label')}
                                   hint={t('location.address.hint')}
                                   placeholder={t('location.address.placeholder')}/>
                </div>
                <AddContributors label={t('contributors.label')} hint={t('contributors.hint')}
                                 setContributors={(c) => setContributors(c)} contributors={contributors}/>
                <BrInput type={'number'} label={t('price.label')} hint={t('price.hint')} value={price}
                         placeholder={t('price.placeholder')}
                         onChange={(e: ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}/>

                {/*todo:gestire meglio la fine del processo*/}
                {assetCreatedId ? <Link href={assetCreatedId}>
                        <a className="btn btn-accent">{t("go to the asset")}</a>
                    </Link> :
                    <button type="submit" className="btn btn-accent"
                            disabled={!isButtonEnabled()}>{t('button')}</button>
                }
            </form>)
}

export default NewAssetForm
