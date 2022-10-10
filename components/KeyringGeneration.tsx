import { useTranslation } from "next-i18next";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useAuth } from "../lib/auth";
import devLog from "../lib/devLog";
import useStorage from "../lib/useStorage";
import BrInput from "./brickroom/BrInput";

const KeyringGeneration = ({
    email,
    name,
    user,
    HMAC,
    isSignUp,
}: {
    email: string;
    name?: string;
    user?: string;
    HMAC: string;
    isSignUp?: boolean;
}) => {
    const { signUp, generateKeys, login } = useAuth();
    const { t } = useTranslation(["signInProps"], {
        keyPrefix: "step_questions",
    });
    const [eddsaPublicKey, setEddsaPublicKey] = useState("");
    const [seed, setSeed] = useState("");
    const [question1, setQuestion1] = React.useState("null");
    const [question2, setQuestion2] = React.useState("null");
    const [question3, setQuestion3] = React.useState("null");
    const [question4, setQuestion4] = React.useState("null");
    const [question5, setQuestion5] = React.useState("null");
    const [step, setStep] = useState(0);
    const [error, setError] = useState("");
    const [notEnoughtAnswers, setNotEnoughtAnswers] = React.useState(false);
    const { getItem } = useStorage();

    const mapQuestions: (
        question: number
    ) => { question: string; setQuestion: Function } | undefined = (
        question
    ) => {
        switch (question) {
            case 1:
                return { question: question1, setQuestion: setQuestion1 };
            case 2:
                return { question: question2, setQuestion: setQuestion2 };
            case 3:
                return { question: question3, setQuestion: setQuestion3 };
            case 4:
                return { question: question4, setQuestion: setQuestion4 };
            case 5:
                return { question: question5, setQuestion: setQuestion5 };
        }
    };

    useEffect(() => {
        devLog(error);
    }, [error]);

    const onSignUp = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        signUp({
            name,
            user,
            email,
            eddsaPublicKey,
        })
            .catch((err: string) => setError(err))
            .then(() => window.location.replace("/logged_in"));
    };
    const nullAnswers = [
        question1,
        question2,
        question3,
        question4,
        question5,
    ].reduce((nullOccs, question) => {
        return question === "null" ? nullOccs + 1 : nullOccs;
    }, 0);

    const fillMoreAnswer = (q: string) => {
        const filledAnswer = q === "null" || q === "";
        return notEnoughtAnswers && filledAnswer
            ? `Fill at least ${nullAnswers - 2} more answers`
            : undefined;
    };

    const onSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        if (nullAnswers > 2) {
            setNotEnoughtAnswers(true);
        } else {
            generateKeys({
                question1,
                question2,
                question3,
                question4,
                question5,
                email,
                HMAC,
            }).then(() => {
                setEddsaPublicKey(getItem("eddsa_public_key"));
                setSeed(getItem("seed"));
                setStep(1);
            });
        }
    };

    const completeSignIn = async (e: { preventDefault: () => void }) => {
        e.preventDefault();

        await login({ email })
            .then(() => {
                window.location.replace("/logged_in");
            })
            .catch((e: any) => setError(e));
    };

    return (
        <>
            {/* Step 0 – Asking questions */}
            {step === 0 && (
                <>
                    {/* Presentation text */}

                    {isSignUp && <h2>{t("keyring_title")}</h2>}

                    <p className="mt-4 mb-6">
                        {isSignUp ? t("subtitle_signup") : t("subtitle")}
                    </p>

                    {isSignUp && (
                        <p className="mb-4 font-semibold text-primary">
                            {t("hint")}
                        </p>
                    )}

                    {/* The form with the questions */}
                    <form onSubmit={onSubmit}>
                        {/* Iterating over "questions" to display fields */}
                        {[]
                            .concat(t("questions", { returnObjects: true }))
                            .map((question: string, index: number) => (
                                <BrInput
                                    type="text"
                                    key={index}
                                    error={fillMoreAnswer(
                                        mapQuestions(index + 1)!.question
                                    )}
                                    label={question}
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>
                                    ) =>
                                        mapQuestions(index + 1)!.setQuestion(
                                            e.target.value
                                        )
                                    }
                                />
                            ))}

                        {/* Submit button */}
                        <button
                            className="mt-4 btn btn-block btn-accent"
                            type="submit"
                        >
                            {t("button")}
                        </button>
                    </form>
                </>
            )}

            {/* Step 1 – Showing passphrase */}
            {step === 1 && (
                <>
                    {/* Section text */}
                    {isSignUp && (
                        <>
                            <h2>{t("passphrase_title")}</h2>
                            <p className="mt-4 mb-6">
                                {t("subtitle_passphrase")}
                            </p>
                        </>
                    )}

                    {/* The seed – List of words */}
                    <p className="mt-4 mb-6">
                        {t("reminder")}
                        <br />
                        <span className="block p-4 mt-2 font-mono bg-white border rounded-md">
                            {seed}
                        </span>
                    </p>

                    {/* ↓ SignUp / SignIn – Buttons ↓ */}

                    {/* SignUp-register button */}
                    <p className="text-[#8A8E96] mb-6">{t("help_text_2")}</p>
                    {isSignUp && (
                        <button
                            className="btn btn-block btn-accent"
                            type="button"
                            onClick={onSignUp}
                        >
                            {t("button_2")}
                        </button>
                    )}
                    {/* LoginButton */}
                    {!isSignUp && (
                        <p>
                            <button
                                className="btn btn-block btn-accent"
                                type="button"
                                onClick={completeSignIn}
                            >
                                {t("continue_button")}
                            </button>
                        </p>
                    )}
                </>
            )}

            {/* Error message */}
            {error !== "" && <h5 className="text-warning">{t("error")}</h5>}
        </>
    );
};

export default KeyringGeneration;
