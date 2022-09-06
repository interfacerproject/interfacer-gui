import React, {useState, useContext, createContext, useEffect} from 'react'
import {
    ApolloProvider,
    ApolloClient,
    InMemoryCache,
    HttpLink,
    gql,
    concat
} from '@apollo/client'

import useStorage from "./useStorage";
import SignRequest from "./SignRequest";
import {setContext} from "@apollo/client/link/context";
import {zencode_exec} from "zenroom";
import keypairoomClient from "../zenflows-crypto/src/keypairoomClient-8-9-10-11-12";
import devLog from "./devLog";


// @ts-ignore
const authContext: any = createContext()

export function AuthProvider({children}: any) {
    const auth = useProvideAuth()

    return (
        <authContext.Provider value={auth}>
            <ApolloProvider client={auth.createApolloClient()}>
                {children}
            </ApolloProvider>
        </authContext.Provider>
    )
}

export const useAuth: any = () => {
    return useContext(authContext)
}


const headersMiddleware = setContext(async (operation, {headers}) => {
        const {getItem} = useStorage()
        const variables = operation.variables
        const query = operation.query.loc?.source.body!
        const completeHeaders = await SignRequest({query, variables}).then(({result, logs}) => {
            devLog('signing request...')
            devLog(logs)
            devLog('result',result)
            return{
            ...headers,
            'zenflows-sign': JSON.parse(result).eddsa_signature,
            'zenflows-user': getItem('authUsername', 'local'),
            'zenflows-hash': JSON.parse(result).hash
        }})
        return {headers: completeHeaders}
    }
);

