import { useTranslation } from "next-i18next";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import { Button, TextField } from "@bbtgnn/polaris-interfacer";
import { isRequired } from "../../../lib/isFieldRequired";

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
  const { t } = useTranslation("signUpProps");

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
  const { formState, handleSubmit, register, control } = form;
  const { errors, isValid } = formState;

  //

  return (
    <div>
      {/* Info */}
      <h2>{t("Invitation key")}</h2>
      <p className="mt-4 mb-6">{t("Do you have your invitation key?")}</p>

      {/* The form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          control={control}
          name="invitationKey"
          render={({ field: { onChange, onBlur, name, value } }) => (
            <TextField
              type="text"
              id={name}
              name={name}
              value={value}
              autoComplete="off"
              onChange={onChange}
              onBlur={onBlur}
              label={t("Type your invitation key")}
              error={errors.invitationKey?.message}
              requiredIndicator={isRequired(schema, name)}
            />
          )}
        />

        {/* Submit button */}
        <Button size="large" primary fullWidth submit disabled={!isValid} id="invitationButton">
          {t("Next step")}
        </Button>
      </form>
    </div>
  );
}
