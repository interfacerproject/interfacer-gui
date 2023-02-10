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
import { useTranslation } from "next-i18next";

import { Button, TextField } from "@bbtgnn/polaris-interfacer";

// Form imports
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";

// Components
import { ChildrenComponent as CC } from "components/brickroom/types";
import { isRequired } from "../../../lib/isFieldRequired";

//

export namespace EnterEmailNS {
  export interface Props {
    onSubmit: (data: FormValues) => void;
  }

  export interface FormValues {
    email: string;
  }
}

//

export default function EnterEmail(props: CC<EnterEmailNS.Props>) {
  const { onSubmit } = props;
  const { t } = useTranslation("signInProps");

  /* Form setup */

  const defaultValues: EnterEmailNS.FormValues = {
    email: "",
  };

  const schema = yup
    .object({
      email: yup.string().email().required(),
    })
    .required();

  // Creating form
  const form = useForm<EnterEmailNS.FormValues>({
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
      <p className="mt-2 mb-6">{t("")}</p>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Email field */}
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
              label={t("Your email")}
              placeholder={t("alice@email.com")}
              error={errors.email?.message}
              requiredIndicator={isRequired(schema, name)}
            />
          )}
        />

        {/* Slot for errors */}
        {props.children}

        {/* Submit button */}
        <Button size="large" primary fullWidth submit disabled={!isValid} id="submit" data-test="submit">
          {t("Next step")}
        </Button>
      </form>
    </div>
  );
}
