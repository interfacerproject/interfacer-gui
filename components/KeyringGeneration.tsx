import Card, {CardWidth} from "./brickroom/Card";
import BrInput from "./brickroom/BrInput";
import React, {ChangeEvent, useEffect, useState} from "react";
import useStorage from "../lib/useStorage";
import {zencode_exec} from "zenroom";
import keypairoomClient from "../zenflows-crypto/src/keypairoomClient-8-9-10-11-12";
import {useRouter} from "next/router";
import {useAuth} from "../lib/auth";
import devLog from "../lib/devLog";


const KeyringGeneration = ({
                               email,
                               name,
                               user,
                               HMAC,
                               isSignUp
                           }: { email: string, name?: string, user?: string, HMAC: string, isSignUp?:boolean }) => {
    const {signUp, generateKeys, signIn} = useAuth()
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
        question1: "Where my parents met?",
        question2: "What is the name of your first pet?",
        question3: "What is your home town?",
        question4: "What is the name of your first teacher?",
        question5: "What is the surname of your mother before wedding?"
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

    useEffect(()=>{
        devLog(error)
    }, [error])

    const onSignUp = async (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        signUp({name, user, email, eddsaPublicKey}).catch((err:string) => setError(err)).then(() => window.location.replace('/logged_in'))
    }
    const nullAnswers = [question1, question2, question3, question4, question5].reduce((nullOccs, question) => {
        return (question === 'null') ? nullOccs + 1 : nullOccs
    }, 0)

    const fillMoreAnswer = (q:string)=> {
        const filledAnswer = (q === 'null') || (q === '')
        return (notEnoughtAnswers&&filledAnswer) ? `Fill at least ${nullAnswers-2} more answers` : undefined
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

        await signIn({email}).then(() => {window.location.replace('/logged_in')}).catch((e:any) => setError(e))
    }


    return (
            <>
                {(step === 0) && <>  <p>{keyringGenProps.presentation}</p>
                <form onSubmit={onSubmit}>
                    <BrInput type="text"
                             error={fillMoreAnswer(question1)}
                             label={keyringGenProps.question1}
                             onChange={(e: ChangeEvent<HTMLInputElement>) => setQuestion1(e.target.value)}/>
                    <BrInput type="text"
                             label={keyringGenProps.question2}
                             error={fillMoreAnswer(question2)}
                             onChange={(e: ChangeEvent<HTMLInputElement>) => setQuestion2(e.target.value)}/>
                    <BrInput type="text"
                             error={fillMoreAnswer(question3)}
                             label={keyringGenProps.question3}
                             onChange={(e: ChangeEvent<HTMLInputElement>) => setQuestion3(e.target.value)}/>
                    <BrInput type="text"
                             error={fillMoreAnswer(question4)}
                             label={keyringGenProps.question4}
                             onChange={(e: ChangeEvent<HTMLInputElement>) => setQuestion4(e.target.value)}/>
                    <BrInput type="text"
                             error={fillMoreAnswer(question5)}
                             label={keyringGenProps.question5}
                             onChange={(e: ChangeEvent<HTMLInputElement>) => setQuestion5(e.target.value)}/>

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
                    {isSignUp&&<button className="btn btn-block" type="button" onClick={onSignUp}>
                        {keyringGenProps.button2}
                    </button>}
                    {!isSignUp&&<p>
                        <button className="btn btn-block" type="button" onClick={completeSignIn}>complete signin</button>
                    </p>}
                </>}
                {error !== ''&& <h5 className="text-warning">user not found: maybe wrong answers?</h5>}
            </>
    )
}

export default KeyringGeneration