// Functionality
import { useTranslation } from "next-i18next";
import { useAuth } from "../hooks/useAuth";

// Form imports
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import { LinkIcon } from "@heroicons/react/solid";
import Link from "next/link";
import BrInput from "./brickroom/BrInput";

//

export interface SignUpFormValues {
  email: string;
  name: string;
  user: string;
}

type SignUpProps = {
  onSubmit: (data: SignUpFormValues) => void;
  // setEmail: (email: string) => void;
  // setName: (name: string) => void;
  // setUser: (user: string) => void;
  // setHMAC: (HMAC: string) => void;
};

//

const EmailVerificationForm = ({ onSubmit }: SignUpProps) => {
  // Loading translations
  const { t } = useTranslation("signUpProps");

  // Getting function that checks for email
  const { register } = useAuth();

  /* Form setup */

  const defaultValues: SignUpFormValues = {
    email: "",
    name: "",
    user: "",
  };

  const schema = yup
    .object({
      name: yup.string().required(),
      user: yup.string().required(),
      email: yup
        .string()
        .email()
        .required()
        .test("email-exists", "Provided e-mail already exists", async (value, testContext) => {
          return await testEmail(value!);
        }),
    })
    .required();

  // This function checks if the provided email exists
  async function testEmail(email: string) {
    const result = await register(email, true);
    return result?.keypairoomServer ? true : false;
  }

  // Creating form
  const form = useForm<SignUpFormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  // Getting data from the form
  const { formState, handleSubmit } = form;
  const { errors, isValid } = formState;

  const isButtonEnabled = !isValid ? "btn-disabled" : "";

  /* */

  return (
    <>
      <h2>{t("title")}</h2>
      <p className="mt-4 mb-6">{t("presentation")}</p>
      {/* The form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Email */}
        <BrInput
          {...form.register("email")}
          type="email"
          label={t("email.label")}
          placeholder={t("email.placeholder")}
          help={t("email.help")}
          error={errors.email?.message}
          testID="email"
        />
        {/* Name */}
        <BrInput
          {...form.register("name")}
          type="text"
          label={t("name.label")}
          placeholder={t("name.placeholder")}
          help={t("name.help")}
          error={errors.name?.message}
          testID="name"
        />
        {/* Username */}
        <BrInput
          {...form.register("user")}
          type="text"
          label={t("user.label")}
          placeholder={t("user.placeholder")}
          help={t("user.help")}
          error={errors.user?.message}
          testID="user"
        />
        {/* Submit button */}
        <button
          className={`my-6 btn btn-block btn-primary ${isButtonEnabled}`}
          type="submit"
          disabled={!isValid}
          data-test="submit"
        >
          {t("button")}
        </button>
      </form>

      {/* Link alla registrazione */}
      <p className="flex flex-row items-center">
        <span>{t("register.question")}</span>
        <Link href={"/sign_in"}>
          <a className="flex flex-row font-semibold">
            <LinkIcon className="w-5 h-5 mx-2" />
            {t("register.answer")}
          </a>
        </Link>
      </p>
    </>
  );
};

export default EmailVerificationForm;
