import {NextPage} from "next";
import React, {useEffect} from "react";
import {useAuth} from "../lib/auth";
import {gql, useQuery} from "@apollo/client";
import ResourceTable from "../components/ResourceTable";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import devLog from "../lib/devLog";
import BrLoadMore from "../components/brickroom/BrLoadMore";
import {useRouter} from "next/router";
import {conformsTo} from "cypress/types/lodash";


const FETCH_INVENTORY = gql`query($first: Int, $after: ID, $last: Int, $before: ID, $filters:EconomicResourceFilterParams ) {
  economicResources(first: $first after: $after before: $before last: $last filter: $filters) {
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
    const {type, ids} = useRouter().query;
    const filter: { conformsTo?: string[], primaryAccountable?: string[] } = {};
    // @ts-ignore
    type && (filter['conformsTo'] = [].concat(type));
    // @ts-ignore
    ids && (filter['primaryAccountable'] = [].concat(ids));
    devLog('filters', filter)

    const {t} = useTranslation('resourcesProps')
    const {authId} = useAuth()
    // @ts-ignore
    const {loading, data, error, fetchMore, variables, refetch} = useQuery(FETCH_INVENTORY, {
        variables: {
            last: 10,
            filters: filter
        }
    })
    console.error(error);
    devLog('loading', loading)
    !loading && devLog(data)

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
                // @ts-ignore
                fetchMore({updateQuery, variables: {before}});
            }
        }
    }

    //this is to refetch the data
    useEffect(() => {
        const intervalId = setInterval(() => {
            const total =
                data?.economicResources.edges.length || 0

            refetch({
                ...variables,
                last: total
            });
        }, 5000);

        return () => clearInterval(intervalId);
    }, [
        ...Object.values(variables!).flat(),
        data?.economicResources.pageInfo.startCursor
    ]);

    devLog('economic resources', data?.economicResources.edges)
    return <div className="p-8">
        <div className="mb-6 w-80">
            <h1>{t('title')}</h1>
            <p>{t('description')}</p>
        </div>
        {data && <ResourceTable resources={data?.economicResources.edges}/>}
        <BrLoadMore handleClick={loadMore} disabled={!getHasNextPage} text={t('Load more')}/>
    </div>
};

export async function getStaticProps({locale}: any) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['resourcesProps', 'signInProps', 'SideBarProps'])),
        },
    };
}

export default Resources
