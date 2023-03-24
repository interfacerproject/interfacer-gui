import { Link as PLink, Spinner } from "@bbtgnn/polaris-interfacer";
import { isEditRouteAllowed } from "components/partials/project/projectSections";
import { ProjectType } from "components/types";
import { useAuth } from "hooks/useAuth";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useProject } from "./FetchProjectLayout";

interface Props {
  children: React.ReactNode;
}

export default function EditProjectLayout(props: Props) {
  const { children } = props;
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const { project } = useProject();
  const id = project?.id;

  const isOwner = user?.ulid === project.primaryAccountable?.id;
  if (!isOwner) router.push(`/project/${id}`);

  function getEditRoute() {
    const chunks = router.asPath.split("/");
    if (chunks[chunks.length - 1] == "edit") return "edit";
    else return chunks.slice(-2).join("/");
  }

  const isRouteAllowed = isEditRouteAllowed(project.conformsTo?.name as ProjectType, getEditRoute());
  if (!isRouteAllowed) router.push(`/project/${id}/edit`);

  const isAllowed = isOwner && isRouteAllowed;

  return (
    <div>
      {!isAllowed && <Spinner />}
      {isAllowed && (
        <>
          <div className="p-4">
            <Link href={`/project/${id}`}>
              <PLink>
                <span className="text-text-primary">
                  {"← "}
                  {t("Back to Project")}
                </span>
              </PLink>
            </Link>
          </div>
          <div>{children}</div>
        </>
      )}
    </div>
  );
}
