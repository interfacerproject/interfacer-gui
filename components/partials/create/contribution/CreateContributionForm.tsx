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
import { Controller, FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import { Banner, Button, Card, Spinner, Stack, Text, TextField } from "@bbtgnn/polaris-interfacer";
import BrMdEditor from "components/brickroom/BrMdEditor";
import { ChildrenProp as CP } from "components/brickroom/types";

// Other
import ResourceDetailsCard from "components/ResourceDetailsCard";
import TableOfContents from "components/TableOfContents";
import { useProject } from "components/layout/FetchProjectLayout";
import PDivider from "components/polaris/PDivider";
import PLabel from "components/polaris/PLabel";
import useYupLocaleObject from "hooks/useYupLocaleObject";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { isRequired } from "lib/isFieldRequired";
import { useRouter } from "next/router";
import React, { ReactNode } from "react";
import SelectProjectForContribution from "../project/steps/SelectProjectForContribution";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";

//

export interface Props extends CP {
  onSubmit: (data: FormValues) => void;
  error?: string;
  setError?: React.Dispatch<React.SetStateAction<string>>;
}

export interface FormValues {
  name: string;
  project: string;
  description: string;
}

//

// export default function CreateContributionForm(props: Props) {
const CreateContributionForm = (props: Props) => {
  const { onSubmit, error, setError } = props;
  const { t } = useTranslation("createProjectProps");

  const sections = ["Title", "Linked-Project", "Description"];

  function ProposeContributionNav() {
    const { t } = useTranslation("common");

    const links = sections.map(section => ({
      label: <span className="capitalize">{section}</span>,
      href: `#${section.replace(" ", "-")}`,
    }));
    return <TableOfContents title={t("Make a contribution")} links={links} />;
  }

  //

  const defaultValues: FormValues = {
    name: "",
    project: "",
    description: "",
  };

  const yupLocaleObject = useYupLocaleObject();

  yup.setLocale(yupLocaleObject);

  const schema = (() =>
    yup
      .object({
        name: yup.string().required(),
        project: yup.string().required(),
        description: yup.string().required(),
      })
      .required())();

  const form = useForm<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { formState, handleSubmit, register, control, setValue, watch } = form;
  const { errors, isSubmitting } = formState;

  const { project: resource } = useProject();

  const Heading = () => (
    <>
      <Stack vertical spacing="extraLoose">
        <Stack vertical spacing="tight">
          <Text as="h1" variant="headingXl">
            {t("Make a Contribution")}
          </Text>
        </Stack>
        {/* <Stack vertical spacing="tight">
          <Text as="h2" variant="headingLg">
            {t("Contribution info")}
          </Text>
          <Text as="p" variant="bodyMd">
            {t("Help us display your proposal correctly.")}
          </Text>
        </Stack> */}
        <Stack vertical spacing="extraTight">
          <PLabel label={t("You are about to propose a contribution to:")} />
          <ResourceDetailsCard resource={resource} />
        </Stack>
      </Stack>
    </>
  );

  //

  const Fields = () => (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack vertical spacing="extraLoose">
          <PDivider id={sections[0]} />
          <PTitleSubtitle title={t(sections[0])} />

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
                label={t("Contribution title")}
                placeholder={t("github.com/my-repo")}
                helpText={t("A good title helps the project owner evaluate your proposal")}
                error={errors[name]?.message}
                requiredIndicator={isRequired(schema, name)}
              />
            )}
          />

          <PDivider id={sections[1]} />
          <PTitleSubtitle title={t(sections[1])} subtitle={t("Select the project with the contributions")} />
          <SelectProjectForContribution />

          <PDivider id={sections[2]} />
          <PTitleSubtitle title={t(sections[2])} subtitle={t("Describe what your contribution is about")} />
          <BrMdEditor
            id="description"
            name="description"
            editorClass="h-60"
            value={watch("description")}
            label={t("Project Description")}
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
    </FormProvider>
  );

  //

  const Layout = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const { t } = useTranslation("common");
    return (
      <>
        <div className="p-4 text-text-primary">
          <Button
            onClick={() => {
              router.back();
            }}
            plain
            monochrome
          >
            {t("← Discard and go back")}
          </Button>
        </div>
        <div className="flex justify-center items-start space-x-8 md:space-x-16 lg:space-x-24 p-6">
          <div className="sticky top-24">
            <ProposeContributionNav />
          </div>
          <div className="grow max-w-xl px-6 pb-24 pt-0">{children}</div>
        </div>
      </>
    );
  };

  return (
    <Layout>
      <Heading />
      <Fields />
    </Layout>
  );
};

export default CreateContributionForm;
