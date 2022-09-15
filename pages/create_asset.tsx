import {gql, useMutation, useQuery} from "@apollo/client";
import dayjs from 'dayjs';
import Layout from "../components/CreateProjectLayout";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useRouter} from "next/router";
import {ChangeEvent, ReactElement, useEffect, useState} from "react";
import BrImageUpload from "../components/brickroom/BrImageUpload";
import BrInput from "../components/brickroom/BrInput";
import BrRadio from "../components/brickroom/BrRadio";
import TagSelector from "../components/brickroom/TagSelector";
import {useAuth} from "../lib/auth";
import devLog from "../lib/devLog";
import BrMdEditor from "../components/brickroom/BrMdEditor";
import AddContributors from "../components/AddContributors";
import type {NextPageWithLayout} from './_app'
import Link from "next/link";


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


const CreateProject: NextPageWithLayout = () => {
    const {authId} = useAuth()
    const [projectType, setAssetType] = useState('')
    const [projectName, setAssetName] = useState('')
    const [projectDescription, setAssetDescription] = useState('')
    const [repositoryOrId, setRepositoryOrId] = useState('')
    const [assetTags, setAssetTags] = useState([] as string[])
    const [locationAddress, setLocationAddress] = useState('')
    const [locationId, setLocationId] = useState('')
    const [locationName, setLocationName] = useState('')
    const [price, setPrice] = useState('')
    const [resourceSpec, setResourceSpec] = useState('')
    const [resourceId, setResourceId] = useState('')
    const [images, setImages] = useState([] as Images)
    const [contributors, setContributors] = useState([] as string[])
    const [imagesFiles, setImagesFiles] = useState([] as Array<any>)
    const [logs, setLogs] = useState([`info: user ${authId}`] as string[])
    const [assetCreatedId, setAssetCreatedId] = useState(undefined as string | undefined)
    const {t} = useTranslation('createProjectProps')

    const isButtonEnabled = () => {
        return projectType.length > 0 &&
            projectName.length > 0 &&
            projectDescription.length > 0 &&
            repositoryOrId.length > 0 &&
            locationId.length > 0 &&
            price.length > 0
    }
    useEffect(() => {
        setLogs(logs.concat(['warning: compile all mandatory fields']))

    }, [])
    useEffect(() => {
        isButtonEnabled() && setLogs(logs.concat(['info: mandatory fields compiled']))

    }, [projectType, projectName, projectDescription, repositoryOrId, locationId, locationName, price])

    const colors = ["error", "success", "warning", "info"];
    const logsClass = (text: string) => colors.includes(text.split(':')[0]) ? `text-${text.split(':')[0]} uppercase my-3` : 'my-2'
    useEffect(() => {
        if (projectType === 'Product') {
            setResourceSpec(instanceVariables?.specs?.specProjectProduct.id)
        }
        if (projectType === 'Service') {
            setResourceSpec(instanceVariables?.specs?.specProjectService.id)
        }
        if (projectType === 'Design') {
            setResourceSpec(instanceVariables?.specs?.specProjectDesign.id)
        }
    }, [projectType])


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


    const CREATE_LOCATION = gql`mutation ($name: String!, $addr: String!) {
  createSpatialThing(spatialThing: { name: $name, mappableAddress: $addr }) {
    spatialThing {
      id
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

    const handleCreateLocation = async () => {
        const name = locationName === '' ? '*untitled*' : locationName
        await createLocation({variables: {name: name, addr: locationAddress}}).then((r) => {
            setLocationId(r.data.createSpatialThing.spatialThing.id)
        })
    }
    const router = useRouter()

    function onSubmit(e: any) {
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

        createAsset({
            variables: variables
        }).catch((error) => {
            logsText = logsText.concat('error:'.concat(error.message))
            setLogs(logsText.concat(logsText))
        })
            .then((re: any) => {
                logsText = logsText.concat(logsText.concat([`success: Resource with id ${re.data.createEconomicEvent.economicEvent.resourceInventoriedAs.id} created`]))
                setLogs(logsText)
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
                        devLog('image upload response',r)
                    })
                })

                setResourceId(re.data?.createEconomicEvent.economicEvent.resourceInventoriedAs.id)
                logsText = logsText.concat([`success: Created resource inventoried with iD: ${re.data?.createEconomicEvent.economicEvent.resourceInventoriedAs.id}`, 'info: Creating proposal'])
                setLogs(logsText)
                devLog('2', re.data?.createEconomicEvent.economicEvent.resourceInventoriedAs.id)
                createProposal()
                    .then((proposal) => {
                        logsText = logsText.concat([`success: Created proposal with id: ${proposal.data?.createProposal.proposal.id}`, 'info: Creating intents'])
                        setLogs(logsText)
                        devLog('3', proposal)
                        createIntent({
                            variables: {
                                agent: authId,
                                resource: re.data?.createEconomicEvent.economicEvent.resourceInventoriedAs.id,
                                oneUnit: instanceVariables?.units.unitOne.id,
                                howMuch: parseFloat(price),
                                currency: instanceVariables?.specs.specCurrency.id
                            }
                        }).then((intent) => {
                            logsText = logsText.concat([`success: Created intent with id: ${intent.data?.item.intent.id}`, 'info: Linking proposal and intent'])
                            setLogs(logsText)
                            devLog('4', intent)
                            linkProposalAndIntent({
                                variables: {
                                    proposal: proposal.data?.createProposal.proposal.id,
                                    item: intent.data?.item.intent.id,
                                    payment: intent.data?.payment.intent.id
                                }
                            }).then(() => {
                                logsText = logsText.concat(['success: Asset succesfull created!!!'])
                                setLogs(logsText)
                                setAssetCreatedId(`/asset/${proposal.data?.createProposal.proposal.id}`)
                            })
                        })
                    })
            })
    }

    return (<div className="grid grid-cols-1 gap-4 p-8 md:grid-cols-12">
        <div className="w-full md:col-start-2 md:col-end-8">
            <div className="w-80">
                <h2 className="text-primary">{t('headline.title')} </h2>
                <p>{t('headline.description')}</p>
            </div>
            <br/>

            <form onSubmit={onSubmit} className="w-full">
                <BrInput label={t('projectName.label')} hint={t('projectName.hint')} value={projectName}
                         onChange={(e: ChangeEvent<HTMLInputElement>) => setAssetName(e.target.value)}
                         placeholder={t('projectName.placeholder')}/>
                <BrMdEditor onChange={handleEditorChange} className="my-2" editorClass="h-60"
                            label={t('projectDescription.label')}
                            hint={t('projectDescription.hint')}/>
                <BrRadio array={t('projectType.array', {returnObjects: true})} label={t('projectType.label')}
                         hint={t('projectType.hint')} onChange={setAssetType} value={projectType}/>
                <BrImageUpload onChange={setImages} setImagesFiles={setImagesFiles} label={t('imageUpload.label')}
                               placeholder={t('imageUpload.placeholder')} value={imagesFiles}
                               hint={t('imageUpload.hint')}/>
                <BrInput label={t('repositoryOrId.label')} hint={t('repositoryOrId.hint')}
                         value={repositoryOrId} placeholder={t('repositoryOrId.placeholder')}
                         onChange={(e: ChangeEvent<HTMLInputElement>) => setRepositoryOrId(e.target.value)}/>
                <TagSelector label={t('projectTags.label')} hint={t('projectTags.hint')}
                             onSelect={(tags) => setAssetTags(tags)} placeholder={t('projectTags.placeholder')}/>
                <div className="grid grid-cols-2 gap-2">
                    <BrInput label={t('location.name.label')} hint={t('location.name.hint')}
                             value={locationName} placeholder={t('location.name.placeholder')}
                             onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationName(e.target.value)}/>
                    <BrInput label={t('location.address.label')} hint={t('location.address.hint')}
                             value={locationAddress}
                             placeholder={t('location.address.placeholder')}
                             onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationAddress(e.target.value)}
                             onBlur={handleCreateLocation}/>
                </div>
                <AddContributors label={t('contributors.label')} hint={t('contributors.hint')}
                                 setContributors={(c) => setContributors(c)} contributors={contributors}/>
                <BrInput type={'number'} label={t('price.label')} hint={t('price.hint')} value={price}
                         placeholder={t('price.placeholder')}
                         onChange={(e: ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}/>

                {/*todo:gestire meglio la fine del processo*/}
                {assetCreatedId ? <Link href={assetCreatedId}>
                        <a className="btn btn-accent">Go to the asset</a>
                    </Link> :
                    <button type="submit" className="btn btn-accent"
                            disabled={!isButtonEnabled()}>{t('button')}</button>
                }
            </form>
        </div>
        <div className="w-full md:col-start-8 md:col-end-12">
            <div className="hidden text-error text-success text-warning text-info"/>
            <div className="w-full px-2 pb-2 border-2 md:w-128 md:fixed bg-white">
                <h4 className="text-primary my-2 capitalize">{t('control window')}</h4>
                <div className="overflow-y-scroll font-mono border-2 max-h-80 bg-[#F7F7F7] p-2">
                    {logs.map((l, index) => <p key={index} className={logsClass(l)}>{l}</p>)}
                </div>
            </div>
        </div>
    </div>)
};

export async function getStaticProps({locale}: any) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['createProjectProps', 'signInProps', 'SideBarProps', 'SideBarProps'])),
        },
    };
}


CreateProject.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            {page}
        </Layout>
    )
}

export default CreateProject




