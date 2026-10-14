import { CreateProjectValues } from "components/partials/create/project/CreateProjectForm";
import { DeclarationsStepValues } from "components/partials/create/project/steps/DeclarationsStep";
import { ProjectType } from "components/types";
import { useInBoxContext } from "hooks/useInBox";
import useWallet from "hooks/useWallet";
import { IdeaPoints, StrengthsPoints } from "lib/PointsDistribution";
import { errorFormatter } from "lib/errorFormatter";
import {
  COMPLEXITY_PREFIX,
  derivedProductFilterTags,
  MANUFACTURABLE_TRUE_TAG,
  normalizeUserTagsForSave,
  prefixedTag,
  TAG_PREFIX,
} from "lib/tagging";
import { useTranslation } from "next-i18next";
import { LocationStepValues } from "components/partials/create/project/steps/LocationStep";
import { useAuth } from "./useAuth";
import { useResourceSpecs } from "./useResourceSpecs";
import devLog from "lib/devLog";
import { updateResourceMetadataFields } from "lib/resourceMetadata";
import {
  createProjectWithFollowUps,
  manufacturableStep,
  ProjectCreationOutcome,
  ProjectFollowUp,
} from "lib/projectCreation";
import { useState } from "react";
import { AddedAsContributorNotification, MessageSubject, ProposalNotification } from "pages/notification";

