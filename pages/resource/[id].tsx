import type {NextPage} from 'next'
import {gql, useQuery} from "@apollo/client";
import React from "react";
import {useRouter} from 'next/router'
// import ActionsBlock from "../../components/ActionsBlock";
// import {mapUnit} from "../../lib/mapUnit";
import QrCodeButton from "../../components/brickroom/QrCodeButton";
// import {ArrowNarrowLeftIcon} from "@heroicons/react/solid";
import Card from "../../components/brickroom/Card";

const Resource: NextPage = () => {
    const router = useRouter()
    const {id} = router.query

    const QUERY_RESOURCE = gql`
             query {
              economicResource(id:"${id}"){
                id
                name
                note
                conformsTo {
                 id
                 name
                }
                onhandQuantity {
                  id
                  hasUnit {
                    id
                    symbol
                    label
                  }
                  hasNumericalValue
                }
                accountingQuantity {
                  id
                  hasUnit {
                    label
                    symbol
                  }
                  hasNumericalValue
                }
                primaryAccountable {
                    id
                    name
                  }
                currentLocation{
                  id
                  displayUsername
                  name
                }
                primaryAccountable {
                  id
                  name
                }
              }
            }
          `
    const resource = useQuery(QUERY_RESOURCE).data?.economicResource
    const back = () => router.back()

    return (
        <>
            <div className="btn btn-outline" onClick={back}>
				{/* <ArrowNarrowLeftIcon className="w-6 mr-2" /> */}
				Back</div>
            <div className="grid grid-cols-3 justify-between my-6">
                <div>
                    <h2>{resource?.name}</h2>
                    <p className="text-gray-500 mb-1">{resource?.note}</p>
                    <p className="text-gray-500">
                        {resource?.onhandQuantity?.hasNumericalValue}
						{/* {mapUnit(resource?.onhandQuantity?.hasUnit.label)} */}
                        {resource?.conformsTo && ` of ${resource.conformsTo.name}`}
                    </p>
                </div>

                <div>
                    <h4>Assigned to:</h4>
                    <p className="text-gray-500">{resource?.primaryAccountable?.name}</p>
                </div>
                <div>
                    <h4>Current Location:</h4>
                    <p className="text-gray-500">{resource?.currentLocation?.name}</p>
                </div>
            </div>
            {/* <div className="my-3">
                <ActionsBlock resourceId={String(id)}/>
            </div> */}
            <Card className="w-128">
                <h2>Material passport</h2>
                <p className="text-gray-500">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Neque pellentesque hendrerit ultrices
                    mauris et non pellentesque.
                </p>
                <div className="w-40 mt-2">
                    <QrCodeButton id={String(id)}/>
                </div>
            </Card>
        </>
    )
};

export default Resource
