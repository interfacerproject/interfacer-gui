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
import { Banner, Button, Card, Spinner, Stack, TextField } from "@bbtgnn/polaris-interfacer";
import BrMdEditor from "components/brickroom/BrMdEditor";
import { ChildrenProp as CP } from "components/brickroom/types";

// Other
import { formSetValueOptions } from "lib/formSetValueOptions";
import { isRequired } from "lib/isFieldRequired";
import React from "react";
import useYupLocaleObject from "hooks/useYupLocaleObject";

//

export interface Props extends CP {
  onSubmit: (data: FormValues) => void;
  error?: string;
  setError?: React.Dispatch<React.SetStateAction<string>>;
}

export interface FormValues {
  contributionRepositoryID: string; // also: url
  description: string;
}

//

export default function CreateContributionForm(props: Props) {
  const { onSubmit, error, setError } = props;
  const { t } = useTranslation("createProjectProps");

  //

  const defaultValues: FormValues = {
    contributionRepositoryID: "",
    description: "",
  };

  const yupLocaleObject = useYupLocaleObject();

  yup.setLocale(yupLocaleObject);

  const schema = (() =>
    yup
      .object({
        contributionRepositoryID: yup.string().required(),
        description: yup.string().required(),
      })
      .required())();

  const form = useForm<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { formState, handleSubmit, register, control, setValue, watch } = form;
  const { isValid, errors, isSubmitting } = formState;

  //

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack vertical spacing="extraLoose">
        <Controller
          control={control}
          name="contributionRepositoryID"
          render={({ field: { onChange, onBlur, name, value } }) => (
            <TextField
              type="text"
              id={name}
              name={name}
              value={value}
              autoComplete="off"
              onChange={onChange}
              onBlur={onBlur}
              label={t("Contribution repository link or Interfacer ID")}
              placeholder={t("github.com/my-repo")}
              helpText={t("Reference to the resource's repository or Interfacer ID of the resource")}
              error={errors[name]?.message}
              requiredIndicator={isRequired(schema, name)}
            />
          )}
        />

        <BrMdEditor
          id="description"
          name="description"
          editorClass="h-60"
          value={watch("description")}
          label={t("General information")}
          helpText={`${t("In this markdown editor, the right box shows a preview")}. ${t(
            "Type up to 2048 characters"
          )}.`}
          subtitle={t("Short description to be displayed on the project page")}
          onChange={({ text }) => {
            setValue("description", text, formSetValueOptions);
          }}
          requiredIndicator={isRequired(schema, "description")}
          error={errors.description?.message}
        />

        {/* Slot to display errors, for example */}
        {error && setError && (
          <Banner
            title={t("Error in contribution creation")}
            status="critical"
            onDismiss={() => {
              setError("");
            }}
          >
            {error}
          </Banner>
        )}

        {isSubmitting && (
          <Card>
            <div className="flex flex-col items-center justify-center p-4">
              <Spinner />
              <p className="pt-2">{`${t("Creating contribution...")}`}</p>
            </div>
          </Card>
        )}

        <Button size="large" primary fullWidth submit id="submit">
          {t("Send contribution")}
        </Button>
      </Stack>
    </form>
  );
}
