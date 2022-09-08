import {gql, useQuery} from "@apollo/client";
import AssetsTable from "../components/AssetsTable";
import devLog from "../lib/devLog";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import React from "react";
import NewProjectButton from "../components/NewProjectButton";
import Link from "next/link";


const Assets = () => {
    const {t} = useTranslation('lastUpdatedProps')

    const QUERY_ASSETS = gql`query ($first: Int, $after: ID, $last: Int, $before: ID) {
  proposals(first: $first, after: $after, before: $before, last: $last) {
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
        id
        name
        primaryIntents {
          action {
            id
          }
          hasPointInTime
          hasBeginning
          hasEnd
          resourceInventoriedAs {
            conformsTo {
              name
            }
            primaryAccountable{
              name
              id
            }
            name
            id
            note
            onhandQuantity {
              hasUnit {
                label
              }
            }
            images {
              hash
              name
              mimeType
            }
          }
        }
        reciprocalIntents {
          resourceQuantity {
            hasNumericalValue
            hasUnit {
              label
              symbol
            }
          }
        }
      }
    }
  }
}
`
    const {loading, data, error, fetchMore } = useQuery(QUERY_ASSETS, {variables: {last: 10}})
    const updateQuery = (previousResult: any, {fetchMoreResult}: any) => {
        if (!fetchMoreResult) {
            return previousResult;
        }

        const previousEdges = previousResult.proposals.edges;
        const fetchMoreEdges = fetchMoreResult.proposals.edges;

        fetchMoreResult.proposals.edges = [...previousEdges, ...fetchMoreEdges];

        return {...fetchMoreResult}
    }
    const getHasNextPage = data?.proposals.pageInfo.hasNextPage;
    const loadMore = () => {
        if (data && fetchMore) {
            const nextPage = getHasNextPage;
            const before = data.proposals.pageInfo.endCursor;

            if (nextPage && before !== null) {
                fetchMore({updateQuery, variables: {before}});
            }
        }
    }
    devLog(data)


    return (<div className="p-8">
        <div className="mb-6 w-96">
            <h1>{t('title')}</h1>
            <p className="my-2">{t('description')}</p>
            <NewProjectButton/>
            <Link href="mailto:bugreport@dyne.org">
            <a className="ml-2 normal-case btn btn-accent btn-outline btn-md">
                {t('Report a bug')}
            </a>
        </Link>
        </div>
        {data && <AssetsTable assets={data.proposals.edges} assetsHead={t('tableHead', { returnObjects: true })}/>}
        <div className="grid grid-cols-1 gap-4 mt-4 place-items-center">
            <button className="btn btn-primary" onClick={loadMore} disabled={!getHasNextPage}>{t('Load more')}</button>
        </div>
    </div>)
}

export async function getStaticProps({locale}: any) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['signInProps', 'lastUpdatedProps', 'SideBarProps'])),
        },
    };
}

export default Assets
