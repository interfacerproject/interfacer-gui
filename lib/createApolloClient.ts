import { setContext } from "@apollo/client/link/context";
import { zencode_exec } from "zenroom";
import sign from "../zenflows-crypto/src/sign_graphql";
import useStorage from "../hooks/useStorage";

import {
    ApolloClient, concat, HttpLink, InMemoryCache
} from '@apollo/client';

const headersMiddleware = setContext(async (operation, { headers }) => {
    const { getItem } = useStorage()
    const variables = operation.variables
    const query = operation.query.loc?.source.body!
    const signRequest = async ({ query, variables }: { query: string, variables?: any }) => {
        const body = `{"variables":${JSON.stringify(variables)},"query":"${query}"}`

        const zenKeys = `{"keyring": {"eddsa": "${getItem('eddsa_key')}"}}`
        const zenData = `{"gql": "${Buffer.from(body, 'utf8').toString('base64')}",} `
        return await zencode_exec(sign(), { data: zenData, keys: zenKeys })
    }
    const completeHeaders = await signRequest({ query, variables }).then(({ result, logs }) => {
        return {
            ...headers,
            'zenflows-sign': JSON.parse(result).eddsa_signature,
            'zenflows-user': getItem('authUsername'),
            'zenflows-hash': JSON.parse(result).hash
        }
    })
    return { headers: completeHeaders }
});


const createApolloClient = (withSignedCalls = false) => {
    const link = new HttpLink({ uri: process.env.NEXT_PUBLIC_ZENFLOWS_URL });

    return new ApolloClient({
        link: withSignedCalls ? concat(headersMiddleware, link) : link,
        ssrMode: typeof window === 'undefined',
        cache: new InMemoryCache({
            addTypename: false
        }),

    })
}

export default createApolloClient;