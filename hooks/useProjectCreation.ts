import { useMutation, useQuery } from "@apollo/client";
import { CreateProjectValues } from "components/partials/create/project/CreateProjectForm";
import { ProjectType } from "components/types";
import useInBox from "hooks/useInBox";
import useWallet from "hooks/useWallet";
import { arrayEquals, getNewElements } from "lib/arrayOperations";
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
  UPDATE_METADATA,
} from "lib/QueryAndMutation";
import {
  CreateLocationMutation,
  CreateLocationMutationVariables,
  CreateProjectMutation,
  CreateProjectMutationVariables,
  EconomicResource,
  GetProjectTypesQuery,
  GetUnitAndCurrencyQuery,
  IFile,
} from "lib/types";
import { useTranslation } from "next-i18next";
import { AddedAsContributorNotification, MessageSubject, ProposalNotification } from "pages/notification";
import { useState } from "react";
import devLog from "../lib/devLog";
import { QUERY_PROJECT_FOR_METADATA_UPDATE } from "./../lib/QueryAndMutation";
import {
  QueryProjectForMetadataUpdateQuery,
  QueryProjectForMetadataUpdateQueryVariables,
  UpdateMetadataMutation,
  UpdateMetadataMutationVariables,
} from "./../lib/types/index";
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
  const [createProcessMutation] = useMutation(CREATE_PROCESS);
  const { refetch } = useQuery(ASK_RESOURCE_PRIMARY_ACCOUNTABLE);

  type SpatialThingRes = CreateLocationMutation["createSpatialThing"]["spatialThing"];

  const queryProjectTypes = useQuery<GetProjectTypesQuery>(QUERY_PROJECT_TYPES);
  const specs = queryProjectTypes.data?.instanceVariables.specs;
  const projectTypes: { [key in ProjectType]: string } | undefined = specs && {
    [ProjectType.DESIGN]: specs.specProjectDesign.id,
    [ProjectType.SERVICE]: specs.specProjectService.id,
    [ProjectType.PRODUCT]: specs.specProjectProduct.id,
  };

  const createProcess = async (name: string): Promise<string> => {
    const { data } = await createProcessMutation({ variables: { name } });
    return data?.createProcess.process.id;
  };

  const { refetch: queryProjectForMetadataUpdate } = useQuery<
    QueryProjectForMetadataUpdateQuery,
    QueryProjectForMetadataUpdateQueryVariables
  >(QUERY_PROJECT_FOR_METADATA_UPDATE);

  const [updateMetadataMutation] = useMutation<UpdateMetadataMutation, UpdateMetadataMutationVariables>(
    UPDATE_METADATA
  );

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

  const addRelation = async (resourceId: string, processId: string, resourceName: string) => {
    const citeVariables = {
      agent: user!.ulid,
      resource: resourceId,
      process: processId,
      creationTime: new Date().toISOString(),
      unitOne: unitAndCurrency?.units.unitOne.id!,
    };
    try {
      await citeProject({ variables: citeVariables });

      const { data } = await refetch({ id: resourceId });
      const resourceOwner = data.economicResource.primaryAccountable.id;
      const message: ProposalNotification = {
        proposalID: resourceId,
        proposerName: user!.name,
        originalResourceID: resourceId,
        originalResourceName: resourceName,
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
      const processId = await createProcess(processName);
      devLog("success: process created", processName, processId);
      let location;
      if (formData.location.location || formData.location.remote) {
        location = await handleCreateLocation(formData, projectType === ProjectType.DESIGN);
      }
      const images: IFile[] = await prepFilesForZenflows(formData.images, getItem("eddsaPrivateKey"));
      devLog("info: images prepared", images);
      const tags = formData.main.tags.length > 0 ? formData.main.tags : undefined;
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
        await addRelation(resource, processId, formData.main.title);
      }

      const variables: CreateProjectMutationVariables = {
        resourceSpec: projectTypes![projectType],
        process: processId,
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

  const getProjectForMetadataUpdate = async (projectId: string): Promise<Partial<EconomicResource>> => {
    const { data, errors } = await queryProjectForMetadataUpdate({ id: projectId });
    if (errors) throw new Error("ProjectNotFound");
    return data?.economicResource as Partial<EconomicResource>;
  };

  const updateMetadata = async (
    project: Partial<EconomicResource>,
    metadata: Record<string, unknown>,
    processId: string
  ) => {
    if (project.primaryAccountable?.id !== user?.ulid) throw new Error("NotAuthorized");
    const newMetadata = { ...project.metadata, ...metadata };
    const quantity = project.accountingQuantity;
    const variables: UpdateMetadataMutationVariables = {
      process: processId,
      metadata: JSON.stringify(newMetadata),
      agent: user!.ulid,
      now: new Date().toISOString(),
      resource: project.id!,
      quantity: { hasNumericalValue: quantity?.hasNumericalValue, hasUnit: quantity?.hasUnit?.id },
    };
    devLog("info: metadata variables created", variables);
    const { errors } = await updateMetadataMutation({ variables });
    if (errors) throw new Error(`Metadata not updated: ${errors}`);
  };

  const updateLicenses = async (projectId: string, licenses: Array<{ scope: string; licenseId: string }>) => {
    try {
      const project = await getProjectForMetadataUpdate(projectId);
      const processId = await createProcess(`licenses update @ ${project.name}`);
      await updateMetadata(project, { licenses }, processId);
      devLog("success: licenses updated");
    } catch (e) {
      devLog("error: licenses not updated", e);
      throw e;
    }
  };

  const updateContributors = async (projectId: string, contributors: string[]) => {
    try {
      const project = await getProjectForMetadataUpdate(projectId);
      const oldContributors = project.metadata.contributors;
      if (arrayEquals(oldContributors, contributors)) return;
      const processName = `contributors update @ ${project.name}`;
      const processId = await createProcess(processName);
      devLog("success: process created", processName, processId);
      //
      const contributorsToCreate = getNewElements(project.metadata.contributors, contributors);
      if (contributorsToCreate.length > 0)
        await addContributors({
          contributors: contributorsToCreate,
          processId,
          title: projectId,
          projectId,
          projectType: ProjectType.DESIGN,
        });
      //
      await updateMetadata(project, { contributors }, processId);
      devLog("success: contributors updated");
    } catch (e) {
      devLog("error: contributors not updated", e);
      throw e;
    }
  };

  const addRelations = async (relations: string[], processId: string) => {
    for (const relation of relations) {
      await addRelation(relation, processId, relation);
    }
  };

  const updateRelations = async (projectId: string, relations: string[]) => {
    try {
      const project = await getProjectForMetadataUpdate(projectId);
      const processName = `relations update @ ${project.name}`;
      const processId = await createProcess(processName);
      devLog("success: process created", processName, processId);
      //
      const relationsToCreate = getNewElements(project.metadata.relations, relations);
      if (relationsToCreate.length > 0) await addRelations(relationsToCreate, processId);
      //
    } catch (e) {
      devLog("error: relations not updated", e);
      throw e;
    }
  };

  return {
    handleProjectCreation,
    error,
    loading,
    updateLicenses,
    updateContributors,
    // updateRelations,
  };
};
