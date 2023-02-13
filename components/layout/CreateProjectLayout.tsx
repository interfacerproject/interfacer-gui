import { Link as PLink } from "@bbtgnn/polaris-interfacer";
import { ProjectType } from "components/partials/create/project/CreateProjectForm";
import { useTranslation } from "next-i18next";
import Link from "next/link";

type LayoutProps = {
  children: React.ReactNode;
  projectType: ProjectType;
};

const CreateProjectLayout: React.FunctionComponent<LayoutProps> = (layoutProps: LayoutProps) => {
  const { t } = useTranslation("createProjectProps");
  const { children } = layoutProps;

  return (
    <div className="">
      <div className="p-4">
        <Link href="/create/project">
          <PLink>
            <span className="text-text-primary">
              {"← "}
              {t("Back to Project Creation")}
            </span>
          </PLink>
        </Link>
      </div>
      <div className="mx-auto">{children}</div>
    </div>
  );
};

export default CreateProjectLayout;
