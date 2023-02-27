import { useMutation, useQuery } from "@apollo/client";
import { CreateProjectValues } from "components/partials/create/project/CreateProjectForm";
import { DeclarationsStepValues } from "components/partials/create/project/steps/DeclarationsStep";
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
  RELOCATE_PROJECT,
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
import { QUERY_PROJECT_FOR_METADATA_UPDATE } from "../lib/QueryAndMutation";
import {
  QueryProjectForMetadataUpdateQuery,
  QueryProjectForMetadataUpdateQueryVariables,
  UpdateMetadataMutation,
  UpdateMetadataMutationVariables,
} from "../lib/types/index";
import { LocationStepValues } from "./../components/partials/create/project/steps/LocationStep";
import { RelocateProjectMutation, RelocateProjectMutationVariables } from "./../lib/types/index";
import { useAuth } from "./useAuth";
import useStorage from "./useStorage";

export const useProjectCRUD = () => {
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
    location: LocationStepValues,
    design: boolean
  ): Promise<{ remote: boolean; st: SpatialThingRes | undefined }> {
    const remote = location.remote || design;
    if (!location.locationData) return { st: undefined, remote: remote };
    try {
      const { data } = await createLocation({
        variables: {
          name: location.locationName || location.locationData?.address!,
          addr: location.locationData?.address!,
          lat: location.locationData?.lat || 0,
          lng: location.locationData?.lng || 0,
        },
      });
      const st = data?.createSpatialThing.spatialThing;
      devLog("success: location created", st);
      return { st: st, remote: remote };
    } catch (e) {
      devLog("error: location not created", e);
      throw e;
    }
  }

  const addRelation = async (projectId: string, processId: string, originalProjectId: string) => {
    const citeVariables = {
      agent: user!.ulid,
      resource: projectId,
      process: processId,
      creationTime: new Date().toISOString(),
      unitOne: unitAndCurrency?.units.unitOne.id!,
    };
    try {
      await citeProject({ variables: citeVariables });
      const { data } = await refetch({ id: projectId });
      const resourceOwner = data.economicResource.primaryAccountable.id;
      const message: ProposalNotification = {
        proposalID: projectId,
        proposerName: user!.name,
        originalResourceID: originalProjectId,
        originalResourceName: originalProjectId,
      };
      await sendMessage(message, [resourceOwner], "Project cited");

      //economic system: points assignments
      addIdeaPoints(user!.ulid, IdeaPoints.OnCite);
      addStrengthsPoints(resourceOwner, StrengthsPoints.OnCite);
    } catch (e) {
      devLog("error: relation not created", e);
    }
  };

  const linkDesign = async ({
    design,
    process,
    originalProjectId,
  }: {
    design: string;
    process: string;
    originalProjectId: string;
  }) => {
    await addRelation(design, process, originalProjectId);
  };

  const addRelations = async (projectId: string, relations: string[], processId: string) => {
    for (const relation of relations) {
      await addRelation(relation, processId, projectId);
    }
  };

  const addContributor = async (contributor: string, processId: string, projectId: string) => {
    const contributeVariables = {
      agent: contributor,
      process: processId,
      creationTime: new Date().toISOString(),
      unitOne: unitAndCurrency?.units.unitOne.id!,
      // we need some system variables for contributions types
      conformsTo: projectTypes![ProjectType.DESIGN],
    };
    devLog("info: contributor variables", contributeVariables);
    const { errors } = await contributeToProject({ variables: contributeVariables });
    if (errors) {
      devLog(`${contributor} not added as contributor: ${errors}`);
    }
    const message: AddedAsContributorNotification = {
      projectOwnerId: user!.ulid,
      text: "you have been added as a contributor to a project",
      resourceName: projectId,
      resourceID: projectId,
      projectOwnerName: user!.name,
    };
    await sendMessage(message, [contributor], MessageSubject.ADDED_AS_CONTRIBUTOR);
    //economic system: points assignments
    addIdeaPoints(user!.ulid, IdeaPoints.OnContributions);
    addStrengthsPoints(contributor, StrengthsPoints.OnContributions);
  };

  const addContributors = async (projectId: string, contributors: string[], processId: string) => {
    for (const contributor of contributors) {
      await addContributor(contributor, processId, projectId);
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
    let projectId: string | undefined;
    try {
      const processName = `creation of ${formData.main.title} by ${user!.name}`;
      const processId = await createProcess(processName);
      devLog("success: process created", processName, processId);
      let location;
      if (formData.location.locationData || formData.location.remote) {
        location = await handleCreateLocation(formData.location, projectType === ProjectType.DESIGN);
      }
      const images: IFile[] = await prepFilesForZenflows(formData.images, getItem("eddsaPrivateKey"));
      devLog("info: images prepared", images);
      const tags = formData.main.tags.length > 0 ? formData.main.tags : undefined;
      devLog("info: tags prepared", tags);

      const variables: CreateProjectMutationVariables = {
        resourceSpec: projectTypes![projectType],
        process: processId,
        agent: user?.ulid!,
        name: formData.main.title,
        note: formData.main.description,
        location: location?.st?.id!,
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
          remote: location?.remote,
        }),
      };
      devLog("info: project variables created", variables);

      // Create project
      const { data: createProjectData, errors } = await createProject({ variables });
      if (errors) throw new Error("ProjectNotCreated");

      projectId = createProjectData?.createEconomicEvent.economicEvent.resourceInventoriedAs?.id;
      if (!projectId) throw new Error("ProjectNotCreated");

      //economic system: points assignments
      addIdeaPoints(user!.ulid, IdeaPoints.OnCreate);
      addStrengthsPoints(user!.ulid, StrengthsPoints.OnCreate);

      const linkedDesign = formData.linkedDesign ? formData.linkedDesign : null;

      if (linkedDesign) {
        await linkDesign({
          design: linkedDesign,
          process: processId,
          originalProjectId: projectId,
        });
      }

      for (const resource of formData.relations) {
        await addRelation(resource, processId, projectId);
      }

      await addContributors(
        createProjectData!.createEconomicEvent.economicEvent.resourceInventoriedAs!.id,
        formData.contributors,
        processId
      );

      await uploadImages(formData.images);
    } catch (e) {
      devLog(e);
      let err = errorFormatter(e);
      if (err.includes("has already been taken"))
        err = `${t("One of the images you selected already exists on the server, please upload a different file")}.`;
      setError(err);
    }
    setLoading(false);
    return projectId;
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
    const quantity = project.onhandQuantity;
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
  const updateDeclarations = async (projectId: string, declarations: DeclarationsStepValues) => {
    try {
      const project = await getProjectForMetadataUpdate(projectId);
      const processId = await createProcess(`declarations update @ ${project.name}`);
      await updateMetadata(project, { declarations }, processId);
      devLog("success: declarations updated");
    } catch (e) {
      devLog("error: declarations not updated", e);
      throw e;
    }
  };

  type CbUpdateFunction = (projectId: string, array: Array<string>, processId: string) => Promise<void>;

  const updateMetadataArray = async (projectId: string, array: string[], key: string, cb: CbUpdateFunction) => {
    try {
      const project = await getProjectForMetadataUpdate(projectId);
      const oldArray = project.metadata[key];
      if (arrayEquals(oldArray, array)) return;
      const processName = `${key} update @ ${project.name}`;
      const processId = await createProcess(processName);
      devLog("success: process created", processName, processId);
      const newArray = getNewElements(project.metadata[key], array);
      if (newArray.length > 0) await cb(projectId, newArray, processId);
      await updateMetadata(project, { [key]: array }, processId);
      devLog(`success: ${key} updated`);
    } catch (e) {
      devLog(`error: ${key} not updated`, e);
      throw e;
    }
  };
  const [relocateProjectMutation] = useMutation<RelocateProjectMutation, RelocateProjectMutationVariables>(
    RELOCATE_PROJECT
  );

  const relocateProject = async (projectId: string, locationValues: LocationStepValues) => {
    const project = await getProjectForMetadataUpdate(projectId);
    if (project.primaryAccountable?.id !== user?.ulid) throw new Error("NotAuthorized");
    const processId = await createProcess(`relocate project @ ${project.name}`);
    if (locationValues.remote !== project.metadata.remote)
      await updateMetadata(project, { remote: locationValues.remote }, processId);
    if (
      !locationValues.locationData ||
      (locationValues.locationData?.address === project.currentLocation?.mappableAddress &&
        locationValues.locationName === project.currentLocation?.name)
    )
      return;
    const location = await handleCreateLocation(locationValues, project.conformsTo?.name === ProjectType.DESIGN);
    const quantity = project.onhandQuantity;
    const variables: RelocateProjectMutationVariables = {
      process: processId,
      agent: user!.ulid,
      location: location.st!.id,
      now: new Date().toISOString(),
      resource: project.id!,
      quantity: { hasNumericalValue: quantity?.hasNumericalValue, hasUnit: quantity?.hasUnit?.id },
    };
    devLog("info: metadata variables created", variables);
    const { errors } = await relocateProjectMutation({ variables });
    if (errors) throw new Error(`Metadata not updated: ${errors}`);
  };

  return {
    handleProjectCreation,
    error,
    loading,
    updateLicenses,
    updateDeclarations,
    updateContributors: (projectId: string, contributors: Array<string>) =>
      updateMetadataArray(projectId, contributors, "contributors", addContributors),
    updateRelations: (projectId: string, relations: Array<string>) =>
      updateMetadataArray(projectId, relations, "relations", addRelations),
    relocateProject,
  };
};
