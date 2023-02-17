import { useMutation, useQuery } from "@apollo/client";
import { CreateProjectValues } from "components/partials/create/project/CreateProjectForm";
import { ProjectType } from "components/types";
import useInBox from "hooks/useInBox";
import useWallet from "hooks/useWallet";
import { errorFormatter } from "lib/errorFormatter";
import { prepFilesForZenflows, uploadFiles } from "lib/fileUpload";
import { IdeaPoints, StrengthsPoints } from "lib/PointsDistribution";
import {
  ASK_RESOURCE_PRIMARY_ACCOUNTABLE,
  CITE_PROJECT,
  CONTRIBUTE_TO_PROJECT,
  CREATE_LOCATION,
  CREATE_PROCESS,
  CREATE_PROJECT,
  QUERY_PROJECT_TYPES,
  QUERY_UNIT_AND_CURRENCY,
} from "lib/QueryAndMutation";
import {
  CreateLocationMutation,
  CreateLocationMutationVariables,
  CreateProjectMutation,
  CreateProjectMutationVariables,
  GetProjectTypesQuery,
  GetUnitAndCurrencyQuery,
  IFile,
} from "lib/types";
import { useTranslation } from "next-i18next";
import { AddedAsContributorNotification, MessageSubject, ProposalNotification } from "pages/notification";
import { useState } from "react";
import devLog from "../lib/devLog";
import { useAuth } from "./useAuth";
import useStorage from "./useStorage";

