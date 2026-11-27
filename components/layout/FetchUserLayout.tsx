import { useQuery } from "lib/apollo-compat";
import { GET_USER_LAYOUT } from "@dyne/interfacer-client";
import { Spinner } from "@bbtgnn/polaris-interfacer";
import { GetUserQuery, GetUserQueryVariables, Person } from "lib/types";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useRef } from "react";
import { useTranslation } from "next-i18next";

//
type UserContext = {
  person: Partial<Person>;
  id: string;
};

export const UserContext = createContext<UserContext>({} as UserContext);
export const useUser = () => useContext(UserContext);

//

interface Props {
  children: React.ReactNode;
  userIdParam?: string;
}

const RETRY_MS = 4000;

const FetchUserLayout: React.FunctionComponent<Props> = (props: Props) => {
  const { children, userIdParam = "id" } = props;
  const router = useRouter();
  const { t } = useTranslation("common");
  const id = router.query[userIdParam] as string;

  const { loading, data, error, refetch } = useQuery<GetUserQuery, GetUserQueryVariables>(GET_USER_LAYOUT, {
    variables: { id },
    skip: !id,
  });
  // Keep the person once loaded: a later refetch that fails (a timeout, a server
  // error) must not throw the visitor out of a page that was showing.
  const last = useRef<{ id: string; person: Partial<Person> } | null>(null);
  const fetched = data?.person as Partial<Person> | null | undefined;
  if (fetched) last.current = { id, person: fetched };
  const user = fetched ?? (last.current?.id === id ? last.current.person : undefined);

  // Only a person who does not exist is a 404; a failed request is tried again.
  const missing = !loading && !error && !!id && data !== undefined && !data?.person;
  useEffect(() => {
    if (missing) router.push("/404");
  }, [missing, router]);
  useEffect(() => {
    if (!error || user) return;
    const timer = setTimeout(() => refetch(), RETRY_MS);
    return () => clearTimeout(timer);
  }, [error, user, refetch]);

  if (user) return <UserContext.Provider value={{ person: user, id }}>{children}</UserContext.Provider>;
  if (error && !loading)
    return (
      <div className="flex flex-col pt-40 items-center gap-3 text-center" data-testid="profile-load-error">
        <p className="m-0 text-ifr-text-secondary">{t("This profile could not be loaded right now.")}</p>
        <button type="button" className="underline font-semibold" onClick={() => refetch()}>
          {t("Try again")}
        </button>
      </div>
    );
  return (
    <div className="flex pt-40 items-center">
      <div className="mx-auto">
        <Spinner />
      </div>
    </div>
  );
};

export default FetchUserLayout;
