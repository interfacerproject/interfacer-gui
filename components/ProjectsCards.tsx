import { Card } from "@bbtgnn/polaris-interfacer";
import { EconomicResource, EconomicResourceFilterParams } from "../lib/types";
import { useQuery } from "@apollo/client";
import { FETCH_RESOURCES } from "../lib/QueryAndMutation";
import CardsGroup from "./CardsGroup";
import useLoadMore from "../hooks/useLoadMore";
import devLog from "../lib/devLog";

export interface ProjectsCardsProps {
  filter?: EconomicResourceFilterParams;
  hidePagination?: boolean;
  hidePrimaryAccountable?: boolean;
  hideHeader?: boolean;
  hideFilters?: boolean;
}

const ProjectsCards = (props: ProjectsCardsProps) => {
  const {
    filter = {},
    hideHeader = false,
    hidePagination = false,
    hidePrimaryAccountable = false,
    hideFilters = false,
  } = props;
  const dataQueryIdentifier = "economicResources";

  const { loading, data, fetchMore, refetch, variables } = useQuery<{ data: EconomicResource }>(FETCH_RESOURCES, {
    variables: { last: 10, filter: filter },
  });
  const { loadMore, showEmptyState, items, getHasNextPage } = useLoadMore({
    fetchMore,
    refetch,
    variables,
    data,
    dataQueryIdentifier,
  });

  const projects = items;

  devLog("projects", projects);

  return (
    <>
      <CardsGroup
        onLoadMore={loadMore}
        nextPage={!!getHasNextPage}
        loading={loading}
        header={hideHeader ? undefined : "Projects"}
        hidePagination={hidePagination}
        hidePrimaryAccountable={hidePrimaryAccountable}
        hideFilters={hideFilters}
      >
        {projects?.map(({ node }: { node: EconomicResource }) => (
          <>
            <Card
              key={node.id}
              title={node.name}
              footerActionAlignment={"right"}
              sectioned
              primaryFooterAction={{
                id: "primaryFooterAction",
                content: "View",
                url: `/project/${node.id}`,
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
              <p className="w-64">{node.note}</p>
            </Card>
          </>
        ))}
      </CardsGroup>
    </>
  );
};

export default ProjectsCards;
