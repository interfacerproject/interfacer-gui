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

import { useMutation } from "@apollo/client";
import { Banner, Button, Stack, Text, TextField } from "@bbtgnn/polaris-interfacer";
import { yupResolver } from "@hookform/resolvers/yup";
import SearchUsers from "components/SearchUsers";
import SelectLocation, { SelectedLocation } from "components/SelectLocation";
import SelectTags from "components/SelectTags";
import BrUserDisplay from "components/brickroom/BrUserDisplay";
import { ChildrenProp as CP } from "components/brickroom/types";
import FetchProjectLayout, { useProject } from "components/layout/FetchProjectLayout";
import Layout from "components/layout/Layout";
import PCardWithAction from "components/polaris/PCardWithAction";
import dayjs from "dayjs";
import { useAuth } from "hooks/useAuth";
import { CREATE_LOCATION, TRANSFER_PROJECT } from "lib/QueryAndMutation";
import devLog from "lib/devLog";
import { errorFormatter } from "lib/errorFormatter";
import { formSetValueOptions } from "lib/formSetValueOptions";
import getIdFromFormName from "lib/getIdFromFormName";
import { isRequired } from "lib/isFieldRequired";
import { CreateLocationMutation, Person, TransferProjectMutationVariables } from "lib/types";
import { GetStaticPaths } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { NextPageWithLayout } from "../../_app";

export namespace ClaimProjectNS {
  export interface Props extends CP {
    onSubmit: (data: FormValues) => void;
  }

  export interface FormValues {
    tags: Array<string>;
    location: SelectedLocation | null;
    locationName: string;
    price: string;
    contributors: Array<string>;
  }
}

