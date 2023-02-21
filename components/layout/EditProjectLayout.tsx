import { useAuth } from "hooks/useAuth";
import { useRouter } from "next/router";
import { useProject } from "./FetchProjectLayout";

interface Props {
  children: React.ReactNode;
}

export default function EditProjectLayout(props: Props) {
  const { children } = props;
  const { user } = useAuth();
  const router = useRouter();
  const project = useProject();

  const isOwner = user?.ulid === project.primaryAccountable?.id;
  if (!isOwner) router.push("/projects");

  return <>{isOwner && children}</>;
}
