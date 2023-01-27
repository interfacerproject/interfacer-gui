import { IdeaPoints, StrengthsPoints } from "lib/PointsDistribution";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ReactElement, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import type { NextPageWithLayout } from "./_app";

// Partials
import { Banner, Button } from "@bbtgnn/polaris-interfacer";
import CreateProjectForm, { CreateProjectNS } from "components/partials/create_project/CreateProjectForm";

// Layout
import Layout from "../components/layout/Layout";

// Queries
import { useMutation, useQuery } from "@apollo/client";
import useStorage from "hooks/useStorage";
import { prepFilesForZenflows, uploadFiles } from "lib/fileUpload";
import {
  ASK_RESOURCE_PRIMARY_ACCOUNTABLE,
  CITE_PROJECT,
  CONTRIBUTE_TO_PROJECT,
  CREATE_LOCATION,
  CREATE_PROCESS,
  CREATE_PROJECT,
  QUERY_UNIT_AND_CURRENCY,
} from "lib/QueryAndMutation";
import {
  CreateLocationMutation,
  CreateLocationMutationVariables,
  CreateProjectMutation,
  CreateProjectMutationVariables,
  GetUnitAndCurrencyQuery,
} from "lib/types";

// Utils
import useWallet from "hooks/useWallet";
import devLog from "lib/devLog";
import { errorFormatter } from "lib/errorFormatter";
import { useRouter } from "next/router";
import useInBox from "../hooks/useInBox";
import { AddedAsContributorNotification, MessageSubject, ProposalNotification } from "./notification";

//

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "createProjectProps",
        "signInProps",
        "SideBarProps",
        "SideBarProps",
        "BrImageUploadProps",
      ])),
    },
  };
}

//

