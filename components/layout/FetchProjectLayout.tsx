import { SdkQueryResult, useQuery } from "lib/apollo-compat";
import { GET_PROJECT_LAYOUT } from "@dyne/interfacer-client";
import { Banner, Spinner } from "@bbtgnn/polaris-interfacer";
import { errorFormatter, translateCommon } from "lib/errorFormatter";
import { useTranslation } from "next-i18next";
import { ResourceEditAccess, useResourceControl } from "hooks/useResourceControl";
import { EconomicResource, GetProjectLayoutQuery, GetProjectLayoutQueryVariables } from "lib/types";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect } from "react";

//
interface ProjectContextValue {
  project: Partial<EconomicResource>;
  refetch: (variables?: { id?: string }) => Promise<SdkQueryResult<GetProjectLayoutQuery>>;
  editAccess: ResourceEditAccess;
  loading: boolean;
}

export const ProjectContext = createContext<ProjectContextValue>({} as ProjectContextValue);
export const useProject = () => useContext(ProjectContext);

//

interface Props {
  children: React.ReactNode;
  projectIdParam?: string;
}

const FetchProjectLayout: React.FunctionComponent<Props> = (props: Props) => {
  const { children, projectIdParam = "id" } = props;
  const router = useRouter();
  const id = router.query[projectIdParam] as string;
  const editAccess = useResourceControl(id);
  const { t } = useTranslation("common");

  const { loading, data, error, refetch, startPolling } = useQuery<
    GetProjectLayoutQuery,
    GetProjectLayoutQueryVariables
  >(GET_PROJECT_LAYOUT, {
    variables: { id },
    skip: !id,
  });
  startPolling(120000);
  const project = data?.economicResource as Partial<EconomicResource>;
  useEffect(() => {
    if (id && !loading && !project && !error) void router.replace("/404");
  }, [id, loading, project, error, router]);
  if (loading && !project)
    return (
      <div className="flex pt-40 items-center">
        <div className="mx-auto">
          <Spinner />
        </div>
      </div>
    );
  if (error)
    return (
      <div className="p-4">
        <Banner status="critical">
          <p>{errorFormatter(error, t)}</p>
          <button
            type="button"
            className="underline mt-2"
            onClick={() => {
              void refetch();
            }}
          >
            {translateCommon(t, "resourceAccess.checkAgain")}
          </button>
        </Banner>
      </div>
    );
  if (!project || project.id !== id) return null;

  const contextValue: ProjectContextValue = {
    project,
    refetch,
    editAccess,
    loading,
  };

  return <ProjectContext.Provider value={contextValue}>{children}</ProjectContext.Provider>;
};

export default FetchProjectLayout;
