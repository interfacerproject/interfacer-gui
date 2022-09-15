import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { ChangeEvent, useState } from "react";
import { zencode_exec } from "zenroom";
import { useAuth } from "../lib/auth";
import useStorage from "../lib/useStorage";
import keypairoomClientRecreateKeys from "../zenflows-crypto/src/keypairoomClientRecreateKeys";
import BrInput from "./brickroom/BrInput";

const VerifySeed = ({
    email,
    HMAC,
}: { email: string, HMAC: string }) => {
    const { signIn } = useAuth()
    const { t } = useTranslation('signInProps', { keyPrefix: 'step_passphrase' });
    const [eddsaPublicKey, setEddsaPublicKey] = useState('')
    const [seed, setSeed] = useState('')
    const [error, setError] = useState('')
    const { getItem, setItem } = useStorage()
    const router = useRouter()

    const validateSeed = (seed: string) => {
        const isValid = seed.split(' ').length === 12
        if (isValid) {
            setSeed(seed)
            setError('')
        }
        else { setError(t('error')) }
    }
    const completeSignIn = async () => {
        await signIn({ email }).then(() => { window.location.replace('/logged_in') }).catch((error:any)=>setError(t('error')))
    }

    const onSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        const zenData = `
            {
                "seed": "${seed}",
                "seedServerSideShard.HMAC": "${HMAC}"
            }`
        await zencode_exec(keypairoomClientRecreateKeys, { data: zenData }).then(({ result }) => {
            const res = JSON.parse(result)
            setItem('eddsa_public_key', res.eddsa_public_key, 'local')
            setItem('eddsa_key', res.keyring.eddsa, 'local')
            setItem('ethereum_address', res.keyring.ethereum, 'local')
            setItem('reflow', res.keyring.reflow, 'local')
            setItem('schnorr', res.keyring.schnorr, 'local')
            setItem('eddsa', res.keyring.eddsa, 'local')
            setItem('seed', res.seed, 'local')
        }).catch(() => setError(t("error"))).then(() =>{ completeSignIn()})
    }

    return (

        <>
            <p className="mt-4 mb-6">{t('subtitle')}</p>
            <form onSubmit={onSubmit}>
                <BrInput type="text"
                    error={error}
                    label={t("label")}
                    placeholder={t("placeholder")}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => validateSeed(e.target.value)} />
                <p className="text-[#8A8E96] mb-6">{t('help_text')}</p>
                <button className="btn btn-block btn-accent" type="submit" onClick={onSubmit}>{t('button')}</button>
            </form>

        </>
    )
}

export default VerifySeed