function useProvideAuth() {
    const {getItem, setItem} = useStorage()
    const [authToken, setAuthToken] = useState(null as string | null)
    const storedEddsaKey = getItem('eddsa_key', 'local') !== '' ? getItem('eddsa_key', 'local') : null
    useEffect(() => setAuthToken(storedEddsaKey), [])
    const [authId, setAuthId] = useState(null as string | null)
    const storedAuthId = getItem('authId', 'local') !== '' ? getItem('authId', 'local') : null
    useEffect(() => setAuthId(storedAuthId), [])
    const [authUsername, setAuthUsername] = useState(null as string | null)
    const storedAuthUsername = getItem('authUsername', 'local') !== '' ? getItem('authUsername', 'local') : null
    useEffect(() => setAuthUsername(storedAuthUsername), [])
    const [authEmail, setAuthEmail] = useState(null as string | null)
    const storedAuthEmail = getItem('authEmail', 'local') !== '' ? getItem('authEmail', 'local') : null
    useEffect(() => setAuthEmail(storedAuthEmail), [])
    const [authName, setAuthName] = useState(null as string | null)
    const storedAuthName = getItem('authName', 'local') !== '' ? getItem('authName', 'local') : null
    useEffect(() => setAuthName(storedAuthName), [])


    const isSignedIn = () => {
        if (authId) {
            return true
        } else {
            return false
        }
    }

    const getAuthHeaders = () => {
        return null
    }


    const createApolloClient = () => {
        const link = new HttpLink({
            uri: 'http://65.109.11.42:8000/api',
            headers: getAuthHeaders(),
        })

        return new ApolloClient({
            link: isSignedIn() ? concat(headersMiddleware, link) : link,
            ssrMode: typeof window === 'undefined',
            cache: new InMemoryCache({
                addTypename: false
            }),

        })
    }

    const askKeypairoomServer = async (email: string, firstRegistration: boolean) => {
        const client = createApolloClient()
        const KEYPAIROOM_SERVER_MUTATION = gql`mutation {
  keypairoomServer(firstRegistration: ${firstRegistration}, userData: "{\\"email\\": \\"${email}\\"}")
}
        `
        return await client.mutate({mutation: KEYPAIROOM_SERVER_MUTATION})
            .then(({data}) => data)
            .catch((error) => {
                if (`${error}`.includes("email doesn't exists")) {
                    return "email doesn't exists"
                } else if (`${error}`.includes("email exists")) {
                    return "email has already been registered"
                }
            })
    }

    const generateKeys = async ({
                                    question1,
                                    question2,
                                    question3,
                                    question4,
                                    question5,
                                    email,
                                    HMAC
                                }: { question1: string, question2: string, question3: string, question4: string, question5: string, email: string, HMAC: string }) => {
        const zenData = `
            {
                "userChallenges": {
                    "whereParentsMet":"${question1}",
                    "nameFirstPet":"${question2}",
                    "nameFirstTeacher":"${question3}",
                    "whereHomeTown":"${question4}",
                    "nameMotherMaid":"${question5}",
                },
                "username": "${email}",
                "seedServerSideShard.HMAC": "${HMAC}"
            }`


        return await zencode_exec(keypairoomClient, {data: zenData})
            .then(({result}) => {
                const res = JSON.parse(result)
                setItem('eddsa_public_key', res.eddsa_public_key, 'local')
                setItem('eddsa_key', res.keyring.eddsa, 'local')
                setItem('ethereum_address', res.keyring.ethereum, 'local')
                setItem('reflow', res.keyring.reflow, 'local')
                setItem('schnorr', res.keyring.schnorr, 'local')
                setItem('eddsa', res.keyring.eddsa, 'local')
                setItem('seed', res.seed, 'local')
            })
    }


    const signIn = async ({email}: { email: string }) => {
        const client = createApolloClient()
        const SignInMutation = gql`query ($email: String!  $pubkey: String!) {
                                      personExists(email: $email, eddsaPublicKey: $pubkey) {
                                        name
                                        user
                                        email
                                        id
                                      }
                                    }`
        const result = await client.query({
            query: SignInMutation,
            variables: {email, pubkey: getItem('eddsa_public_key', 'local')}
        })
            .then(({data}) => {
                setItem('authId', data?.personExists.id, 'local')
                setItem('authName', data?.personExists.name, 'local')
                setItem('authUsername', data?.personExists.user, 'local')
                setItem('authEmail', data?.personExists.email, 'local')
            })
    }

    const signUp = async ({
                              name,
                              user,
                              email,
                              eddsaPublicKey
                          }: { name: string, user: string, email: string, eddsaPublicKey: string }) => {
        const client = createApolloClient()
        const SignUpMutation = gql`mutation  {
              createPerson(person: {
                name: "${name}"
                user: "${user}"
                email: "${email}"
                eddsaPublicKey: "${eddsaPublicKey}"
              }) {
              agent{
                id
                name
                user
                email
                eddsaPublicKey
              }
              }
            }`

        const result = await client.mutate({
            mutation: SignUpMutation,
            context: {headers: {'zenflows-admin': 'b4a7a8b0a87a8df133ceded44a5c624f1dae19024d72f931b65122a8463a69e6be7ae8bbd51a330182fde04e3e441371a051c7c800147837f31dff27c78cf246'}}
        }).then(({data}) => {
            setItem('authId', data?.createPerson.agent.id, 'local')
            setItem('authName', data?.createPerson.agent.name, 'local')
            setItem('authUsername', data?.createPerson.agent.user, 'local')
            setItem('authEmail', data?.createPerson.agent.email, 'local')
        })
    }

    const signOut = () => {
        setAuthToken(null)
        setItem('eddsa_public_key', '', 'local')
        setItem('eddsa_key', '', 'local')
        setItem('ethereum_address', '', 'local')
        setItem('reflow', '', 'local')
        setItem('schnorr', '', 'local')
        setItem('eddsa', '', 'local')
        setItem('seed', '', 'local')
        setItem('authId', '', 'local')
        setItem('authName', '', 'local')
        setItem('authEmail', '', 'local')
        setItem('authUsername', '', 'local')
        window.location.replace('/')
    }

    return {
        setAuthToken,
        isSignedIn,
        generateKeys,
        signUp,
        signOut,
        createApolloClient,
        askKeypairoomServer,
        signIn,
        authId,
        authUsername,
        authEmail,
        authName
    }
}