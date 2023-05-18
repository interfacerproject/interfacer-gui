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
import { Banner, Button, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { yupResolver } from "@hookform/resolvers/yup";
import ProjectDisplay from "components/ProjectDisplay";
import SelectTags from "components/SelectTags";
import { ChildrenProp as CP } from "components/brickroom/types";
import FetchProjectLayout, { useProject } from "components/layout/FetchProjectLayout";
import Layout from "components/layout/Layout";
import ContributorsStep from "components/partials/create/project/steps/ContributorsStep";
import LicenseStep, { LicenseStepValues } from "components/partials/create/project/steps/LicenseStep";
import RelationsStep from "components/partials/create/project/steps/RelationsStep";
import PDivider from "components/polaris/PDivider";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import dayjs from "dayjs";
import { useAuth } from "hooks/useAuth";
import { useProjectCRUD } from "hooks/useProjectCRUD";
import { TRANSFER_PROJECT } from "lib/QueryAndMutation";
import devLog from "lib/devLog";
import { errorFormatter } from "lib/errorFormatter";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { isRequired } from "lib/isFieldRequired";
import { TransferProjectMutationVariables } from "lib/types";
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
    relations: Array<string>;
    licenses: LicenseStepValues;
    contributors: Array<string>;
  }
}

const ClaimProject: NextPageWithLayout = () => {
  const router = useRouter();
  const { project } = useProject();
  const { user } = useAuth();
  const [error, setError] = useState<string>("");
  const { t } = useTranslation("ResourceProps");
  const { updateRelations, updateContributors } = useProjectCRUD();

  const [transferProject, { data: economicResource }] = useMutation(TRANSFER_PROJECT);

  const sectionsNames = {
    tags: t("Tags"),
    relations: t("Included"),
    licenses: t("Licenses"),
    contributors: t("Contributors"),
  };

  async function handleClaim(formData: ClaimProjectNS.FormValues) {
    try {
      const tags = formData.tags;
      devLog("info: tags prepared", tags);
      const contributors = formData.contributors;
      devLog("info: contributors prepared", contributors);
      const metadata = JSON.stringify({
        ...project.metadata,
        repositoryOrId: project.metadata.repo,
        licenses: formData.licenses,
      });
      devLog("info: metadata prepared", metadata);

      const variables: TransferProjectMutationVariables = {
        resource: project.id!,
        agent: user!.ulid,
        name: project.name!,
        note: project.note || "",
        metadata: metadata,
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

      await updateContributors(projectTransfered.id!, contributors);
      await updateRelations(projectTransfered.id!, formData.relations);

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
    licenses: [{ licenseId: project.metadata?.license, scope: "main" }],
    contributors: [],
    relations: [],
  };

  const schema = yup
    .object({
      tags: yup.array(yup.string()),
      licenses: yup.array(yup.object({ licenseId: yup.string().required(), scope: yup.string().required() })),
      relations: yup.array(yup.string()),
      contributors: yup.array(yup.string()),
    })
    .required();

  const form = useForm<ClaimProjectNS.FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { formState, control, handleSubmit, watch, setValue, trigger } = form;
  const { isValid, errors } = formState;

  const ClaimNav = () => {
    return (
      <div className="space-y-2">
        <div className="border-b-1 pb-1 border-border-subdued px-2">
          <Text as="p" variant="bodySm" color="subdued">
            <span className="uppercase font-bold">{t("sections")}</span>
          </Text>
        </div>

        <div className="space-y-1">
          {Object.values(sectionsNames).map(link => (
            <a href={`#${link}`} key={link}>
              <div className="px-2 py-1 rounded-md hover:cursor-pointer hover:bg-surface-neutral-hovered">{link}</div>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(handleClaim)}>
        <div className="flex justify-center items-start space-x-8 md:space-x-16 lg:space-x-24 p-6">
          <div className="sticky top-24">
            <ClaimNav />
          </div>
          <div className="grow max-w-xl px-6 pb-24 pt-0">
            <Stack vertical spacing="extraLoose">
              <PTitleSubtitle
                title={t("Claim ownership over this resource")}
                subtitle={t(
                  "Read the guidelines. Be sure to fill in all the required fields. You can always edit them later."
                )}
              />
              <ProjectDisplay project={project} />

              <PDivider id={sectionsNames.tags} />
              <PTitleSubtitle
                title={t("Add tags")}
                subtitle={t("Help us to categorize your project. This will help other people to find it.")}
              />
              <Controller
                control={control}
                name="tags"
                render={() => (
                  <SelectTags
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

              <PDivider id={sectionsNames.relations} />
              <RelationsStep />

              <PDivider id={sectionsNames.contributors} />
              <ContributorsStep />

              <PDivider id={sectionsNames.licenses} />
              <LicenseStep />

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
