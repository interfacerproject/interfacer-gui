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

type SignUpProps = {
  onSubmit: Function;
  setEmail: (email: string) => void;
  setName: (name: string) => void;
  setUser: (user: string) => void;
  setHMAC: (HMAC: string) => void;
};

export interface SignUpFormValues {
  email: string;
  name: string;
  user: string;
}

//

const EmailVerificationForm = (props: SignUpProps) => {
  // Loading translations
  const { t } = useTranslation("signUpProps");

  // Unpacking props
  const { onSubmit, setEmail, setName, setUser, setHMAC } = props;

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

  // Submit function
  const onValid = async (data: SignUpFormValues) => {
    setEmail(data.email);
    setName(data.name);
    setUser(data.user);

    const result = await register(data.email, true);
    setHMAC(result.keypairoomServer);

    // Running the provided "onSubmit"
    onSubmit();
  };

  // Getting data to display from the form
  const { formState } = form;
  const { errors, isValid } = formState;

  const isButtonEnabled = !isValid ? "btn-disabled" : "";

  /* */

  return (
    <>
      <h2>{t("title")}</h2>
      <p className="mt-4 mb-6">{t("presentation")}</p>
      {/* The form */}
      <form onSubmit={form.handleSubmit(onValid)} className="space-y-8">
        {/* Email */}
        <BrInput
          {...form.register("email")}
          type="email"
          label={t("email.label")}
          placeholder={t("email.placeholder")}
          help={t("email.help")}
          error={errors.email?.message}
        />
        {/* Name */}
        <BrInput
          {...form.register("name")}
          type="text"
          label={t("name.label")}
          placeholder={t("name.placeholder")}
          help={t("name.help")}
          error={errors.name?.message}
        />
        {/* Username */}
        <BrInput
          {...form.register("user")}
          type="text"
          label={t("user.label")}
          placeholder={t("user.placeholder")}
          help={t("user.help")}
          error={errors.user?.message}
        />
        {/* Submit button */}
        <button className={`my-6 btn btn-block btn-primary ${isButtonEnabled}`} type="submit" disabled={!isValid}>
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
