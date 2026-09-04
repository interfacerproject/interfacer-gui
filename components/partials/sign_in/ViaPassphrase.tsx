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

// Form imports
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import { TextField } from "@bbtgnn/polaris-interfacer";
import { ChildrenComponent as CC } from "components/brickroom/types";
import {
  AuthActions,
  AuthArrowLink,
  AuthBackLink,
  AuthButton,
  AuthCard,
  AuthCardHeader,
} from "components/partials/auth/AuthCard";
import useYupLocaleObject from "hooks/useYupLocaleObject";
import { isRequired } from "../../../lib/isFieldRequired";

//

export namespace ViaPassphraseNS {
  export interface Props {
    onSubmit?: (data: FormValues) => void;
    onBack?: () => void;
    viaQuestions?: () => void;
  }

  export interface FormValues {
    passphrase: string;
  }
}

//

/** Sign in · step 3A — passphrase (Figma 1092:14277). */
export default function ViaPassphrase(props: CC<ViaPassphraseNS.Props>) {
  const { onSubmit = () => {}, onBack, viaQuestions } = props;
  const { t } = useTranslation("signInProps");

  /* Form setup */

  const defaultValues: ViaPassphraseNS.FormValues = {
    passphrase: "",
  };

  const yupLocaleObject = useYupLocaleObject();

  yup.setLocale(yupLocaleObject);

  const schema = (() =>
    yup
      .object({
        passphrase: yup
          .string()
          .required()
          .test("name", t("Invalid passphrase"), value => value?.split(" ").length == 12),
      })
      .required())();

  // Creating form
  const form = useForm<ViaPassphraseNS.FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  // Getting data from the form
  const { formState, handleSubmit, control } = form;
  const { errors, isValid } = formState;

  //

  return (
    <AuthCard>
      <AuthCardHeader
        back={<AuthBackLink label={t("Back to sign in")} onClick={onBack} />}
        title={t("Sign in with your passphrase")}
        description={t("Enter the passphrase generated when you created your account.")}
      />

      {/* Slot for errors */}
      {props.children}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Controller
          control={control}
          name="passphrase"
          render={({ field: { onChange, onBlur, name, value } }) => (
            <TextField
              type="text"
              id={name}
              name={name}
              value={value}
              autoComplete="off"
              onChange={onChange}
              onBlur={onBlur}
              label={t("Passphrase")}
              placeholder={t("Enter your passphrase")}
              error={errors.passphrase?.message}
              requiredIndicator={isRequired(schema, name)}
            />
          )}
        />

        <AuthActions>
          <AuthButton type="submit" disabled={!isValid} id="submit">
            {t("Sign in")}
          </AuthButton>

          <AuthArrowLink label={t("Use recovery questions instead")} onClick={viaQuestions} id="viaQuestions" />
        </AuthActions>
      </form>
    </AuthCard>
  );
}
