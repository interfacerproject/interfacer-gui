import { useTranslation } from "next-i18next";
import { useState } from "react";
import BrInput from "./brickroom/BrInput";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

//

export interface QuestionsFormValues {
  question1: string;
  question2: string;
  question3: string;
  question4: string;
  question5: string;
}

export interface QuestionsProps {
  onSubmit: (data: QuestionsFormValues) => void;
}

const Questions = ({ onSubmit }: QuestionsProps) => {
  /* Loading translations and questions */

  const { t } = useTranslation(["signInProps"], {
    keyPrefix: "step_questions",
  });

  const questions = Object.values(t("questions", { returnObjects: true }));

  /* Form setup */

  const defaultValues: QuestionsFormValues = {
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
    .test("three-questions", "answerAtLeast3Questions", value => {
      return questionsTest(value as QuestionsFormValues);
    });

  const [missingQuestions, setMissingQuestions] = useState(5);

  function questionsTest(answers: QuestionsFormValues) {
    // This keeps track of how many answers are valid
    let count = 0;
    // Listing all the values and checking if they are valid
    Object.values(answers).map(v => {
      try {
        yup.string().required().validateSync(v);
        count++;
      } catch (err) {}
    });
    //
    setMissingQuestions(3 - count);
    return count >= 3;
  }

  // Building form
  const form = useForm<QuestionsFormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  // Getting data from the form
  const { formState, handleSubmit, register } = form;
  const { isValid } = formState;

  return (
    <>
      {/* Hint */}
      {!isValid && <p className="text-amber-500 font-bold">{missingQuestions} questions are missing!</p>}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-8">
        {/* Iterating over "questions" to display fields */}
        {questions.map((question, index) => (
          <div key={index}>
            <p className="font-bold">{question}</p>
            <BrInput
              type="text"
              // @ts-ignore
              {...register("question" + (index + 1))}
            />
          </div>
        ))}

        {/* Submit button */}
        <button className="btn btn-block btn-accent" type="submit" disabled={!isValid}>
          {t("button")}
        </button>
      </form>
    </>
  );
};

export default Questions;
