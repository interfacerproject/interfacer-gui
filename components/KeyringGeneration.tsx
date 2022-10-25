import { useTranslation } from "next-i18next";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import useStorage from "../hooks/useStorage";
import devLog from "../lib/devLog";
import BrInput from "./brickroom/BrInput";

const KeyringGeneration = ({
  email,
  name = "",
  user = "",
  HMAC,
  isSignUp,
}: {
  email: string;
  name?: string;
  user?: string;
  HMAC: string;
  isSignUp?: boolean;
}) => {
  const { signup, keypair, login } = useAuth();
  const { t } = useTranslation("signInProps");
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

  const mapQuestions: (question: number) => { question: string; setQuestion: Function } | undefined = question => {
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
    signup({
      name,
      user,
      email,
      eddsaPublicKey,
    })
      .catch((err: string) => setError(err))
      .then(() => window.location.replace("/"));
  };
  const nullAnswers = [question1, question2, question3, question4, question5].reduce((nullOccs, question) => {
    return question === "null" ? nullOccs + 1 : nullOccs;
  }, 0);

  const fillMoreAnswer = (q: string) => {
    const filledAnswer = q === "null" || q === "";
    return notEnoughtAnswers && filledAnswer ? `Fill at least ${nullAnswers - 2} more answers` : undefined;
  };

  const onSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (nullAnswers > 2) {
      setNotEnoughtAnswers(true);
    } else {
      keypair({
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
        window.location.replace("/");
      })
      .catch((e: any) => setError(e));
  };
  const questionsArray = [
    t("Where my parents met?"),
    t("What is the name of your first pet?"),
    t("What is your home town?"),
    t("What is the name of your first teacher?"),
    t("What is the surname of your mother before wedding?"),
  ];

  return (
    <>
      {/* Step 0 – Asking questions */}
      {step === 0 && (
        <>
          {/* Presentation text */}

          {isSignUp && <h2>{t("Answer to these questions to complete your signup 🧩")}</h2>}

          <p className="mt-4 mb-6">
            {isSignUp
              ? t(
                  "You will have to remember the answers and keep them for later as they are necessary for the log in&#46;"
                )
              : t("Answer the questions that you answered during the signup process")}
          </p>

          {isSignUp && <p className="mb-4 font-semibold text-primary">{t("Answer to at least 3 questions&#46;")}</p>}

          {/* The form with the questions */}
          <form onSubmit={onSubmit}>
            {/* Iterating over "questions" to display fields */}
            {questionsArray.map((question: string, index: number) => (
              <BrInput
                name={question}
                type="text"
                key={index}
                error={fillMoreAnswer(mapQuestions(index + 1)!.question)}
                label={question}
                onChange={(e: ChangeEvent<HTMLInputElement>) => mapQuestions(index + 1)!.setQuestion(e.target.value)}
              />
            ))}

            {/* Submit button */}
            <button className="mt-4 btn btn-block btn-accent" type="submit">
              {t("Login")}
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
              <h2>{t("")}</h2>
              <p className="mt-4 mb-6">{t("")}</p>
            </>
          )}

          {/* The seed – List of words */}
          <p className="mt-4 mb-6">
            {t("Your passprhase is: ")}
            <br />
            <span className="block p-4 mt-2 font-mono bg-white border rounded-md">{seed}</span>
          </p>

          {/* ↓ SignUp / SignIn – Buttons ↓ */}

          {/* SignUp-register button */}
          <p className="text-[#8A8E96] mb-6">
            {t("This passphrase is generated and are not stored on the server&#46; Keep a copy of it&#46;")}
          </p>
          {isSignUp && (
            <button className="btn btn-block btn-accent" type="button" onClick={onSignUp}>
              {t("Login")}
            </button>
          )}
          {/* LoginButton */}
          {!isSignUp && (
            <p>
              <button className="btn btn-block btn-accent" type="button" onClick={completeSignIn}>
                {t("Login")}
              </button>
            </p>
          )}
        </>
      )}

      {/* Error message */}
      {error !== "" && <h5 className="text-warning">{t("User not found")}</h5>}
    </>
  );
};

export default KeyringGeneration;