export const useProjectCRUD = () => {
  const { user, client } = useAuth();
  const { sendMessage } = useInBoxContext();
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

  /** Cite a related project in the new project's process; the owner notification is best-effort. */
  const addRelation = async (projectId: string, processId: string, newProjectId: string) => {
    if (!client || !user) return;
    await client.resources.citeResource(projectId, processId);
    try {
      const res = await client.graphql.request<any>(
        `query($id: ID!) { economicResource(id: $id) { id name primaryAccountable { id } } }`,
        { id: projectId }
      );
      const citedProject = res.data?.economicResource;
      // Don't send notification to yourself
      if (citedProject?.primaryAccountable?.id && citedProject.primaryAccountable.id !== user!.ulid) {
        const message: ProposalNotification = {
          originalResourceID: citedProject.id,
          originalResourceName: citedProject.name || citedProject.id,
          proposalID: newProjectId,
          ownerName: user!.name,
          proposerName: user!.name,
          text: "",
        };
        await sendMessage(message, [citedProject.primaryAccountable.id], MessageSubject.PROJECT_CITED);
      }
    } catch (e) {
      devLog("Failed to send PROJECT_CITED notification", e);
    }
  };

  /** Record the contribution event, then tell the contributor (sendMessage is best-effort). */
  const addContributor = async (contributor: string, processId: string, projectId: string) => {
    if (!client || !user || !projectTypes) return;
    await client.resources.contributeToResource(processId, projectTypes[ProjectType.DESIGN]);
    const message: AddedAsContributorNotification = {
      projectOwnerId: user!.ulid,
      text: "you have been added as a contributor to a project",
      resourceName: projectId,
      resourceID: projectId,
      projectOwnerName: user!.name,
    };
    await sendMessage(message, [contributor], MessageSubject.ADDED_AS_CONTRIBUTOR);
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

  const step = (key: string, options: Record<string, unknown> = {}) =>
    t("common:projectCreation.steps." + key, { nsSeparator: ":", keySeparator: ".", ...options });

  /**
   * Create the project, then run every other write as an isolated follow-up.
   * Once the project exists nothing is thrown or repeated: failures and skipped
   * steps are returned so the form can report them next to a link to the new
   * project instead of showing an error that invites a duplicate.
   */
  const handleProjectCreation = async (
    formData: CreateProjectValues,
    projectType: ProjectType,
    dppUlid?: string
  ): Promise<ProjectCreationOutcome | undefined> => {
    if (!client || !user) return;
    setLoading(true);
    setError(null);
    const failedBefore: string[] = [];
    let processId = "";

    const outcome = await createProjectWithFollowUps(
      async () => {
        processId = await client.resources.createProcess(`creation of ${formData.main.title} by ${user!.name}`);
        devLog("process created", processId);

        // Location
        let locationId: string | undefined;
        if (formData.location.locationData || formData.location.remote) {
          const loc = await handleCreateLocation(formData.location, projectType === ProjectType.DESIGN);
          locationId = loc.id;
        }

        // Upload images to DPP and store URLs in metadata; a failed upload is reported, not hidden
        const imageUrls: string[] = [];
        if (formData.images?.length && client?.config.dppUrl) {
          for (const file of formData.images) {
            try {
              const attachment = await client.files.uploadToDpp(file);
              imageUrls.push(`${client.config.dppUrl}/file/${encodeURIComponent(attachment.id)}`);
            } catch (e) {
              console.error("Image upload failed", e);
              failedBefore.push(step("image", { name: (file as File).name || "" }));
            }
          }
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
        const complexityTags = formData.main.complexity
          ? ([prefixedTag(COMPLEXITY_PREFIX, formData.main.complexity)].filter(Boolean) as string[])
          : [];
        const powerSourceTags = (formData.power?.powerSources || [])
          .map(s => prefixedTag(TAG_PREFIX.POWER_COMPAT, s))
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
            ...complexityTags,
            ...powerSourceTags,
          ])
        );

        // Model file URLs (stored as plain strings in metadata.models)
        const modelUrls = (formData.modelFiles || [])
          .map(m => m.url?.trim())
          .filter((url): url is string => Boolean(url));

        // Metadata
        const metadata: Record<string, unknown> = {
          contributors: formData.contributors,
          licenses: formData.licenses,
          relations: formData.relations,
          declarations: formData.declarations,
          remote: formData.location.remote || projectType === ProjectType.DESIGN,
          design: formData.linkedDesign || false,
          image: imageUrls.length === 1 ? imageUrls[0] : imageUrls,
          ...(modelUrls.length > 0 && { models: modelUrls }),
          ...(formData.main.bom && { bom: formData.main.bom }),
          ...(formData.main.complexity && { complexity: formData.main.complexity }),
          ...(formData.power?.powerSources?.length && {
            powerSources: formData.power.powerSources,
          }),
          ...(formData.power?.powerRequirementW && {
            powerRequirementW: formData.power.powerRequirementW,
          }),
          ...((formData.productFilters as any)?.price && { price: (formData.productFilters as any).price }),
          ...((formData.productFilters as any)?.availability && {
            availability: (formData.productFilters as any).availability,
          }),
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
        return project.id;
      },
      async projectId => {
        const steps: ProjectFollowUp[] = [];
        if (dppUlid && specDpp)
          steps.push({
            name: step("dpp"),
            run: async () => {
              const dppRes = await client.resources.createDppResource({
                name: `DPP for ${formData.main.title}`,
                note: `Digital Product Passport for ${formData.main.title}`,
                dppUlid,
              });
              await client.resources.citeResource(dppRes.id, processId);
            },
          });
        if (formData.linkedDesign) {
          const design = formData.linkedDesign;
          steps.push({ name: step("citeDesign"), run: () => client.resources.citeResource(design, processId) });
          const mark = await manufacturableStep(client, design, user!.ulid, [MANUFACTURABLE_TRUE_TAG]);
          steps.push(
            "skipped" in mark
              ? { name: step("markManufacturable"), skipped: step("skipped." + mark.skipped) }
              : { ...mark, name: step("markManufacturable") }
          );
        }
        for (const rel of formData.relations) {
          steps.push({ name: step("relation", { id: rel }), run: () => addRelation(rel, processId, projectId) });
          steps.push({ name: step("ideaPoints"), run: () => addIdeaPoints(user!.ulid, IdeaPoints.OnCite) });
        }
        for (const contributor of formData.contributors) {
          steps.push({
            name: step("contributor", { id: contributor }),
            run: () => addContributor(contributor, processId, projectId),
          });
          steps.push({ name: step("ideaPoints"), run: () => addIdeaPoints(user!.ulid, IdeaPoints.OnContributions) });
          steps.push({
            name: step("strengthsPoints"),
            run: () => addStrengthsPoints(contributor, StrengthsPoints.OnContributions),
          });
        }
        steps.push({ name: step("ideaPoints"), run: () => addIdeaPoints(user!.ulid, IdeaPoints.OnCreate) });
        steps.push({
          name: step("strengthsPoints"),
          run: () => addStrengthsPoints(user!.ulid, StrengthsPoints.OnCreate),
        });
        return steps;
      },
      { failedBefore }
    );
    if (outcome.kind === "error") setError(errorFormatter(outcome.error, t));
    setLoading(false);
    return outcome;
  };

  const updateMetadata = async (projectOrId: string | Partial<{ id: string }>, metadata: Record<string, unknown>) => {
    if (!client) throw new Error("Not authenticated");
    const projectId = typeof projectOrId === "string" ? projectOrId : projectOrId.id!;
    await updateResourceMetadataFields(client, projectId, metadata);
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
