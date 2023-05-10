// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { useTranslation } from "next-i18next";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import { Button, TextField } from "@bbtgnn/polaris-interfacer";
import { isRequired } from "../../../lib/isFieldRequired";
import useYupLocaleObject from "hooks/useYupLocaleObject";

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
  const yupLocaleObject = useYupLocaleObject();

  yup.setLocale(yupLocaleObject);

  const schema = (() =>
    yup
      .object({
        invitationKey: yup.string().required().oneOf([process.env.NEXT_PUBLIC_INVITATION_KEY], t("formError")),
      })
      .required())();

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
