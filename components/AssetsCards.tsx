import { Card } from "@bbtgnn/polaris-interfacer";
import { GetAssetsQuery, GetAssetsQueryVariables, ProposalFilterParams } from "../lib/types";
import { useQuery } from "@apollo/client";
import { QUERY_ASSETS } from "../lib/QueryAndMutation";
import CardsGroup from "./CardsGroup";
import useLoadMore from "../hooks/useLoadMore";

export interface AssetsCardsProps {
  filter?: ProposalFilterParams;
  hidePagination?: boolean;
  hidePrimaryAccountable?: boolean;
  hideHeader?: boolean;
  hideFilters?: boolean;
}

const AssetsCards = (props: AssetsCardsProps) => {
  const {
    filter = {},
    hideHeader = false,
    hidePagination = false,
    hidePrimaryAccountable = false,
    hideFilters = false,
  } = props;
  const dataQueryIdentifier = "proposals";

  const { loading, data, fetchMore, refetch, variables } = useQuery<GetAssetsQuery, GetAssetsQueryVariables>(
    QUERY_ASSETS,
    {
      variables: { last: 10, filter: filter },
    }
  );
  const { loadMore, showEmptyState, items, getHasNextPage } = useLoadMore({
    fetchMore,
    refetch,
    variables,
    data,
    dataQueryIdentifier,
  });

  const assets = items;

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
        {
          // @ts-ignore
          assets?.map(({ node: { id, primaryIntents } }) => (
            <>
              {Boolean(!primaryIntents || primaryIntents[0]) && (
                <Card
                  key={id}
                  title={!primaryIntents || primaryIntents[0].resourceInventoriedAs?.name}
                  footerActionAlignment={"right"}
                  sectioned
                  primaryFooterAction={{
                    id: "primaryFooterAction",
                    content: "View",
                    url: `/asset/${id}`,
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
                  <p>{!primaryIntents || primaryIntents[0].resourceInventoriedAs?.note}</p>
                </Card>
              )}
            </>
          ))
        }
      </CardsGroup>
    </>
  );
};

export default AssetsCards;
