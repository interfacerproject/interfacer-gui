import { useTranslation } from "next-i18next";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import BrInput from "components/brickroom/BrInput";

//

export namespace InvitationKeyNS {
  export interface FormValues {
    invitationKey: string;
  }

  export interface Props {
    onSubmit: (data: FormValues) => void;
  }
}

//

export default function InvitationKey({ onSubmit }: InvitationKeyNS.Props) {
  const { t } = useTranslation("signUpProps", { keyPrefix: "InvitationKey" });

  /* Form setup */

  const defaultValues: InvitationKeyNS.FormValues = {
    invitationKey: "",
  };

  const schema = yup
    .object({
      invitationKey: yup.string().required().oneOf([process.env.NEXT_PUBLIC_INVITATION_KEY], t("formError")),
    })
    .required();

  const form = useForm<InvitationKeyNS.FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  // Getting data from the form
  const { formState, handleSubmit, register } = form;
  const { errors, isValid } = formState;

  //

  return (
    <div>
      {/* Info */}
      <h2>{t("title")}</h2>
      <p className="mt-4 mb-6">{t("description")}</p>

      {/* The form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <BrInput
          {...register("invitationKey")}
          type="text"
          label={t("field.label")}
          placeholder={t("field.placeholder")}
          error={errors.invitationKey?.message}
          testID="invitationKey"
        />

        <button
          className="mt-4 btn btn-block btn-accent"
          type="submit"
          disabled={!isValid}
          data-test="invitationButton"
        >
          {t("button")}
        </button>
      </form>
    </div>
  );
}
