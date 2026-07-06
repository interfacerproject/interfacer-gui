import { CreateProjectValues } from "components/partials/create/project/CreateProjectForm";
import { DeclarationsStepValues } from "components/partials/create/project/steps/DeclarationsStep";
import { ProjectType } from "components/types";
import useInBox from "hooks/useInBox";
import useWallet from "hooks/useWallet";
import { IdeaPoints, StrengthsPoints } from "lib/PointsDistribution";
import { errorFormatter } from "lib/errorFormatter";
import {
  derivedProductFilterTags,
  MANUFACTURABLE_TRUE_TAG,
  normalizeUserTagsForSave,
  prefixedTag,
  TAG_PREFIX,
} from "lib/tagging";
import { uploadFiles } from "lib/fileUpload";
import { uploadModelFilesToDpp } from "lib/projectModelFiles";
import { useTranslation } from "next-i18next";
import { LocationStepValues } from "components/partials/create/project/steps/LocationStep";
import { useAuth } from "./useAuth";
import { useResourceSpecs } from "./useResourceSpecs";
import devLog from "lib/devLog";
import { useState } from "react";
import { AddedAsContributorNotification, MessageSubject, ProposalNotification } from "pages/notification";

export const useProjectCRUD = () => {
  const { user, client } = useAuth();
  const { sendMessage } = useInBox();
  const { addIdeaPoints, addStrengthsPoints } = useWallet({});
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Get resource specs using the SDK
  const { specProjectDesign, specProjectProduct, specProjectService, specMachine, specDpp, hasAllSpecs } =
    useResourceSpecs();

  const projectTypes: { [key in ProjectType]: string } | undefined = hasAllSpecs
    ? {
        [ProjectType.DESIGN]: specProjectDesign!.id,
        [ProjectType.SERVICE]: specProjectService!.id,
        [ProjectType.PRODUCT]: specProjectProduct!.id,
        [ProjectType.MACHINE]: specMachine!.id,
        [ProjectType.DPP]: specDpp!.id,
      }
    : undefined;

  async function handleCreateLocation(
    location: LocationStepValues,
    design: boolean
  ): Promise<{ remote: boolean; id: string | undefined }> {
    const remote = location.remote || design;
    if (!location.locationData || !client) return { id: undefined, remote: remote };
    try {
      const st = await client.resources.createLocation({
        name: location.locationName || location.locationData?.address!,
        address: location.locationData?.address!,
        lat: location.locationData?.lat || 0,
        lng: location.locationData?.lng || 0,
      });
      devLog("success: location created", st);
      return { id: st.id, remote: remote };
    } catch (e) {
      devLog("error: location not created", e);
      throw e;
    }
  }

  const addRelation = async (projectId: string, processId: string) => {
    if (!client || !user) return;
    try {
      await client.resources.citeResource(projectId, processId);
      addIdeaPoints(user!.ulid, IdeaPoints.OnCite);
    } catch (e) {
      devLog("error: relation not created", e);
    }
  };

  const addContributor = async (contributor: string, processId: string, projectId: string) => {
    if (!client || !user || !projectTypes) return;
    try {
      await client.resources.contributeToResource(processId, projectTypes[ProjectType.DESIGN]);
      const message: AddedAsContributorNotification = {
        projectOwnerId: user!.ulid,
        text: "you have been added as a contributor to a project",
        resourceName: projectId,
        resourceID: projectId,
        projectOwnerName: user!.name,
      };
      await sendMessage(message, [contributor], MessageSubject.ADDED_AS_CONTRIBUTOR);
      addIdeaPoints(user!.ulid, IdeaPoints.OnContributions);
      addStrengthsPoints(contributor, StrengthsPoints.OnContributions);
    } catch (e) {
      devLog(`${contributor} not added as contributor: ${e}`);
    }
  };

  const handleMachineCreation = async (formData: CreateProjectValues): Promise<string | undefined> => {
    if (!client || !user) return;
    setLoading(true);
    try {
      const machine = await client.resources.createMachine({
        name: formData.main.title,
        note: formData.main.description,
        metadata: {
          contributors: formData.contributors,
          relations: formData.relations,
          remote: formData.location.remote || false,
          repo: formData.main.link,
        },
      });
      addIdeaPoints(user!.ulid, IdeaPoints.OnCreate);
      addStrengthsPoints(user!.ulid, StrengthsPoints.OnCreate);
      setLoading(false);
      return machine.id;
    } catch (e) {
      setError(errorFormatter(e));
      setLoading(false);
      return undefined;
    }
  };

  const handleProjectCreation = async (
    formData: CreateProjectValues,
    projectType: ProjectType,
    dppUlid?: string
  ): Promise<string | undefined> => {
    if (!client || !user) return;
    setLoading(true);
    try {
      const processId = await client.resources.createProcess(`creation of ${formData.main.title} by ${user!.name}`);
      devLog("process created", processId);

      // Location
      let locationId: string | undefined;
      if (formData.location.locationData || formData.location.remote) {
        const loc = await handleCreateLocation(formData.location, projectType === ProjectType.DESIGN);
        locationId = loc.id;
      }

      // Tags
      const machineTags = (formData.machines?.machineDetails || [])
        .map(m => prefixedTag(TAG_PREFIX.MACHINE, m.name))
        .filter(Boolean) as string[];
      const materialTags = (formData.materials?.materialDetails || [])
        .map(m => prefixedTag(TAG_PREFIX.MATERIAL, m.name))
        .filter(Boolean) as string[];
      const productFilterTags = derivedProductFilterTags((formData.productFilters as any) || {});
      const serviceTypeTags = (formData.serviceFilters?.serviceType || [])
        .map(s => prefixedTag(TAG_PREFIX.SERVICE_TYPE, s))
        .filter(Boolean) as string[];
      const availabilityTags = (formData.serviceFilters?.availability || [])
        .map(a => prefixedTag(TAG_PREFIX.AVAILABILITY, a))
        .filter(Boolean) as string[];
      const licenseTags = (formData.licenses || [])
        .map(l => prefixedTag(TAG_PREFIX.LICENSE, l.licenseId))
        .filter(Boolean) as string[];
      const baseTags = normalizeUserTagsForSave(formData.main.tags);

      const tags = Array.from(
        new Set([
          ...baseTags,
          ...machineTags,
          ...materialTags,
          ...productFilterTags,
          ...serviceTypeTags,
          ...availabilityTags,
          ...licenseTags,
        ])
      );

      // Metadata
      const metadata: Record<string, unknown> = {
        contributors: formData.contributors,
        licenses: formData.licenses,
        relations: formData.relations,
        declarations: formData.declarations,
        remote: formData.location.remote || projectType === ProjectType.DESIGN,
        design: formData.linkedDesign || false,
      };

      // Create project
      const project = await client.resources.createProject({
        projectType: projectType as any,
        name: formData.main.title,
        note: formData.main.description,
        tags,
        repo: formData.main.link,
        license: formData.licenses[0]?.licenseId || "",
        locationId: locationId || undefined,
        processId,
        metadata,
      });

      const projectId = project.id;

      // DPP
      if (dppUlid && specDpp) {
        try {
          const dppRes = await client.resources.createDppResource({
            name: `DPP for ${formData.main.title}`,
            note: `Digital Product Passport for ${formData.main.title}`,
            dppUlid,
          });
          await client.resources.citeResource(dppRes.id, processId);
        } catch (e) {
          devLog("DPP resource creation failed", e);
        }
      }

      // Cite linked design
      if (formData.linkedDesign) {
        await client.resources.citeResource(formData.linkedDesign, processId);
        try {
          // Mark design as manufacturable
          await client.resources.updateClassifiedAs(formData.linkedDesign, [MANUFACTURABLE_TRUE_TAG]);
        } catch (e) {
          devLog("Failed to mark design manufacturable", e);
        }
      }

      // Relations
      for (const rel of formData.relations) {
        await addRelation(rel, processId);
      }

      // Contributors
      for (const contributor of formData.contributors) {
        await addContributor(contributor, processId, projectId);
      }

      // Upload images
      await uploadFiles(formData.images);

      // Points
      addIdeaPoints(user!.ulid, IdeaPoints.OnCreate);
      addStrengthsPoints(user!.ulid, StrengthsPoints.OnCreate);

      setLoading(false);
      return projectId;
    } catch (e) {
      devLog(e);
      setError(errorFormatter(e));
      setLoading(false);
      return undefined;
    }
  };

  const updateMetadata = async (projectOrId: string | Partial<{ id: string }>, metadata: Record<string, unknown>) => {
    if (!client) throw new Error("Not authenticated");
    const projectId = typeof projectOrId === "string" ? projectOrId : projectOrId.id!;
    await client.resources.updateMetadata(projectId, metadata);
  };

  return {
    handleProjectCreation,
    handleMachineCreation,
    error,
    loading,
    updateLicenses: async (projectId: string, licenses: any[]) => updateMetadata(projectId, { licenses }),
    updateDeclarations: async (projectId: string, declarations: any) => updateMetadata(projectId, { declarations }),
    updateContributors: async (projectId: string, contributors: string[]) =>
      updateMetadata(projectId, { contributors }),
    updateRelations: async (projectId: string, relations: string[]) => updateMetadata(projectId, { relations }),
    relocateProject: async (_id?: string, _values?: any) => {},
    updateMetadata,
    handleCreateLocation: async (_loc?: any, _design?: boolean) => ({ remote: true, st: undefined }),
  };
};
