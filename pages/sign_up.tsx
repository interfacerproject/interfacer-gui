import React, {ChangeEvent, useState, useTransition} from 'react';
import {useAuth} from "../lib/auth";
import {useRouter} from "next/router";
import Card, {CardWidth} from "../components/brickroom/Card";
import BrInput from "../components/brickroom/BrInput";
// import {LinkIcon} from "@heroicons/react/solid";
import KeyringGeneration from "../components/KeyringGeneration";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";

export async function getStaticProps({ locale }:any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['signUpProps'])),
    },
  };
}

export default function SignUp() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [user, setUser] = useState('')
    const [step, setStep] = useState(0)
    const [HMAC, setHMAC] = useState('')
    const [yetRegisteredEmail, setYetRegisteredEmail] = useState('')
    const [emailValid, setEmailValid] = useState('')
    const {t} = useTranslation('signUpProps')

    const router = useRouter()

    const {signUp, askKeypairoomServer} = useAuth()

    async function onSubmit(e: { preventDefault: () => void; }) {
        e.preventDefault()
        setStep(1)
    }

    async function verifyEmail({email}: { email: string }) {
        const result = await askKeypairoomServer(email, true, name)
        if (result?.keypairoomServer) {
            setYetRegisteredEmail('')
            if (email.includes('@')) {
                setEmailValid('✅ email is free')
            } else {
                setEmailValid('')
            }
            setEmail(email)
            setHMAC(result.keypairoomServer)
        } else {
            setEmailValid('')
            setYetRegisteredEmail(result)
        }
    }

    const isButtonEnabled = (HMAC === '') ? 'btn-disabled' : ''

    return (
        <div className="mx-auto h-screen grid place-items-center bg-cover" style={{['backgroundImage' as any]: "url('https://www.interfacerproject.eu/assets/index/ABOUT.png')"}}>
            <Card title={t('title')}
                  width={CardWidth.LG}
                  className="px-16 py-[4.5rem]">
                {(step === 0) && <>
                    <p>{t('presentation')}</p>
                    <form onSubmit={onSubmit}>
                        <BrInput type="email"
                                 error={yetRegisteredEmail}
                                 hint={emailValid}
                                 placeholder={t('email.placeholder')}
                                 label={t('email.label')}
                                 onBlur={(e: ChangeEvent<HTMLInputElement>) => verifyEmail({email: e.target.value})}
                        />
                        <BrInput type="text"
                                 label={t('name.label')}
                                 placeholder={t('name.placeholder')}
                                 onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}/>
                        <BrInput type="text"
                                 placeholder={t('user.placeholder')}
                                 label={t('user.label')}
                                 onChange={(e: ChangeEvent<HTMLInputElement>) => setUser(e.target.value)}
                        />
                        <button className={`btn btn-block ${isButtonEnabled}`}
                                type="submit">{t('button')}</button>
                    </form>
                    <p className="flex flex-row items-center justify-between">
                        {t('register.question')}
                        {/* <LinkIcon className='h-5 w-5 ml-28'/> */}
                        {t('register.answer')}
                    </p>
                </>}
                {(step === 1) &&
                <KeyringGeneration email={email} user={user} name={name} HMAC={HMAC} isSignUp={true}/>}
            </Card>
        </div>
    )
}
