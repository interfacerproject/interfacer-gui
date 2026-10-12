import { Banner, Link as PLink } from "@bbtgnn/polaris-interfacer";
import { isEditRouteAllowed } from "components/partials/project/projectSections";
import { ProjectType } from "components/types";
import { translateCommon } from "lib/errorFormatter";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useProject } from "./FetchProjectLayout";

interface Props {
  children: React.ReactNode;
}

export default function EditProjectLayout({ children }: Props) {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { project, editAccess } = useProject();
  const id = project.id;
  const chunks = router.asPath.split("?")[0].split("/");
  const route = chunks[chunks.length - 1] === "edit" ? "edit" : chunks.slice(-2).join("/");
  const isRouteAllowed = isEditRouteAllowed(project.conformsTo?.name as ProjectType, route);
  const canEdit = editAccess?.status === "controller";
  useEffect(() => {
    if (canEdit && !isRouteAllowed) void router.replace(`/project/${id}/edit`);
  }, [canEdit, isRouteAllowed, id, router]);
  const status = editAccess?.status || "error";

  return (
    <div>
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
      {!canEdit && (
        <div className="px-4 pb-4">
          <Banner status={status === "error" ? "warning" : "info"}>
            <p className="text-base">{translateCommon(t, `resourceAccess.${status}`)}</p>
            {status !== "loading" && (
              <button
                type="button"
                className="underline mt-2 text-base"
                onClick={() => {
                  void editAccess?.refetch();
                }}
              >
                {translateCommon(t, "resourceAccess.checkAgain")}
              </button>
            )}
          </Banner>
        </div>
      )}
      {/* Keep the same form mounted on refresh/revocation: never discard its draft. */}
      <fieldset disabled={!canEdit || !isRouteAllowed} className="border-0 p-0 m-0 min-w-0">
        {children}
      </fieldset>
    </div>
  );
}
