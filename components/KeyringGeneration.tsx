import Card, {CardWidth} from "./brickroom/Card";
import BrInput from "./brickroom/BrInput";
import React, {ChangeEvent, useEffect, useState} from "react";
import useStorage from "../lib/useStorage";
import {zencode_exec} from "zenroom";
import keypairoomClient from "../zenflows-crypto/src/keypairoomClient-8-9-10-11-12";
import {useRouter} from "next/router";
import {useAuth} from "../lib/auth";
import devLog from "../lib/devLog";
import {useTranslation} from "next-i18next";

type Question = string;


const KeyringGeneration = ({
                               email,
                               name,
                               user,
                               HMAC,
                               isSignUp
                           }: { email: string, name?: string, user?: string, HMAC: string, isSignUp?: boolean }) => {
    const {signUp, generateKeys, signIn} = useAuth()
    const {t} = useTranslation('signUpProps')
    const keyringGenProps: any = {
        title: "Welcome!",
        presentation: "Answer at least three question",
        email: {
            label: "Email",
            placeholder: "alice@email.com"
        },
        register: {
            question: "",
            answer: ""
        },
        button: "Check",
        button2: "Sign Up",
    }
    const [eddsaPublicKey, setEddsaPublicKey] = useState('')
    const [seed, setSeed] = useState('')
    const [question1, setQuestion1] = React.useState('null')
    const [question2, setQuestion2] = React.useState('null')
    const [question3, setQuestion3] = React.useState('null')
    const [question4, setQuestion4] = React.useState('null')
    const [question5, setQuestion5] = React.useState('null')
    const [step, setStep] = useState(0)
    const [error, setError] = useState('')
    const [notEnoughtAnswers, setNotEnoughtAnswers] = React.useState(false)
    const {getItem, setItem} = useStorage()
    const router = useRouter()

    const mapQuestions: (question:number)=>{question:string, setQuestion:Function} | undefined = (question) => {
        switch (question) {
            case 1:
                return {question:question1, setQuestion:setQuestion1}
            case 2:
                return {question:question2, setQuestion:setQuestion2}
            case 3:
                return {question:question3, setQuestion:setQuestion3}
            case 4:
                return {question:question4, setQuestion:setQuestion4}
            case 5:
                return {question:question5, setQuestion:setQuestion5}
        }
    }

    useEffect(() => {
        devLog(error)
    }, [error])

    const onSignUp = async (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        signUp({
            name,
            user,
            email,
            eddsaPublicKey
        }).catch((err: string) => setError(err)).then(() => window.location.replace('/logged_in'))
    }
    const nullAnswers = [question1, question2, question3, question4, question5].reduce((nullOccs, question) => {
        return (question === 'null') ? nullOccs + 1 : nullOccs
    }, 0)

    const fillMoreAnswer = (q: string) => {
        const filledAnswer = (q === 'null') || (q === '')
        return (notEnoughtAnswers && filledAnswer) ? `Fill at least ${nullAnswers - 2} more answers` : undefined
    }

    const onSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        if (nullAnswers > 2) {
            setNotEnoughtAnswers(true)
        } else {
            generateKeys({question1, question2, question3, question4, question5, email, HMAC}).then(() => {
                setEddsaPublicKey(getItem('eddsa_public_key', 'local'))
                setSeed(getItem('seed', 'local'))
                setStep(1)
            })
        }
    }

    const completeSignIn = async (e: { preventDefault: () => void; }) => {
        e.preventDefault()

        await signIn({email}).then(() => {
            window.location.replace('/logged_in')
        }).catch((e: any) => setError(e))
    }


    return (
        <>
            {(step === 0) && <>  <p>{keyringGenProps.presentation}</p>
                <form onSubmit={onSubmit}>
                    {[].concat(t('questions', {returnObjects: true})).map((question: string, index: number) =>
                        <BrInput type="text"
                                 key={index}
                                 error={fillMoreAnswer(mapQuestions(index + 1)!.question)}
                                 label={question}
                                 onChange={(e: ChangeEvent<HTMLInputElement>) => mapQuestions(index + 1)!.setQuestion(e.target.value)}/>)}
                    <button className="btn btn-block" type="submit">{keyringGenProps.button}</button>
                </form>
                <p className="flex flex-row items-center justify-between">
                    {keyringGenProps.register.question}
                    {keyringGenProps.register.answer}
                </p></>}
            {(step === 1) && <>
                <p>
                    <b>passphrase:</b> {seed}
                </p>
                {isSignUp && <button className="btn btn-block" type="button" onClick={onSignUp}>
                    {keyringGenProps.button2}
                </button>}
                {!isSignUp && <p>
                    <button className="btn btn-block" type="button" onClick={completeSignIn}>complete signin</button>
                </p>}
            </>}
            {error !== '' && <h5 className="text-warning">user not found: maybe wrong answers?</h5>}
        </>
    )
}

export default KeyringGeneration
