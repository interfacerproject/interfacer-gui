import { LinkIcon } from "@heroicons/react/solid";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, ReactElement, useState } from 'react';
import BrInput from "../components/brickroom/BrInput";
import KeyringGeneration from "../components/KeyringGeneration";
import Layout from "../components/SignInLayout";
import VerifySeed from "../components/VerifySeed";
import { useAuth } from "../lib/auth";
import devLog from "../lib/devLog";
import { NextPageWithLayout } from "./_app";

export async function getStaticProps({ locale }: any) {
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

    const { askKeypairoomServer, signIn } = useAuth()

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
    const { t } = useTranslation('signInProps')


    async function onSubmit(e: { preventDefault: () => void; }) {
        e.preventDefault()
    }

    return (
        <div className="grid h-full grid-cols-6">
            <div className="col-span-6 p-2 md:col-span-4 md:col-start-2 md:col-end-6">
                <div className="w-full h-full pt-56">
                    {(step === 0 || step === 1) && <div>
                        <h2>{t('title_step_0')}</h2>
                        <p className="mt-2 mb-6">{t('presentation')}</p>

                        {step === 0 &&
                            <>
                                <button className="btn btn-block btn-primary" type="button"
                                    onClick={() => viaPassphrase()}>{t('button1')}</button>
                                <button className="mt-4 btn btn-block btn-primary" type="button"
                                    onClick={() => viaQuestions()}>{t('button2')}</button>
                            </>
                        }

                        {step === 1 &&
                            <>
                                <BrInput type="email" label={t('email.label')}
                                    error={errorMail}
                                    className={"w-full"}
                                    placeholder={t('email.placeholder')}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
                                <p className="text-[#8A8E96] mb-6">{t('help_text_step_1')}</p>
                                <button className="btn btn-block btn-primary" type="button" onClick={() => toNextStep(isPassprhase ? 3 : 2)}>
                                    {t('button4')}
                                </button>
                            </>
                        }

                        <p className="flex flex-row items-center mt-6">
                            <span>{t('register.question')}</span>
                            <Link href={'/sign_up'}>
                                <a className="flex flex-row font-semibold">
                                    <LinkIcon className='w-5 h-5 mx-2' />
                                    {t('register.answer')}</a>
                            </Link>
                        </p>
                    </div>}

                    {step === 2 && <>
                        <h2>{t('step_questions.title')}</h2>
                        <KeyringGeneration email={email} HMAC={pdfk} />
                    </>}
                    {step === 3 && <>
                        <h2>{t('step_passphrase.title')}</h2>
                        <VerifySeed email={email} HMAC={pdfk} />
                    </>}
                </div>
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
