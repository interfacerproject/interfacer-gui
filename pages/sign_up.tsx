import React, {ChangeEvent, ReactElement, useState, useTransition} from 'react';
import {useAuth} from "../lib/auth";
import {useRouter} from "next/router";
import BrInput from "../components/brickroom/BrInput";
import {LinkIcon} from "@heroicons/react/solid";
import KeyringGeneration from "../components/KeyringGeneration";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import Layout from "../components/SignInLayout";
import {NextPageWithLayout} from "./_app";
import Link from "next/link";

export async function getStaticProps({locale}: any) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['signUpProps'])),
        },
    };
}

const SignUp: NextPageWithLayout = () => {
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
        <div className="h-full grid grid-cols-6 md:mt-40 mt-2">
            <div className="col-span-6 p-2 md:col-span-4 md:col-start-2 md:col-end-6">
                <h2>{t('title')}</h2>
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
                        <button className={`btn btn-block btn-primary ${isButtonEnabled}`}
                                type="submit">{t('button')}</button>
                    </form>
                    <p className="flex flex-row items-center justify-between">
                        <span className="flex-auto"> {t('register.question')}</span>
                        <Link href={'/sign_in'}>
                            <a className="flex flex-row">
                                <LinkIcon className='h-5 w-5'/>
                                {t('register.answer')}
                            </a>
                        </Link>
                    </p>
                </>}
                {(step === 1) &&
                <KeyringGeneration email={email} user={user} name={name} HMAC={HMAC} isSignUp={true}/>}
            </div>
        </div>
    )
}
SignUp.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            {page}
        </Layout>
    )
}
export default SignUp

