import type {NextPage} from 'next'
import {gql, useMutation, useQuery} from "@apollo/client";
import React, {ChangeEvent, useEffect, useState} from "react";
import BrTextField from "../components/brickroom/BrTextField";
import BrInput from "../components/brickroom/BrInput";
import {useRouter} from "next/router";
import BrRadio from "../components/brickroom/BrRadio";
import TagSelector from "../components/brickroom/TagSelector";
import {useAuth} from "../lib/auth";
import dayjs from 'dayjs'
import devLog from "../lib/devLog";
import BrImageUpload from "../components/brickroom/BrImageUpload";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";

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


const CreateProject: NextPage = () => {
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
    const [intentId, setIntentId] = useState('')
    const [images, setImages] = useState([] as Images)
    const [imagesFiles, setImagesFiles] = useState([] as Array<any>)
    const {t} = useTranslation('createProjectProps')

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


    const {authId} = useAuth()


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

    const instanceVariables = useQuery(QUERY_VARIABLES).data?.instanceVariables

    const [createAsset, {data}] = useMutation(CREATE_ASSET)

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

        createAsset({
            variables: {
                resourceSpec: resourceSpec,
                agent: authId,
                name: projectName,
                metadata: `description: ${projectDescription}, repositoryOrId: ${repositoryOrId}`,
                location: locationId,
                oneUnit: instanceVariables?.units?.unitOne.id,
                creationTime: dayjs().toISOString(),
                images: images,
            }
        })
            .then((re: any) => {
                images.forEach((i, index) => {
                    const filesArray = new FormData()
                    filesArray.append(i.hash, imagesFiles[index])
                    fetch(process.env.FILE!, {
                        method: "post",
                        body: filesArray,
                    }).then((r: any) => devLog(r))
                })

                setResourceId(re.data?.createEconomicEvent.economicEvent.resourceInventoriedAs.id)
                devLog('2', re.data?.createEconomicEvent.economicEvent.resourceInventoriedAs.id)
                createProposal()
                    .then((proposal) => {
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
                            devLog('4', intent)
                            linkProposalAndIntent({
                                variables: {
                                    proposal: proposal.data?.createProposal.proposal.id,
                                    item: intent.data?.item.intent.id,
                                    payment: intent.data?.payment.intent.id
                                }
                            }).then(() => {
                                router.push(`/asset/${proposal.data?.createProposal.proposal.id}`)
                            })
                        })
                    })
            })
    }

    return (<>
        <div className="w-128">
            <div className="w-80">
                <h2 className="text-primary">{t('headline.title')} </h2>
                <p>{t('headline.description')}</p>
            </div>
            <br/>

            <form onSubmit={onSubmit} className="w-full">
                <BrInput label={t('projectName.label')} hint={t('projectName.hint')} value={projectName}
                         onChange={(e: ChangeEvent<HTMLInputElement>) => setAssetName(e.target.value)}
                         placeholder={t('projectName.placeholder')}/>
                <BrTextField label={t('projectDescription.label')} hint={t('projectDescription.hint')}
                             value={projectDescription} placeholder={t('projectDescription.placeholder')}
                             onChange={(e: ChangeEvent<HTMLInputElement>) => setAssetDescription(e.target.value)}/>
                <BrRadio array={t('projectType.array', {returnObjects: true})} label={t('projectType.label')}
                         hint={t('projectType.hint')} onChange={setAssetType} value={projectType}/>
                <BrImageUpload onChange={setImages} setImagesFiles={setImagesFiles} label={t('imageUpload.label')}
                               placeholder={t('imageUpload.placeholder')} value={imagesFiles} hint={t('imageUpload.hint')}/>
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
                <BrInput type={'number'} label={t('price.label')} hint={t('price.hint')} value={price}
                         placeholder={t('price.placeholder')}
                         onChange={(e: ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}/>
                <button type="submit" className="btn btn-accent">{t('button')}</button>
            </form>
        </div>
    </>)
};

export async function getStaticProps({locale}: any) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['createProjectProps', 'signInProps'])),
        },
    };
}

export default CreateProject




