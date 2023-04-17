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

import { useMutation, useQuery } from "@apollo/client";
import { Banner, Button, TextField } from "@bbtgnn/polaris-interfacer";
import { yupResolver } from "@hookform/resolvers/yup";
import Spinner from "components/brickroom/Spinner";
import Layout from "components/layout/Layout";
import LoshPresentation from "components/LoshPresentation";
import dayjs from "dayjs";
import { useAuth } from "hooks/useAuth";
import devLog from "lib/devLog";
import { CREATE_LOCATION, QUERY_RESOURCE, TRANSFER_PROJECT } from "lib/QueryAndMutation";
import { CreateLocationMutation, EconomicResource, TransferProjectMutationVariables } from "lib/types";
import type { GetStaticPaths } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { ChildrenProp as CP } from "../../../components/brickroom/types";
import { SelectOption } from "../../../components/brickroom/utils/BrSelectUtils";
import SelectContributors, { ContributorOption } from "../../../components/SelectContributors";
import SelectLocation from "../../../components/SelectLocation";
import SelectTags from "../../../components/SelectTags";
import useInBox from "../../../hooks/useInBox";
import { errorFormatter } from "../../../lib/errorFormatter";
import { LocationLookup } from "../../../lib/fetchLocation";
import { isRequired } from "../../../lib/isFieldRequired";
import { NextPageWithLayout } from "../../_app";
import FetchProjectLayout, { useProject } from "components/layout/FetchProjectLayout";

export namespace ClaimProjectNS {
  export interface Props extends CP {
    onSubmit: (data: FormValues) => void;
  }

  export interface FormValues {
    tags: Array<SelectOption<string>>;
    location: LocationLookup.Location | null;
    locationName: string;
    price: string;
    contributors: Array<ContributorOption>;
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
          addr: formData.location?.address.label!,
          lat: formData.location?.position.lat!,
          lng: formData.location?.position.lng!,
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
      const tags = formData.tags.map(t => encodeURI(t.value));
      devLog("info: tags prepared", tags);
      const contributors = formData.contributors.map(c => c.value);
      devLog("info: contributors prepared", contributors);
      const metadata = JSON.stringify({
        ...project.metadata,
        repositoryOrId: project.metadata.repo,
        contributors: contributors.map(c => c.id),
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
      tags: yup.array(yup.object()),
      location: yup.object().required(),
      locationName: yup.string().required(),
      price: yup.string().required(),
      contributors: yup.array(
        yup.object({
          id: yup.string(),
          name: yup.string(),
        })
      ),
    })
    .required();

  const form = useForm<ClaimProjectNS.FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { formState, handleSubmit, control } = form;
  const { isValid, errors, isSubmitting } = formState;

  return (
    <div className="pb-6">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-12 pt-14">
        <div className="md:col-start-2 md:col-end-7">
          <h2>{t("claim your ownership over this project")}</h2>
        </div>
      </div>
      {loading && <Spinner />}
      {!loading && project && (
        <>
          <LoshPresentation />
        </>
      )}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-12 pt-14">
        <div className="md:col-start-2 md:col-end-7">
          <form onSubmit={handleSubmit(handleClaim)} className="w-full pt-12 space-y-12">
            <Controller
              control={control}
              name="tags"
              render={({ field: { onChange, onBlur, name, ref } }) => (
                <SelectTags
                  name={name}
                  id={name}
                  ref={ref}
                  onBlur={onBlur}
                  onChange={onChange}
                  label={`${t("Tags")}:`}
                  isMulti
                  placeholder={t("Open-source, 3D Printing, Medical use")}
                  helpText={t("Select a tag from the list, or type to create a new one")}
                  error={errors.tags?.message}
                  creatable={true}
                  requiredIndicator={isRequired(schema, name)}
                />
              )}
            />

            <Controller
              control={control}
              name="contributors"
              render={({ field: { onChange, onBlur, name, ref } }) => (
                <SelectContributors
                  name={name}
                  ref={ref}
                  id={name}
                  onBlur={onBlur}
                  onChange={onChange}
                  label={`${t("Contributors")}:`}
                  isMulti
                  placeholder={t("Type to search for a user")}
                  error={errors.contributors?.message}
                  removeCurrentUser
                  creatable={false}
                  requiredIndicator={isRequired(schema, name)}
                />
              )}
            />

            <div className="space-y-4">
              <Controller
                control={control}
                name="locationName"
                render={({ field: { onChange, onBlur, name, value } }) => (
                  <TextField
                    type="text"
                    id={name}
                    name={name}
                    value={value}
                    autoComplete="off"
                    onChange={onChange}
                    onBlur={onBlur}
                    label={t("Location name")}
                    placeholder={t("Cool fablab")}
                    helpText={t("The name of the place where the project is stored")}
                    error={errors.locationName?.message}
                    requiredIndicator={isRequired(schema, name)}
                  />
                )}
              />

              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, onBlur, name, ref } }) => (
                  <SelectLocation
                    id={name}
                    name={name}
                    ref={ref}
                    onBlur={onBlur}
                    onChange={onChange}
                    label={t("Select the address")}
                    placeholder={t("Hamburg")}
                    error={errors.location?.message}
                    creatable={false}
                    requiredIndicator={isRequired(schema, name)}
                  />
                )}
              />
            </div>
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
            <Button size="large" primary fullWidth submit disabled={!isValid || isSubmitting} id="submit">
              {t("Claim Ownership")}
            </Button>
          </form>
        </div>
      </div>
    </div>
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
