import {NextPage} from "next";
import React from "react";
import {useAuth} from "../lib/auth";
import {gql, useQuery} from "@apollo/client";
import ResourceTable from "../components/ResourceTable";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import devLog from "../lib/devLog";
import BrLoadMore from "../components/brickroom/BrLoadMore";


const FETCH_INVENTORY = gql`query($first: Int, $after: ID, $last: Int, $before: ID) {
  economicResources(first: $first, after: $after, before: $before, last: $last) {
    pageInfo {
      startCursor
      endCursor
      hasPreviousPage
      hasNextPage
      totalCount
      pageLimit
    }
    edges {
      cursor
      node {
        conformsTo {
          id
          name
        }
        currentLocation {id name mappableAddress}
        id
        name
        note
        primaryAccountable {id name note}
        custodian {id name note}
        accountingQuantity {hasUnit{id label symbol} hasNumericalValue}
        onhandQuantity {hasUnit{id label symbol} hasNumericalValue}
      }
    }
  }
}
`


const Resources: NextPage = () => {
    const {t} = useTranslation('resourcesProps')
    const {authId} = useAuth()
    const {loading, data, error, fetchMore} = useQuery(FETCH_INVENTORY, {variables: {last: 10}})
    const updateQuery = (previousResult: any, {fetchMoreResult}: any) => {
        if (!fetchMoreResult) {
            return previousResult;
        }

        const previousEdges = previousResult.economicResources.edges;
        const fetchMoreEdges = fetchMoreResult.economicResources.edges;

        fetchMoreResult.economicResources.edges = [...previousEdges, ...fetchMoreEdges];

        return {...fetchMoreResult}
    }
    const getHasNextPage = data?.economicResources.pageInfo.hasNextPage;
    const loadMore = () => {
        if (data && fetchMore) {
            const nextPage = getHasNextPage;
            const before = data.economicResources.pageInfo.endCursor;

            if (nextPage && before !== null) {
                fetchMore({updateQuery, variables: {before}});
            }
        }
    }
    devLog(data?.economicResources.edges)
    return <>
        <div className="w-80 mb-6">
            <h1>{t('title')}</h1>
            <p>{t('description')}</p>
        </div>
        {data && <ResourceTable resources={data?.economicResources.edges}/>}
        <BrLoadMore handleClick={loadMore} disabled={!getHasNextPage} text={t('Load more')}/>
    </>
};

export async function getStaticProps({locale}: any) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['resourcesProps', 'signInProps'])),
        },
    };
}

export default Resources
