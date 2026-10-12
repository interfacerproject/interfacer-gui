import { GraphQLRequestError, throwIfGraphQLErrors } from "@dyne/interfacer-client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";

export type ResourceEditStatus = "loading" | "controller" | "read-only" | "unassigned" | "organization" | "error";
export interface ResourceEditAccess {
  status: ResourceEditStatus;
  error?: unknown;
  refetch: () => Promise<void>;
}
const QUERY = `query PersonalResourceControl($id: ID!) {
  resourceControl(resourceId: $id) { controller { id __typename } epoch }
}`;
function statusOf(value: unknown, actor: string): ResourceEditStatus {
  if (value === null) return "unassigned";
  const c = value as { controller?: { id?: unknown; __typename?: unknown }; epoch?: unknown } | undefined;
  if (
    !c ||
    typeof c.controller?.id !== "string" ||
    !c.controller.id ||
    !Number.isInteger(c.epoch) ||
    (c.epoch as number) < 0 ||
    !["Person", "Organization"].includes(c.controller.__typename as string)
  ) {
    throw new GraphQLRequestError([
      { message: "Invalid resource control response.", extensions: { code: "INVALID_RESPONSE" } },
    ]);
  }
  // Organization policy is intentionally not reproduced in React.
  if (c.controller.__typename === "Organization") return "organization";
  return c.controller.id === actor ? "controller" : "read-only";
}

/** Personal edit affordance only. Every write is still authorized by the backend. */
export function useResourceControl(id?: string): ResourceEditAccess {
  const { user, client } = useAuth();
  const actor = user?.ulid;
  const key = JSON.stringify([id, actor]);
  const input = useRef({ key, client });
  input.current = { key, client };
  const mounted = useRef(false),
    generation = useRef(0);
  const [state, setState] = useState<{
    key: string;
    client: typeof client;
    status: ResourceEditStatus;
    error?: unknown;
  }>({
    key,
    client,
    status: actor && id ? "loading" : "read-only",
  });
  const execute = useCallback(async () => {
    const ticket = ++generation.current;
    const active = () =>
      mounted.current && ticket === generation.current && input.current.key === key && input.current.client === client;
    if (!client || !actor || !id) {
      if (active()) setState({ key, client, status: "read-only" });
      return;
    }
    if (active()) setState({ key, client, status: "loading" });
    try {
      const result = await client.graphql.request<{ resourceControl: unknown }>(QUERY, { id });
      throwIfGraphQLErrors(result);
      const status = statusOf(result.data?.resourceControl, actor);
      if (active()) setState({ key, client, status });
    } catch (error) {
      if (active()) setState({ key, client, status: "error", error });
    }
  }, [client, actor, id, key]);

  useEffect(() => {
    mounted.current = true;
    void execute();
    return () => {
      mounted.current = false;
    };
  }, [execute]);
  useEffect(() => {
    if (typeof window === "undefined" || !client || !actor || !id) return;
    const refresh = () => {
      if (document.visibilityState === "visible") void execute();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    const timer = window.setInterval(refresh, 60000);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [execute, client, actor, id]);

  const current = state.key === key && state.client === client;
  return {
    status: !actor || !id ? "read-only" : current ? state.status : "loading",
    error: current ? state.error : undefined,
    refetch: execute,
  };
}
