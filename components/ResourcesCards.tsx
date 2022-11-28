import { Card } from "@bbtgnn/polaris-interfacer";
import { EconomicResource, FetchInventoryQuery, EconomicResourceFilterParams } from "../lib/types";
import { gql, useQuery } from "@apollo/client";
import CardsGroup from "./CardsGroup";
import useLoadMore from "../hooks/useLoadMore";

const FETCH_INVENTORY = gql`
  query FetchInventory($first: Int, $after: ID, $last: Int, $before: ID, $filter: EconomicResourceFilterParams) {
    economicResources(first: $first, after: $after, before: $before, last: $last, filter: $filter) {
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
          currentLocation {
            id
            name
            mappableAddress
          }
          id
          name
          note
          metadata
          okhv
          repo
          version
          licensor
          license
          primaryAccountable {
            id
            name
            note
          }
          custodian {
            id
            name
            note
          }
          accountingQuantity {
            hasUnit {
              id
              label
              symbol
            }
            hasNumericalValue
          }
          onhandQuantity {
            hasUnit {
              id
              label
              symbol
            }
            hasNumericalValue
          }
        }
      }
    }
  }
`;

export interface ResourcesCardsProps {
  filter?: EconomicResourceFilterParams;
  hidePagination?: boolean;
  hidePrimaryAccountable?: boolean;
  hideHeader?: boolean;
  hideFilters?: boolean;
}

const ResourcesCards = (props: ResourcesCardsProps) => {
  const {
    filter = {},
    hideHeader = false,
    hidePagination = false,
    hidePrimaryAccountable = false,
    hideFilters = false,
  } = props;
  const dataQueryIdentifier = "economicResources";

  const { loading, data, error, fetchMore, variables, refetch } = useQuery<FetchInventoryQuery>(FETCH_INVENTORY, {
    variables: {
      last: 10,
      filter: filter,
    },
  });
  const { loadMore, showEmptyState, items, getHasNextPage } = useLoadMore({
    fetchMore,
    refetch,
    variables,
    data,
    dataQueryIdentifier,
  });

  const resources = items;

  return (
    <>
      <CardsGroup
        onLoadMore={loadMore}
        nextPage={!!getHasNextPage}
        loading={loading}
        hideHeader={hideHeader}
        hidePagination={hidePagination}
        hidePrimaryAccountable={hidePrimaryAccountable}
        hideFilters={hideFilters}
      >
        {resources?.map((e: { node: EconomicResource }) => (
          <>
            <Card
              key={e.node.id}
              title={e.node.name}
              footerActionAlignment={"right"}
              sectioned
              primaryFooterAction={{
                id: "primaryFooterAction",
                content: "View",
                url: `/resource/${e.node.id}`,
              }}
              secondaryFooterActions={[
                {
                  id: "watch",
                  content: "Watch",
                  url: "/watch",
                },
                {
                  id: "share",
                  content: "Share",
                  url: "/share",
                },
                {
                  id: "Add to list",
                  content: "Add to list +",
                  url: "/add-to-list",
                },
              ]}
            >
              <img src={e.node.metadata?.image} className="w-20 h-20" />
              <p>{e.node.note}</p>
            </Card>
          </>
        ))}
      </CardsGroup>
    </>
  );
};

export default ResourcesCards;
