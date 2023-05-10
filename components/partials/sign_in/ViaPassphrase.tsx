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
import { Button, TextField } from "@bbtgnn/polaris-interfacer";
import { isRequired } from "../../../lib/isFieldRequired";
import useYupLocaleObject from "hooks/useYupLocaleObject";

//

export namespace ViaPassphraseNS {
  export interface Props {
    onSubmit?: (data: FormValues) => void;
  }

  export interface FormValues {
    passphrase: string;
  }
}

//

export default function ViaPassphrase(props: ViaPassphraseNS.Props) {
  const { onSubmit = () => {} } = props;
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
    <div>
      {/* Intro */}
      <h2>{t("Login")}</h2>
      <p className="mt-2 mb-6">{t("Input the passphrase that you kept generated during the signup process")}</p>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Email field */}
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
              placeholder={t("penalty now before knife offer market drum flush advice frown claw hold")}
              error={errors.passphrase?.message}
              requiredIndicator={isRequired(schema, name)}
            />
          )}
        />

        {/* Submit button */}
        <Button size="large" primary fullWidth submit disabled={!isValid} id="submit">
          {t("Login")}
        </Button>
      </form>
    </div>
  );
}
