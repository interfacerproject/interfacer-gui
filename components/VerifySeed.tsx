import Card, {CardWidth} from "./brickroom/Card";
import BrInput from "./brickroom/BrInput";
import React, {ChangeEvent, useState} from "react";
import useStorage from "../lib/useStorage";
import {zencode_exec} from "zenroom";
import keypairoomClientRecreateKeys from "../zenflows-crypto/src/keypairoomClientRecreateKeys";
import {useRouter} from "next/router";
import {useAuth} from "../lib/auth";

const VerifySeed = ({
                               email,
                               HMAC,
                           }: { email: string, HMAC: string }) => {
    const { signIn} = useAuth()
    const VerifySeedProps: any = {
        title: "Welcome!",
        presentation: "lorem ipsum dolor sit amet",
        label: "paste you pass phrase",
        placeholder: "state stumble clever trap excuse scheme world human above age pet jealous",
        button: "Sign in",
    }
    const [eddsaPublicKey, setEddsaPublicKey] = useState('')
    const [seed, setSeed] = useState('')
    const [error, setError] = useState('')
    const {getItem, setItem} = useStorage()
    const router = useRouter()

    const validateSeed = (seed:string) => {
        const isValid = seed.split(' ').length === 12
        if (isValid) {
            setSeed(seed)
            setError('')
        }
        else {setError('Invalid pass phrase')}
    }
    const completeSignIn = async () => {
        await signIn({email}).then(() => {window.location.replace('/logged_in')})
    }

    const onSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        const zenData = `
            {
                "seed": "${seed}",
                "seedServerSideShard.HMAC": "${HMAC}"
            }`
        await zencode_exec(keypairoomClientRecreateKeys, {data: zenData}).then(({result}) => {
                const res = JSON.parse(result)
                setItem('eddsa_public_key', res.eddsa_public_key, 'local')
                setItem('eddsa_key', res.keyring.eddsa, 'local')
                setItem('ethereum_address', res.keyring.ethereum, 'local')
                setItem('reflow', res.keyring.reflow, 'local')
                setItem('schnorr', res.keyring.schnorr, 'local')
                setItem('eddsa', res.keyring.eddsa, 'local')
                setItem('seed', res.seed, 'local')
            }).catch(()=>setError('Invalid pass phrase')).then(() => completeSignIn())
    }

    return (

            <>
                <p>{VerifySeedProps.presentation}</p>
                <form onSubmit={onSubmit}>
                    <BrInput type="text"
                             error={error}
                             label={VerifySeedProps.label}
                             placeholder={VerifySeedProps.placeholder}
                             onChange={(e: ChangeEvent<HTMLInputElement>) => validateSeed(e.target.value)}/>
                    <button className="btn btn-block" type="submit" onClick={onSubmit}>{VerifySeedProps.button}</button>
                </form>

            </>
    )
}

export default VerifySeed
