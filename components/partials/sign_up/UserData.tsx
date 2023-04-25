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

// Functionality
import { useAuth } from "hooks/useAuth";
import { useTranslation } from "next-i18next";

// Form imports
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import { Button, TextField } from "@bbtgnn/polaris-interfacer";
import { isRequired } from "../../../lib/isFieldRequired";

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
  const { t } = useTranslation("signUpProps");

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
        .test("email-exists", t("this e-mail has already been used by another user"), async (value, testContext) => {
          return await testEmail(value!);
        }),
    })
    .required();

  // This function checks if the provided email exists
  async function testEmail(email: string) {
    const result = await register(email, true);
    return Boolean(result?.keypairoomServer);
  }

  // Creating form
  const form = useForm<UserDataNS.FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  // Getting data from the form
  const { formState, handleSubmit, control } = form;
  const { errors, isValid } = formState;

  //

  return (
    <div>
      {/* Info */}
      <h2>{t("Sign up")}</h2>
      <p>
        {t(
          "The sign up process generates your private keys which are never communicate to the server; Keep a copy of your passphrase"
        )}
      </p>
      {/* The form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-8">
        {/* Email */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, name, value } }) => (
            <TextField
              type="email"
              id={name}
              name={name}
              value={value}
              autoComplete="off"
              onChange={onChange}
              onBlur={onBlur}
              focused={true}
              label={t("Your email")}
              helpText={t("Your email address that will be used for your login")}
              placeholder={t("alice@email&#183;com")}
              error={errors.email?.message}
              requiredIndicator={isRequired(schema, name)}
            />
          )}
        />
        {/* Name */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, name, value } }) => (
            <TextField
              type="text"
              id={name}
              name={name}
              value={value}
              autoComplete="off"
              onChange={onChange}
              onBlur={onBlur}
              label={t("Your name")}
              helpText={t("Your name is shown and visible to everyone")}
              placeholder={t("Type your name")}
              error={errors.name?.message}
              requiredIndicator={isRequired(schema, name)}
            />
          )}
        />
        {/* Username */}
        <Controller
          control={control}
          name="user"
          render={({ field: { onChange, onBlur, name, value } }) => (
            <TextField
              type="text"
              id={name}
              name={name}
              value={value}
              autoComplete="off"
              onChange={onChange}
              onBlur={onBlur}
              label={t("Choose a username")}
              helpText={t("Your username is used to identify you in the system")}
              placeholder={t("Type your visible username")}
              error={errors.user?.message}
              requiredIndicator={isRequired(schema, name)}
            />
          )}
        />
        {/* Submit button */}
        <Button size="large" primary fullWidth submit disabled={!isValid} id="submit">
          {t("Next step")}
        </Button>
      </form>
    </div>
  );
}