const ClaimProject: NextPageWithLayout = () => {
  const router = useRouter();
  const { project, loading } = useProject();
  const { user } = useAuth();
  const [error, setError] = useState<string>("");
  const { t } = useTranslation("ResourceProps");

  const [createLocation, { data: spatialThing }] = useMutation(CREATE_LOCATION);
  const [transferProject, { data: economicResource }] = useMutation(TRANSFER_PROJECT);

  type SpatialThingRes = CreateLocationMutation["createSpatialThing"]["spatialThing"];

  async function handleCreateLocation(formData: ClaimProjectNS.FormValues): Promise<SpatialThingRes | undefined> {
    try {
      const { data } = await createLocation({
        variables: {
          name: formData.locationName,
          addr: formData.location?.address,
          lat: formData.location?.lat!,
          lng: formData.location?.lng!,
        },
      });
      const st = data?.createSpatialThing.spatialThing;
      devLog("success: location created", st);
      return st;
    } catch (e) {
      devLog("error: location not created", e);
      throw e;
    }
  }

  async function handleClaim(formData: ClaimProjectNS.FormValues) {
    try {
      const location = await handleCreateLocation(formData);
      // devLog is in handleCreateLocation
      const tags = formData.tags;
      devLog("info: tags prepared", tags);
      const contributors = formData.contributors;
      devLog("info: contributors prepared", contributors);
      const metadata = JSON.stringify({
        ...project.metadata,
        repositoryOrId: project.metadata.repo,
        contributors: contributors,
      });
      devLog("info: metadata prepared", metadata);

      const variables: TransferProjectMutationVariables = {
        resource: project.id!,
        agent: user!.ulid,
        name: project.name!,
        note: project.note || "",
        metadata: metadata,
        location: location?.id!,
        oneUnit: project.onhandQuantity!.hasUnit!.id,
        creationTime: dayjs().toISOString(),
        tags: tags.length > 0 ? tags : undefined,
      };
      devLog("info: project variables created", variables);

      //transfer project
      const { data: transferProjectData, errors } = await transferProject({ variables });
      if (errors) throw new Error("ProjectNotTransfered");

      const economicEvent = transferProjectData?.createEconomicEvent.economicEvent!;
      const projectTransfered = economicEvent?.toResourceInventoriedAs!;
      devLog("success: project transfered");
      devLog("info: economicEvent", economicEvent);
      devLog("info: project", projectTransfered);

      // TODO: Send message
      // ...

      // Redirecting user
      await router.replace(`/project/${projectTransfered.id}`);
    } catch (e) {
      devLog(e);
      let err = errorFormatter(e);
      setError(err);
    }
  }

  const defaultValues: ClaimProjectNS.FormValues = {
    tags: [],
    location: null,
    locationName: "",
    price: "1",
    contributors: [], // Array<{id:string, name:string}>
  };

  const schema = yup
    .object({
      tags: yup.array(yup.string()),
      location: yup.object().required(),
      locationName: yup.string().required(),
      price: yup.string().required(),
      contributors: yup.array(yup.string()),
    })
    .required();

  const form = useForm<ClaimProjectNS.FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { formState, control, handleSubmit, watch, setValue, trigger } = form;
  const { isValid, errors, isSubmitting } = formState;

  const CONTRIBUTORS_FORM_KEY = "contributors";
  const contributors = watch(CONTRIBUTORS_FORM_KEY);

  function handleSelect(option: Partial<Person>) {
    setValue(CONTRIBUTORS_FORM_KEY, [...contributors, option.id!], formSetValueOptions);
  }
  function handleRemove(contributorId: string) {
    setValue(
      CONTRIBUTORS_FORM_KEY,
      contributors.filter(id => id !== contributorId),
      formSetValueOptions
    );
  }

  console.log("form", isValid, errors, isSubmitting, contributors);

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(handleClaim)}>
        <div className="flex justify-center items-start space-x-8 md:space-x-16 lg:space-x-24 p-6">
          <div className="sticky top-24">{/* <EditProjectNav /> */}</div>
          <div className="grow max-w-xl px-6 pb-24 pt-0">
            <Stack vertical spacing="extraLoose">
              <Controller
                control={control}
                name="tags"
                render={({ field: { onChange, onBlur, name, ref } }) => (
                  <SelectTags
                    //@ts-ignore
                    tags={watch("tags")}
                    setTags={tags => {
                      setValue("tags", tags, formSetValueOptions);
                      trigger("tags");
                    }}
                    error={errors.tags?.message}
                    label={t("Tags")}
                    helpText={t("Add relevant keywords that describe your project.")}
                    requiredIndicator={isRequired(schema, "tags")}
                  />
                )}
              />
              <SearchUsers
                id="add-contributors-search"
                onSelect={handleSelect}
                excludeIDs={[...contributors, user?.ulid!]}
                label={t("Search for contributors")}
              />
              {contributors.length && (
                <Stack vertical spacing="tight">
                  <Text variant="bodyMd" as="p">
                    {t("Selected contributors")}
                  </Text>
                  {contributors.map(contributorId => (
                    <PCardWithAction
                      key={contributorId}
                      onClick={() => {
                        handleRemove(contributorId);
                      }}
                    >
                      <BrUserDisplay userId={contributorId} />
                    </PCardWithAction>
                  ))}
                </Stack>
              )}

              <Controller
                control={control}
                name="locationName"
                render={({ field: { onChange, onBlur, name, ref, value } }) => (
                  <TextField
                    type="text"
                    id={getIdFromFormName(name)}
                    name={name}
                    value={value}
                    autoComplete="off"
                    onChange={value => {
                      onChange(value), trigger("location");
                    }}
                    onBlur={() => {
                      onBlur(), trigger("location");
                    }}
                    label={t("Location name")}
                    helpText={t("For example: My Workshop")}
                    error={errors.locationName?.message}
                  />
                )}
              />

              <SelectLocation
                id="search-location"
                label={t("Address")}
                placeholder={t("An d. Alsterschleife 3, 22399 - Hamburg, Germany")}
                location={watch("location")}
                setLocation={value => setValue("location", value, formSetValueOptions)}
                error={errors.location?.message}
                requiredIndicator={true}
              />
              {error && (
                <Banner
                  title={t("Error in Project Claim")}
                  status="critical"
                  onDismiss={() => {
                    setError("");
                  }}
                >
                  <p className="whitespace-pre-wrap">{error}</p>
                </Banner>
              )}
            </Stack>
          </div>
        </div>
        <div className="sticky bottom-0 right-0 z-30 bg-background p-3 border-t-1 border-t-border-subdued">
          <div className="flex flex-row justify-end">
            <Button id="project-create-submit" submit primary disabled={!isValid}>
              {t("Claim!")}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["ResourceProps", "createProjectProps"])),
    },
  };
}
ClaimProject.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout>
      <FetchProjectLayout>{page}</FetchProjectLayout>
    </Layout>
  );
};

export default ClaimProject;
