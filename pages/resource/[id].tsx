import type {NextPage} from 'next'
import {gql, useQuery} from "@apollo/client";
import React from "react";
import {useRouter} from 'next/router'
import QrCodeButton from "../../components/brickroom/QrCodeButton";
import {ArrowNarrowLeftIcon} from "@heroicons/react/solid";
import Card from "../../components/brickroom/Card";
import devLog from "../../lib/devLog";

const Resource: NextPage = () => {
    const router = useRouter()
    const {id} = router.query

    const QUERY_RESOURCE = gql`
             query($id: ID!) {
  economicResource(id: $id) {
    id
    name
    note
    conformsTo {
      id
      name
    }
    onhandQuantity {
      hasUnit {
        id
        symbol
        label
      }
      hasNumericalValue
    }
    accountingQuantity {
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
    currentLocation {
      name
      mappableAddress
    }
    primaryAccountable {
      id
      name
    }
  }
}`
    const resource = useQuery(QUERY_RESOURCE, {variables: {id: id}}).data?.economicResource
    devLog('resource', resource)

    return (
        <div>
            <div className="grid md:grid-cols-12 grid-cols-1 gap-2 pt-14">
                <div className="md:col-start-2 md:col-end-7">
                    <h2>{resource?.name}</h2>
                    <p className="mb-1 text-gray-500">{resource?.note}</p>
                    <p className="text-gray-500">
                        This is a
                        {/* {mapUnit(resource?.onhandQuantity?.hasUnit.label)} */}
                        <span className="text-primary">{resource?.conformsTo && `${resource.conformsTo.name}`}</span>
                    </p>
                </div>

                <div className="md:col-start-8 md:col-end-13">
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
                <div className="md:col-start-2 md:col-end-7 my-3">
                    <Card className="w-128">
                        <h2>Material passport</h2>
                        <p className="text-gray-500">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Neque pellentesque hendrerit
                            ultrices
                            mauris et non pellentesque.
                        </p>
                        <div className="w-40 mt-2">
                            <QrCodeButton id={String(id)}/>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
};

export default Resource
