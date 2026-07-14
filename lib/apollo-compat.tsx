/**
 * Apollo Client compatibility shim.
 *
 * Provides drop-in replacements for Apollo's useQuery, useMutation, gql
 * using the @dyne/interfacer-client SDK.
 *
 * Aliased via next.config.js webpack config so existing imports
 * from "@apollo/client" are redirected here.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../hooks/useAuth";

// ─── gql tag ───────────────────────────────────────────────────────

export function gql(strings: TemplateStringsArray, ...values: unknown[]): string {
  return strings.reduce((acc, str, i) => acc + str + (values[i] || ""), "");
}

// ─── useQuery ──────────────────────────────────────────────────────

export function useQuery<TData = any, TVars = Record<string, any>>(
  query: string,
  options?: {
    variables?: TVars;
    skip?: boolean;
    fetchPolicy?: string;
    nextFetchPolicy?: string;
    notifyOnNetworkStatusChange?: boolean;
    onCompleted?: (d: TData) => void;
    onError?: (e: any) => void;
  }
) {
  const { client } = useAuth();
  const [data, setData] = useState<TData | undefined>();
  const [loading, setLoading] = useState(!options?.skip);
  const [error, setError] = useState<any>(undefined);
  const mountedRef = useRef(true);

  const doFetch = useCallback(
    async (overrideVars?: Record<string, any>) => {
      if (!client || options?.skip) {
        setLoading(false);
        return { data: undefined as TData | undefined };
      }
      const v = overrideVars ?? (options?.variables as any);
      setLoading(true);
      try {
        const res = await client.graphql.request<any>(query, v);
        if (mountedRef.current) {
          if (res.errors?.length) setError(res.errors[0]);
          else {
            setData(res.data);
            setError(undefined);
          }
        }
        return { data: res.data as TData | undefined };
      } catch (e) {
        if (mountedRef.current) setError(e);
        return { data: undefined as TData | undefined };
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [client, query, JSON.stringify(options?.variables), options?.skip]
  );

  useEffect(() => {
    mountedRef.current = true;
    doFetch();
    return () => {
      mountedRef.current = false;
    };
  }, [doFetch]);

  // refetch with optional new variables (matches Apollo's refetch(newVars?) API)
  // Using Partial to allow callers to pass optional/partial variables
  const refetch = useCallback(
    async (newVars?: Partial<TVars>): Promise<ApolloQueryResult<TData>> => {
      const { data: resultData } = await doFetch(newVars as Record<string, any>);
      return { data: resultData as TData, loading: false, networkStatus: 7 };
    },
    [doFetch]
  );

  const fetchMore = useCallback(
    async (opts: { variables: Record<string, any>; updateQuery: (prev: any, result: any) => any }) => {
      if (!client) return;
      const res = await client.graphql.request<any>(query, {
        ...(options?.variables as any),
        ...opts.variables,
      });
      if (mountedRef.current && res.data) {
        setData(prev => opts.updateQuery(prev, { fetchMoreResult: res.data }));
      }
    },
    [client, query, JSON.stringify(options?.variables)]
  );

  return {
    data,
    loading,
    error,
    refetch,
    fetchMore,
    variables: options?.variables as any,
    startPolling: (_interval?: number) => {},
    stopPolling: () => {},
    subscribeToMore: () => () => {},
    networkStatus: loading ? 1 : 7,
    previousData: undefined,
  };
}

// ─── useMutation ───────────────────────────────────────────────────

export function useMutation<TData = any, TVars = any>(
  mutation: string,
  options?: {
    onCompleted?: (data: TData) => void;
    onError?: (error: any) => void;
    update?: any;
    refetchQueries?: any;
    variables?: any;
    context?: any;
  }
): [
  (options: { variables: TVars }) => Promise<{ data?: TData; errors?: any[] }>,
  { loading: boolean; error?: any; data?: TData }
] {
  const { client } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(undefined);
  const [data, setData] = useState<TData | undefined>();

  const mutate = useCallback(
    async ({ variables }: { variables: TVars }) => {
      if (!client) throw new Error("Client not ready");
      setLoading(true);
      setError(undefined);
      const res = await client.graphql.request<TData>(mutation, variables as any);
      if (res.errors?.length) {
        setError(res.errors[0]);
      } else {
        setData(res.data);
        options?.onCompleted?.(res.data as TData);
      }
      setLoading(false);
      return res;
    },
    [client, mutation]
  );

  return [mutate, { loading, error, data }];
}

// ─── ApolloProvider (no-op) ────────────────────────────────────────

export function ApolloProvider({ children }: any) {
  return children;
}

// ─── InMemoryCache, HttpLink (stubs) ───────────────────────────────

export class InMemoryCache {
  constructor(_config?: any) {}
}

export class HttpLink {
  constructor(_config?: any) {}
}

export class ApolloClient {
  constructor(_config?: any) {}
  async query<TData = any, TVars = any>(_opts: { query: string; variables?: TVars }) {
    return { data: undefined as TData | undefined };
  }
  async mutate<TData = any, TVars = any>(_opts: { mutation: string; variables?: TVars }) {
    return { data: undefined as TData | undefined };
  }
}

export type ApolloQueryResult<T> = { data: T; loading: boolean; networkStatus: number };
