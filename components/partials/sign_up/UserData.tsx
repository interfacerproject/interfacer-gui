// Functionality
import { useAuth } from "hooks/useAuth";
import { useTranslation } from "next-i18next";

// Form imports
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import BrInput from "components/brickroom/BrInput";

//

export namespace UserDataNS {
  export interface FormValues {
    email: string;
    name: string;
    user: string;
  }

  export interface Props {
    onSubmit: (data: FormValues) => void;
  }
}

//

export default function UserData({ onSubmit }: UserDataNS.Props) {
  // Loading translations
  const { t } = useTranslation("signUpProps", { keyPrefix: "UserData" });

  // Getting function that checks for email
  const { register } = useAuth();

  /* Form setup */

  const defaultValues: UserDataNS.FormValues = {
    email: "",
    name: "",
    user: "",
  };

  const schema: yup.AnyObjectSchema = yup
    .object({
      name: yup.string().required(),
      user: yup.string().required(),
      email: yup
        .string()
        .email()
        .required()
        .test("email-exists", t("email.invalid"), async (value, testContext) => {
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
  const form = useForm<UserDataNS.FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  // Getting data from the form
  const { formState, handleSubmit } = form;
  const { errors, isValid } = formState;

  //

  return (
    <div>
      {/* Info */}
      <h2>{t("title")}</h2>
      <p>{t("description")}</p>

      {/* The form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-8">
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
        <button className="btn btn-block btn-primary" type="submit" disabled={!isValid} data-test="submit">
          {t("button")}
        </button>
      </form>
    </div>
  );
}
