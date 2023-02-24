import { Link as PLink } from "@bbtgnn/polaris-interfacer";
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
  const project = useProject();
  const id = project?.id;

  const isOwner = user?.ulid === project.primaryAccountable?.id;
  if (!isOwner) router.push("/projects");

  return (
    <div className="">
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
      <div>{isOwner && children}</div>
    </div>
  );
}
