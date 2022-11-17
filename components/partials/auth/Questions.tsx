import BrInput from "components/brickroom/BrInput";
import { useAuth } from "hooks/useAuth";
import { useTranslation } from "next-i18next";
import { useState } from "react";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

//

export namespace QuestionsNS {
  export interface FormValues {
    question1: string;
    question2: string;
    question3: string;
    question4: string;
    question5: string;
  }

  export interface Props {
    email: string;
    HMAC: string;
    onSubmit: (data: FormValues) => void;
  }
}

//

const Questions = (props: QuestionsNS.Props) => {
  /**
   * Texts and translations
   */

  const { t } = useTranslation("signInProps");
  const questions = [
    t("Where my parents met?"),
    t("What is the name of your first pet?"),
    t("What is your home town?"),
    t("What is the name of your first teacher?"),
    t("What is the surname of your mother before wedding?"),
  ];

  /**
   * Counter for missing questions
   */

  const MIN_QUESTIONS = 3;
  const [missingQuestions, setMissingQuestions] = useState("");

  function countFilledQuestions(q: QuestionsNS.FormValues): number {
    // Keeps track of how many answers are valid
    let count = 0;
    // Listing all the values
    Object.values(q).map(v => {
      // Checking if values are valid, then updating count
      try {
        yup.string().required().validateSync(v);
        count++;
      } catch (err) {}
    });
    //
    return count;
  }

  function countMissingQuestions(q: QuestionsNS.FormValues): number {
    return MIN_QUESTIONS - countFilledQuestions(q);
  }

  function areEnoughQuestions(q: QuestionsNS.FormValues): boolean {
    return countFilledQuestions(q) >= MIN_QUESTIONS;
  }

  /**
   * Form setup
   */

  const defaultValues: QuestionsNS.FormValues = {
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
  };

  const schema = yup
    .object({
      question1: yup.string(),
      question2: yup.string(),
      question3: yup.string(),
      question4: yup.string(),
      question5: yup.string(),
    })
    .required()
    .test("three-questions", value => {
      const v = value as QuestionsNS.FormValues;
      setMissingQuestions(
        t("At least {{missingQuestions}} questions are missing!", { missingQuestions: countMissingQuestions(v) })
      );
      return areEnoughQuestions(v);
    });

  const form = useForm<QuestionsNS.FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { formState, handleSubmit, register } = form;
  const { isValid } = formState;

  /**
   * Submit function
   */

  const { keypair } = useAuth(); // Generates keys in local storage

  async function onSubmit(data: QuestionsNS.FormValues) {
    // Replacing empty questions with "null"
    for (let key in data) {
      // @ts-ignore
      data[key] = data[key] === "" ? "null" : data[key];
    }

    // Creating keypair
    await keypair({
      ...data,
      email: props.email,
      HMAC: props.HMAC,
    });

    // Running user-provided function
    props.onSubmit(data);
  }

  /**
   * HTML
   */

  return (
    <>
      {/* Hint */}
      {!isValid && (
        <p className="text-amber-500 font-bold" data-test="missingQuestions">
          {missingQuestions}
        </p>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pt-8">
        {/* Iterating over "questions" to display fields */}
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={index}>
              <p className="font-bold">{question}</p>
              <BrInput
                type="text"
                // @ts-ignore
                {...register(`question${index + 1}`)}
                testID={`question${index + 1}`}
              />
            </div>
          ))}
        </div>

        {/* Submit button */}
        <button className="btn btn-block btn-accent" type="submit" disabled={!isValid} data-test="submit">
          {t("Next step")}
        </button>
      </form>
    </>
  );
};

export default Questions;