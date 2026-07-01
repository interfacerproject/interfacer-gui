/**
 * Apollo Client replacement — delegates to @dyne/interfacer-client SDK.
 */
import { GraphQLClient, createMemoryStorage } from "@dyne/interfacer-client";

let _client: GraphQLClient | null = null;

function getClient(): GraphQLClient {
  if (!_client) {
    _client = new GraphQLClient(
      { zenflowsUrl: process.env.NEXT_PUBLIC_ZENFLOWS_URL || "" },
      createMemoryStorage(),
      false
    );
  }
  return _client;
}

const createApolloClient = (_withSignedCalls = false) => {
  const gqlClient = getClient();
  return {
    query: async function <TData = any, TVars = any>(opts: { query: string; variables?: TVars }) {
      return gqlClient.request<TData>(opts.query, opts.variables as any);
    },
    mutate: async function <TData = any, TVars = any>(opts: { mutation: string; variables?: TVars }) {
      return gqlClient.request<TData>(opts.mutation, opts.variables as any);
    },
    watchQuery: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
    subscribe: () => ({ unsubscribe: () => {} }),
  };
};

export default createApolloClient;
