// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

/**
 * Apollo compatibility layer for interfacer-gui migration.
 *
 * Components deeply integrated with Apollo's useQuery/useMutation can
 * use these hooks as a drop-in replacement while we migrate to the SDK.
 *
 * This layer wraps the SDK's GraphQLClient into Apollo-compatible hooks.
 */

import { useAuth } from "hooks/useAuth";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── useQuery replacement ──────────────────────────────────────────

interface QueryResult<TData> {
  data?: TData;
  loading: boolean;
  error?: Error;
  refetch: () => Promise<void>;
}

/**
 * Drop-in replacement for Apollo's useQuery.
 * Executes a raw GraphQL query via the SDK's GraphQLClient.
 */
export function useSdkQuery<TData = any>(
  query: string,
  options?: { variables?: Record<string, any>; skip?: boolean }
): QueryResult<TData> {
  const { client } = useAuth();
  const [data, setData] = useState<TData | undefined>();
  const [loading, setLoading] = useState(!options?.skip);
  const [error, setError] = useState<Error | undefined>();
  const mountedRef = useRef(true);

  const execute = useCallback(async () => {
    if (!client || options?.skip) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await client.graphql.request<TData>(query, options?.variables);
      if (mountedRef.current) {
        if (res.errors?.length) {
          setError(new Error(res.errors[0]!.message));
        } else {
          setData(res.data);
          setError(undefined);
        }
      }
    } catch (e) {
      if (mountedRef.current) setError(e as Error);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [client, query, JSON.stringify(options?.variables), options?.skip]);

  useEffect(() => {
    mountedRef.current = true;
    execute();
    return () => {
      mountedRef.current = false;
    };
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

// ─── useMutation replacement ────────────────────────────────────────

type MutationFn<TVariables = any> = (options: {
  variables: TVariables;
}) => Promise<{ data?: any; errors?: Array<{ message: string }> }>;

/**
 * Drop-in replacement for Apollo's useMutation.
 */
export function useSdkMutation<TVariables = any>(
  mutation: string
): [MutationFn<TVariables>, { loading: boolean; error?: Error }] {
  const { client } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const mutate: MutationFn<TVariables> = useCallback(
    async ({ variables }) => {
      if (!client) throw new Error("Client not ready");
      setLoading(true);
      setError(undefined);
      try {
        const res = await client.graphql.request(mutation, variables);
        if (res.errors?.length) {
          const err = new Error(res.errors[0]!.message);
          setError(err);
          return res;
        }
        return res;
      } catch (e) {
        const err = e as Error;
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, mutation]
  );

  return [mutate, { loading, error }];
}
