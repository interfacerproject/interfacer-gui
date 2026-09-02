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
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import * as yup from "yup";

// Components
import { Banner, Card, Spinner, TextField } from "@bbtgnn/polaris-interfacer";
import BrMdEditor from "components/brickroom/BrMdEditor";
import { ChildrenProp as CP } from "components/brickroom/types";

// Other
import { MagicWand } from "@carbon/icons-react";
import ResourceDetailsCard from "components/ResourceDetailsCard";
import { useProject } from "components/layout/FetchProjectLayout";
import PLabel from "components/polaris/PLabel";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import useYupLocaleObject from "hooks/useYupLocaleObject";
import { isRequired } from "lib/isFieldRequired";
import React, { ReactNode } from "react";
import SelectProjectForContribution from "../project/steps/SelectProjectForContribution";
import Link from "next/dist/client/link";
import {
  FormActions,
  FormColumns,
  FormHeading,
  FormNavRail,
  FormSection,
  formPrimaryButtonClass,
  formPrimaryButtonStyle,
  useSectionScrollSpy,
} from "../FormShell";

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
  const { t } = useTranslation();

  const sections = [
    { id: "contribution-title", label: t("Title") },
    { id: "contribution-project", label: t("Project to be included") },
    { id: "contribution-description", label: t("Description of the contribution") },
  ];

  function ProposeContributionNav() {
    const { activeId, scrollTo } = useSectionScrollSpy(sections.map(s => s.id));
    return (
      <FormNavRail
        items={sections.map(s => ({ ...s, required: true }))}
        activeId={activeId}
        onSelect={scrollTo}
        ariaLabel={t("Sections")}
      />
    );
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

  const { formState, handleSubmit, control, setValue, trigger } = form;
  const { errors, isSubmitting, isValid } = formState;

  const { project: resource } = useProject();

  const Heading = () => (
    <>
      <FormHeading title={t("Propose a contribution")} />
      <div className="mb-6 flex flex-col gap-1">
        <PLabel label={t("You are about to propose to include a project into:")} />
        <ResourceDetailsCard resource={resource} />
      </div>
    </>
  );

  //

  const Fields = () => (
    <>
      <FormSection id={sections[0].id}>
        <PTitleSubtitle title={sections[0].label} />
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
              placeholder={t("My awesome contribution")}
              helpText={t("A good title helps the project owner evaluate your proposal")}
              error={errors[name]?.message}
              requiredIndicator={isRequired(schema, name)}
            />
          )}
        />
      </FormSection>

      <FormSection id={sections[1].id}>
        <PTitleSubtitle
          title={sections[1].label}
          subtitle={t("Select the project you propose to include in the original project")}
        />
        <SelectProjectForContribution />
      </FormSection>

      <FormSection id={sections[2].id}>
        <PTitleSubtitle
          title={sections[2].label}
          subtitle={t(
            "Describe what your contribution adds to the original project,  and why you are proposing it. This description will be readable in the history of the project you are contributing to."
          )}
        />
        <BrMdEditor
          id="description"
          name="description"
          editorClass="h-60"
          value={useWatch({ control, name: "description" })}
          helpText={`${t("In this markdown editor, the right box shows a preview")}. ${t(
            "Type up to 6000 characters"
          )}.`}
          onChange={({ text }) => {
            setValue("description", text, { shouldValidate: false, shouldDirty: false, shouldTouch: false });
          }}
          onBlur={() => {
            trigger("description");
          }}
          requiredIndicator={isRequired(schema, "description")}
          error={errors.description?.message}
        />
      </FormSection>

      <>
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
      </>
    </>
  );

  //

  const SubmitBar = () => (
    <FormActions>
      <button type="submit" disabled={!isValid} className={formPrimaryButtonClass} style={formPrimaryButtonStyle}>
        <MagicWand size={16} />
        {t("Propose contribution")}
      </button>
    </FormActions>
  );

  //

  const Layout = ({ children }: { children: ReactNode }) => {
    const { t } = useTranslation("common");
    return (
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="min-h-screen bg-ifr-profile" style={{ fontFamily: "var(--ifr-font-body)" }}>
            <div className="max-w-[1200px] mx-auto w-full px-4 md:px-6 py-6 md:py-[42px]">
              <Link href={`/project/${resource?.id}`}>
                <a
                  className="inline-flex items-center gap-2 mb-4 px-1 py-2 text-ifr-text-primary no-underline hover:bg-ifr-hover transition-colors"
                  style={{
                    borderRadius: "var(--ifr-radius-sm)",
                    fontSize: "var(--ifr-fs-base)",
                    fontWeight: "var(--ifr-fw-medium)",
                  }}
                >
                  {t("← Discard and go back")}
                </a>
              </Link>
              <Heading />
              <FormColumns nav={<ProposeContributionNav />}>
                {children}
                <SubmitBar />
              </FormColumns>
            </div>
          </div>
        </form>
      </FormProvider>
    );
  };

  return (
    <Layout>
      <Fields />
    </Layout>
  );
};

export default CreateContributionForm;