export const useProjectCreation = () => {
  const { user } = useAuth();
  const { sendMessage } = useInBox();
  const { addIdeaPoints, addStrengthsPoints } = useWallet();
  const { getItem } = useStorage();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const unitAndCurrency = useQuery<GetUnitAndCurrencyQuery>(QUERY_UNIT_AND_CURRENCY).data?.instanceVariables;
  const [citeProject] = useMutation(CITE_PROJECT);
  const [contributeToProject] = useMutation(CONTRIBUTE_TO_PROJECT);
  const [createProject] = useMutation<CreateProjectMutation, CreateProjectMutationVariables>(CREATE_PROJECT);
  const [createLocation] = useMutation<CreateLocationMutation, CreateLocationMutationVariables>(CREATE_LOCATION);
  const [createProcess] = useMutation(CREATE_PROCESS);
  const { refetch } = useQuery(ASK_RESOURCE_PRIMARY_ACCOUNTABLE);

  type SpatialThingRes = CreateLocationMutation["createSpatialThing"]["spatialThing"];

  const queryProjectTypes = useQuery<GetProjectTypesQuery>(QUERY_PROJECT_TYPES);
  const specs = queryProjectTypes.data?.instanceVariables.specs;
  const projectTypes: { [key in ProjectType]: string } | undefined = specs && {
    design: specs.specProjectDesign.id,
    service: specs.specProjectService.id,
    product: specs.specProjectProduct.id,
  };

  async function handleCreateLocation(
    formData: CreateProjectValues,
    design: boolean
  ): Promise<SpatialThingRes | undefined> {
    const remote = formData.location.remote || design;
    devLog("remote", remote);
    const label =
      formData.location.locationName.length > 0
        ? formData.location.locationName
        : formData.location.location!.address.label;
    const name = remote ? "remote" : label;
    const addr = remote ? "remote" : formData.location.location?.address.label;
    const position = formData.location.location?.position;
    try {
      const { data } = await createLocation({
        variables: {
          name: name,
          addr: addr!,
          lat: position?.lat || 0,
          lng: position?.lng || 0,
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

  const linkDesign = async ({
    design,
    process,
    description,
  }: {
    design: string;
    process: string;
    description: string;
  }) => {
    const citeVariables = {
      agent: user!.ulid,
      resource: design,
      process: process,
      creationTime: new Date().toISOString(),
      unitOne: unitAndCurrency?.units.unitOne.id!,
    };
    await citeProject({ variables: citeVariables });

    const { data } = await refetch({ id: design });
    const resourceOwner = data.economicResource.primaryAccountable.id;
    const message: ProposalNotification = {
      proposalID: design,
      proposerName: user!.name,
      originalResourceID: design,
      originalResourceName: data.economicResource.name,
      text: description,
    };
    await sendMessage(message, [resourceOwner], "Project cited");
    //economic system: points assignments
    addIdeaPoints(user!.ulid, IdeaPoints.OnCite);
    addStrengthsPoints(resourceOwner, StrengthsPoints.OnCite);
  };

  const addRelations = async ({
    resource,
    description,
    processId,
    resourceName,
  }: {
    resource: string;
    description: string;
    processId: string;
    resourceName: string;
  }) => {
    const citeVariables = {
      agent: user!.ulid,
      resource: resource,
      process: processId,
      creationTime: new Date().toISOString(),
      unitOne: unitAndCurrency?.units.unitOne.id!,
    };
    try {
      await citeProject({ variables: citeVariables });

      const { data } = await refetch({ id: resource });
      const resourceOwner = data.economicResource.primaryAccountable.id;
      const message: ProposalNotification = {
        proposalID: resource,
        proposerName: user!.name,
        originalResourceID: resource,
        originalResourceName: resourceName,
        text: description,
      };
      await sendMessage(message, [resourceOwner], "Project cited");

      //economic system: points assignments
      addIdeaPoints(user!.ulid, IdeaPoints.OnCite);
      addStrengthsPoints(resourceOwner, StrengthsPoints.OnCite);
    } catch (e) {
      devLog("error: relation not created", e);
    }
  };

  const addContributors = async ({
    contributors,
    processId,
    title,
    projectId,
    projectType,
  }: {
    contributors: string[];
    processId: string;
    title: string;
    projectId: string;
    projectType: ProjectType;
  }) => {
    for (const contributor of contributors) {
      const contributeVariables = {
        agent: contributor,
        process: processId,
        creationTime: new Date().toISOString(),
        unitOne: unitAndCurrency?.units.unitOne.id!,
        conformTo: projectTypes![projectType],
      };
      devLog("info: contributor variables", contributeVariables);
      const { errors } = await contributeToProject({ variables: contributeVariables });
      if (errors) {
        devLog(`${contributor} not added as contributor: ${errors}`);
        continue;
      }

      const message: AddedAsContributorNotification = {
        projectOwnerId: user!.ulid,
        text: "you have been added as a contributor to a project",
        resourceName: title,
        resourceID: projectId,
        projectOwnerName: user!.name,
      };

      const subject = MessageSubject.ADDED_AS_CONTRIBUTOR;
      await sendMessage(message, [contributor], subject);
      //economic system: points assignments
      addIdeaPoints(user!.ulid, IdeaPoints.OnContributions);
      addStrengthsPoints(contributor, StrengthsPoints.OnContributions);
    }
  };

  const uploadImages = async (images: File[]) => {
    try {
      await uploadFiles(images);
    } catch (e) {
      devLog("error: images not uploaded", e);
    }
    devLog("success: images uploaded");
  };

  const handleProjectCreation = async (
    formData: CreateProjectValues,
    projectType: ProjectType
  ): Promise<string | undefined> => {
    setLoading(true);
    let projectID: string | undefined = undefined;
    try {
      const processName = `creation of ${formData.main.title} by ${user!.name}`;
      const { data: processData } = await createProcess({ variables: { name: processName } });
      devLog("success: process created", processData);

      const processId = processData?.createProcess.process.id;

      let location;
      if (formData.location.location || formData.location.remote) {
        location = await handleCreateLocation(formData, projectType === ProjectType.DESIGN);
      }

      let images: IFile[] = [];
      try {
        images = await prepFilesForZenflows(formData.images, getItem("eddsa"));
        devLog("info: images prepared", images);
      } catch (e) {
        devLog("error: images not prepared", e);
      }

      const tags = formData.main.tags.map(t => encodeURI(t));
      devLog("info: tags prepared", tags);

      const linkedDesign = formData.linkedDesign ? formData.linkedDesign : null;

      if (linkedDesign) {
        await linkDesign({
          design: linkedDesign,
          process: processId,
          description: formData.main.description,
        });
      }

      for (const resource of formData.relations) {
        await addRelations({
          resource,
          description: formData.main.description,
          processId: processId,
          resourceName: formData.main.title,
        });
      }

      const variables: CreateProjectMutationVariables = {
        resourceSpec: projectTypes![projectType],
        process: processData.createProcess.process.id,
        agent: user?.ulid!,
        name: formData.main.title,
        note: formData.main.description,
        location: location?.id!,
        oneUnit: unitAndCurrency?.units.unitOne.id!,
        creationTime: new Date().toISOString(),
        repo: formData.main.link,
        license: formData.licenses[0]?.licenseId || "",
        images,
        tags,
        metadata: JSON.stringify({
          contributors: formData.contributors,
          licenses: formData.licenses,
          relations: formData.relations,
          declarations: formData.declarations,
        }),
      };
      devLog("info: project variables created", variables);

      // Create project
      const { data: createProjectData, errors } = await createProject({ variables });
      if (errors) throw new Error("ProjectNotCreated");

      projectID = createProjectData?.createEconomicEvent.economicEvent.resourceInventoriedAs?.id;

      //economic system: points assignments
      addIdeaPoints(user!.ulid, IdeaPoints.OnCreate);
      addStrengthsPoints(user!.ulid, StrengthsPoints.OnCreate);

      await addContributors({
        contributors: formData.contributors,
        processId: processId,
        title: formData.main.title,
        projectId: createProjectData!.createEconomicEvent.economicEvent.resourceInventoriedAs!.id,
        projectType,
      });

      await uploadImages(formData.images);
    } catch (e) {
      devLog(e);
      let err = errorFormatter(e);
      if (err.includes("has already been taken"))
        err = `${t("One of the images you selected already exists on the server, please upload a different file")}.`;
      setError(err);
    }
    setLoading(false);
    return projectID;
  };

  return {
    handleProjectCreation,
    error,
    loading,
  };
};
