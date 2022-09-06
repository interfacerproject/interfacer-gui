import React, {ChangeEvent, useState} from 'react';
import {useAuth} from "../lib/auth";
import {useRouter} from "next/router";
import Card, {CardWidth} from "../components/brickroom/Card";
import BrInput from "../components/brickroom/BrInput";
import Link from "next/link";
import KeyringGeneration from "../components/KeyringGeneration";
import VerifySeed from "../components/VerifySeed";
import devLog from "../lib/devLog";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";


export async function getStaticProps({ locale }:any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['signInProps'])),
    },
  };
}

export default function Sign_in() {
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
    const toNextStep = async (step:number) => {
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
        <div className="h-screen bg-cover" style={{['backgroundImage' as any]: "url('https://www.interfacerproject.eu/assets/index/ABOUT.png')"}}>
            <div className="container mx-auto h-screen grid place-items-center">
                <Card title={t('title')}
                      width={CardWidth.LG}
                      className="px-16 py-[4.5rem]">
                    <>
                        {step === 0 && <><p>{t('presentation')}</p>
                            <button className="btn btn-block" type="button"
                                    onClick={() => viaPassphrase()}>{t('button1')}</button>
                            <button className="btn btn-block my-4" type="button"
                                    onClick={() => viaQuestions()}>{t('button2')}</button>
                            <Link href={'/sign_up'}>
                                <a className="btn btn-block">{t('button3')}</a>
                            </Link></>}
                        {step === 1 && <>
                            <BrInput type="email" label={t('email.label')}
                                     error={errorMail}
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
                    </>
                </Card>
            </div>
        </div>
    )
}