import React, {ChangeEvent, ReactElement, useState} from 'react';
import {useAuth} from "../lib/auth";
import {useRouter} from "next/router";
import BrInput from "../components/brickroom/BrInput";
import Link from "next/link";
import KeyringGeneration from "../components/KeyringGeneration";
import VerifySeed from "../components/VerifySeed";
import devLog from "../lib/devLog";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import Layout from "../components/SignInLayout";
import {NextPageWithLayout} from "./_app";


export async function getStaticProps({locale}: any) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['signInProps', 'signUpProps'])),
        },
    };
}


const Sign_in: NextPageWithLayout = () => {
    const [isPassprhase, setIsPassphrase] = useState(false)
    const [step, setStep] = useState(0)
    const [email, setEmail] = useState('')
    const [pdfk, setPdfk] = useState('')
    const [isMailExisting, setIsMailExising] = useState(true)

    const {askKeypairoomServer, signIn} = useAuth()

    const errorMail = isMailExisting ? undefined : 'this email doesn\'t exists'
    const viaPassphrase = () => {
        setIsPassphrase(true)
        setStep(1)
    }


    const viaQuestions = () => {
        setIsPassphrase(false)
        setStep(1)
    }
    const toNextStep = async (step: number) => {
        const result = await askKeypairoomServer(email, false)
        if (await result?.keypairoomServer) {
            setPdfk(result?.keypairoomServer)
            setStep(step)
            devLog(result)
        } else {
            setIsMailExising(false)
            devLog(result)
        }
    }

    const router = useRouter()
    const {t} = useTranslation('signInProps')


    async function onSubmit(e: { preventDefault: () => void; }) {
        e.preventDefault()
    }

    return (
        <div className="h-full grid grid-cols-6 md:mt-40 mt-2">
            <div className="col-span-6 p-2 md:col-span-4 md:col-start-2 md:col-end-6">
                <h2>{t('title')}</h2>
                <div className="w-full border-y-2 h-2 my-2"/>
                {step === 0 && <><p>{t('presentation')}</p>
                    <div className="w-full border-y-2 h-2 my-2"/>

                    <div className="w-full border-y-2 h-2 my-2"/>
                    <button className="btn btn-block btn-primary" type="button"
                            onClick={() => viaPassphrase()}>{t('button1')}</button>
                    <button className="btn btn-block my-4 btn-primary" type="button"
                            onClick={() => viaQuestions()}>{t('button2')}</button>
                    <p className="flex flex-row items-center justify-between">
                        {t('register.question')}
                        <Link href={'/sign_up'}>
                            <a>{t('register.answer')}</a>
                        </Link>

                    </p>
                </>}
                {step === 1 && <>
                    <BrInput type="email" label={t('email.label')}
                             error={errorMail}
                             className={"w-full"}
                             placeholder={t('email.placeholder')}
                             onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}/>
                    {!isPassprhase && <>
                        <button className="btn btn-block" type="button" onClick={() => toNextStep(2)}>
                            {t('button4')}
                        </button>
                    </>}
                    {isPassprhase && <>
                        <button className="btn btn-block" type="button" onClick={() => toNextStep(3)}>
                            {t('button4')}
                        </button>
                    </>}
                </>}
                {step === 3 && <>
                    <VerifySeed email={email} HMAC={pdfk}/>
                </>}
                {step === 2 && <>
                    <KeyringGeneration email={email} HMAC={pdfk}/>
                </>}
            </div>
        </div>
    )
}
Sign_in.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            {page}
        </Layout>
    )
}
export default Sign_in
