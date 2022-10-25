import { KeyIcon, LinkIcon } from "@heroicons/react/solid";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import BrInput from "./brickroom/BrInput";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

//

export interface FormValues {
  invitationKey: string;
}

export interface InvitationKeyProps {
  onSubmit: (data: FormValues) => void;
}

const InvitationKey = ({ onSubmit }: InvitationKeyProps) => {
  const { t } = useTranslation("signUpProps");

  /* Form setup */

  const defaultValues: FormValues = {
    invitationKey: "",
  };

  const schema = yup
    .object({
      invitationKey: yup.string().required().oneOf([process.env.NEXT_PUBLIC_INVITATION_KEY], "keyNotMatching"),
    })
    .required();

  const form = useForm<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  // Getting data from the form
  const { formState, handleSubmit, register } = form;
  const { errors, isValid } = formState;

  //

  return (
    <>
      {/* Info */}
      <div className="flex flex-row">
        <h2>{t("Got your keys?")}</h2>
        <KeyIcon className="w-8 h-8" />
      </div>
      <p className="mt-4 mb-6">{t("You need an invitation phrase to proceed with your signup!")}</p>
      <p className="flex flex-row items-center">
        <span>{t("👌 You already have an account?")}</span>
        <Link href={"/sign_in"}>
          <a className="flex flex-row font-semibold">
            <LinkIcon className="w-5 h-5 mx-2" />
            {t("Login")}
          </a>
        </Link>
      </p>

      {/* The form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
        <BrInput
          {...register("invitationKey")}
          type="text"
          label={t("invitation key&#58;*")}
          error={errors.invitationKey?.message}
        />
        <button className="mt-4 btn btn-block btn-accent" type="submit" disabled={!isValid}>
          {t("Continue")}
        </button>
      </form>
    </>
  );
};

export default InvitationKey;
