import { Card } from "@bbtgnn/polaris-interfacer";
import { EconomicResource, FetchInventoryQuery, EconomicResourceFilterParams } from "lib/types";
import { gql, useQuery } from "@apollo/client";
import CardsGroup from "./CardsGroup";
import useLoadMore from "../hooks/useLoadMore";
import { FETCH_RESOURCES } from "../lib/QueryAndMutation";

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

  const { loading, data, error, fetchMore, variables, refetch } = useQuery<FetchInventoryQuery>(FETCH_RESOURCES, {
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
        header={hideHeader ? undefined : "Resources"}
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
              <p className="w-64">{e.node.note}</p>
            </Card>
          </>
        ))}
      </CardsGroup>
    </>
  );
};

export default ResourcesCards;