const CreateProject: NextPageWithLayout = () => {
  const { t } = useTranslation("createProjectProps");
  const { user, loading } = useAuth();
  const router = useRouter();
  const { sendMessage } = useInBox();
  const { getItem } = useStorage();
  const { addIdeaPoints, addStrengthsPoints } = useWallet();
  const [error, setError] = useState<string>("");

  /* Getting all the needed mutations */

  const unitAndCurrency = useQuery<GetUnitAndCurrencyQuery>(QUERY_UNIT_AND_CURRENCY).data?.instanceVariables;
  const [citeProject] = useMutation(CITE_PROJECT);
  const [contributeToProject] = useMutation(CONTRIBUTE_TO_PROJECT);
  const [createProject] = useMutation<CreateProjectMutation, CreateProjectMutationVariables>(CREATE_PROJECT);
  const [createLocation] = useMutation<CreateLocationMutation, CreateLocationMutationVariables>(CREATE_LOCATION);
  const [createProcess] = useMutation(CREATE_PROCESS);
  const { refetch } = useQuery(ASK_RESOURCE_PRIMARY_ACCOUNTABLE);

  /* Location Creation */

  type SpatialThingRes = CreateLocationMutation["createSpatialThing"]["spatialThing"];

  async function handleCreateLocation(formData: CreateProjectNS.FormValues): Promise<SpatialThingRes | undefined> {
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

  async function handleProjectCreation(formData: CreateProjectNS.FormValues) {
    try {
      const processName = `creation of ${formData.name} by ${user!.name}`;
      const { data: processData } = await createProcess({ variables: { name: processName } });
      devLog("success: process created", processData);

      const location = await handleCreateLocation(formData);
      // devLog is in handleCreateLocation
      const images = await prepFilesForZenflows(formData.images, getItem("eddsa"));
      devLog("info: images prepared", images);
      const tags = formData.tags.map(t => encodeURI(t.value));
      devLog("info: tags prepared", tags);
      const contributors = formData.contributors.map(c => c.value);
      devLog("info: contributors prepared", contributors);

      for (const resource of formData.resources) {
        const resourceId = resource.value.id;

        const citeVariables = {
          agent: user!.ulid,
          resource: resourceId,
          process: processData?.createProcess.process.id,
          creationTime: new Date().toISOString(),
          unitOne: unitAndCurrency?.units.unitOne.id!,
        };
        await citeProject({ variables: citeVariables });

        const { data } = await refetch({ id: resourceId });
        const resourceOwner = data.economicResource.primaryAccountable.id;
        const message: ProposalNotification = {
          proposalID: resourceId,
          proposerName: user!.name,
          originalResourceID: resourceId,
          originalResourceName: resource.value.name,
          text: formData.description,
        };
        await sendMessage(message, [resourceOwner], "Project cited");

        //economic system: points assignments
        addIdeaPoints(user!.ulid, IdeaPoints.OnCite);
        addStrengthsPoints(resourceOwner, StrengthsPoints.OnCite);
      }

      const variables: CreateProjectMutationVariables = {
        resourceSpec: formData.type,
        process: processData.createProcess.process.id,
        agent: user?.ulid!,
        name: formData.name,
        note: formData.description,
        metadata: JSON.stringify({ contributors: contributors }),
        location: location?.id!,
        oneUnit: unitAndCurrency?.units.unitOne.id!,
        creationTime: new Date().toISOString(),
        repo: formData.repo,
        license: formData.license,
        images,
        tags,
      };
      devLog("info: project variables created", variables);

      // Create project
      const { data: createProjectData, errors } = await createProject({ variables });
      if (errors) throw new Error("ProjectNotCreated");

      //economic system: points assignments
      addIdeaPoints(user!.ulid, IdeaPoints.OnCreate);
      addStrengthsPoints(user!.ulid, StrengthsPoints.OnCreate);

      // Add contributors
      for (const contributor of contributors) {
        const contributeVariables = {
          agent: contributor.id,
          process: processData?.createProcess.process.id,
          creationTime: new Date().toISOString(),
          unitOne: unitAndCurrency?.units.unitOne.id!,
          conformTo: formData.type,
        };
        devLog("info: contributor variables", contributeVariables);

        const { errors } = await contributeToProject({ variables: contributeVariables });
        if (errors) {
          devLog(`${contributor.id} not added as contributor: ${errors}`);
          continue;
        }

        const message: AddedAsContributorNotification = {
          projectOwnerId: user!.ulid,
          text: "you have been added as a contributor to a project",
          resourceName: formData.name,
          resourceID: createProjectData!.createEconomicEvent.economicEvent.resourceInventoriedAs!.id,
          projectOwnerName: user!.name,
        };

        const subject = MessageSubject.ADDED_AS_CONTRIBUTOR;
        await sendMessage(message, [contributor.id], subject);

        //economic system: points assignments
        addIdeaPoints(user!.ulid, IdeaPoints.OnContributions);
        addStrengthsPoints(contributor.id, StrengthsPoints.OnContributions);
      }

      // Upload images
      try {
        await uploadFiles(formData.images);
      } catch (e) {
        devLog("error: images not uploaded", e);
      }
      devLog("success: images uploaded");

      // Redirecting user
      await router.replace(
        `/project/${createProjectData?.createEconomicEvent?.economicEvent?.resourceInventoriedAs?.id}`
      );
    } catch (e) {
      devLog(e);
      let err = errorFormatter(e);
      if (err.includes("has already been taken"))
        err = `${t("One of the images you selected already exists on the server, please upload a different file")}.`;
      setError(err);
    }
  }

  return (
    <>
      <div className="p-4 text-text-primary">
        <Button
          onClick={() => {
            router.back();
          }}
          plain
          monochrome
          id="#back"
        >
          {t("← Discard and go back")}
        </Button>
      </div>

      {loading && <div>creating...</div>}

      {!loading && (
        <div className="mx-auto p-8 max-w-xl">
          {/* Heading */}
          <div>
            <h2 className="text-primary">{t("Create a new project")} </h2>
            <p>{t("Make sure you read the Comunity Guidelines before you create a new project")}.</p>
            <p>{t("Fields marked with a red asterisk are mandatory")}.</p>
          </div>

          <CreateProjectForm
            onSubmit={async data => {
              await handleProjectCreation(data);
            }}
          >
            {error && (
              <Banner
                title={t("Error in Project creation")}
                status="critical"
                onDismiss={() => {
                  setError("");
                }}
              >
                <p className="whitespace-pre-wrap">{error}</p>
              </Banner>
            )}
          </CreateProjectForm>
        </div>
      )}
    </>
  );
};

//

CreateProject.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default CreateProject;
