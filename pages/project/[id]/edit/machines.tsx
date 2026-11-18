import { EDIT_SPECS } from "@dyne/interfacer-client";
import { yupResolver } from "@hookform/resolvers/yup";
import { Spinner } from "@bbtgnn/polaris-interfacer";
import EditProjectLayout from "components/layout/EditProjectLayout";
import FetchProjectLayout, { useProject } from "components/layout/FetchProjectLayout";
import Layout from "components/layout/Layout";
import MachinesStep, {
  machinesStepSchema,
  MachinesStepValues,
} from "components/partials/create/project/steps/MachinesStep";
import EditFormLayout from "components/partials/project/edit/EditFormLayout";
import { useResourceSpecs } from "hooks/useResourceSpecs";
import useYupLocaleObject from "hooks/useYupLocaleObject";
import { useMutation, useQuery } from "lib/apollo-compat";
import { QUERY_MACHINES } from "lib/QueryAndMutation";
import { mergeTags, prefixedTag, removeTagsWithPrefixes, TAG_PREFIX } from "lib/tagging";
import { GetStaticPaths } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "pages/_app";
import { useForm } from "react-hook-form";
import * as yup from "yup";

//

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["common", "createProjectProps"])),
    },
  };
}

//

export interface EditMachinesValues {
  machines: MachinesStepValues;
}

interface MachinesQueryData {
  economicResources: {
    edges: Array<{ node: { id: string; name: string } }>;
  };
}

const MACHINE_TAG_PREFIX = `${TAG_PREFIX.MACHINE}-`;

/**
 * Machines are persisted only as `machine-<slug>` tags on the project.
 * Resolve them back to machine resources so the form can be prefilled.
 * Tags whose machine can't be resolved are kept as entries whose id is the
 * original tag, so they survive a save unless the user removes them.
 */
function machinesFromTags(tags: string[], machines: Array<{ id: string; name: string }>): MachinesStepValues {
  const machineDetails: MachinesStepValues["machineDetails"] = [];
  for (const tag of tags) {
    if (!tag.startsWith(MACHINE_TAG_PREFIX)) continue;
    const match = machines.find(m => prefixedTag(TAG_PREFIX.MACHINE, m.name) === tag);
    if (match) {
      if (!machineDetails.some(d => d.id === match.id)) machineDetails.push({ id: match.id, name: match.name });
    } else {
      machineDetails.push({ id: tag, name: tag.slice(MACHINE_TAG_PREFIX.length).replace(/-/g, " ") });
    }
  }
  return { machines: machineDetails.map(d => d.id), machineDetails };
}

function tagsFromMachines(values: MachinesStepValues): string[] {
  return (values.machineDetails || [])
    .map(m => (m.id.startsWith(MACHINE_TAG_PREFIX) ? m.id : prefixedTag(TAG_PREFIX.MACHINE, m.name)))
    .filter(Boolean) as string[];
}

//

const EditMachines: NextPageWithLayout = () => {
  const { specMachine } = useResourceSpecs();
  const { data, loading, error } = useQuery<MachinesQueryData>(QUERY_MACHINES, {
    variables: { resourceSpecId: specMachine?.id },
    skip: !specMachine?.id,
  });

  // MachinesStep reads its initial toggle state on mount, so wait for the
  // machine list before rendering the form with prefilled values.
  if (!error && (!specMachine?.id || loading || !data)) {
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    );
  }

  const machines = data?.economicResources?.edges.map(e => e.node) || [];
  return <EditMachinesForm machines={machines} />;
};

function EditMachinesForm({ machines }: { machines: Array<{ id: string; name: string }> }) {
  const { project } = useProject();

  /* Form setup */

  const defaultValues: EditMachinesValues = {
    machines: machinesFromTags(project.classifiedAs || [], machines),
  };

  const yupLocaleObject = useYupLocaleObject();
  yup.setLocale(yupLocaleObject);

  const schema = yup.object({
    machines: machinesStepSchema(),
  });

  const formMethods = useForm<EditMachinesValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  /* Submit logic */

  const [editClassifiedAs] = useMutation<EditMachinesMutation, EditMachinesMutationVariables>(EDIT_SPECS);

  async function onSubmit(values: EditMachinesValues) {
    const baseTags = removeTagsWithPrefixes(project.classifiedAs || [], [TAG_PREFIX.MACHINE]);
    const classifiedAs = mergeTags(baseTags, tagsFromMachines(values.machines));

    await editClassifiedAs({
      variables: {
        id: project.id!,
        classifiedAs,
      },
    });
  }

  /* Render */

  return (
    <EditFormLayout formMethods={formMethods} onSubmit={onSubmit}>
      <MachinesStep />
    </EditFormLayout>
  );
}

//

EditMachines.getLayout = page => (
  <Layout bottomPadding="none">
    <FetchProjectLayout>
      <EditProjectLayout>{page}</EditProjectLayout>
    </FetchProjectLayout>
  </Layout>
);

export default EditMachines;

//

export interface EditMachinesMutation {
  updateEconomicResource: { economicResource: { id: string } };
}

export interface EditMachinesMutationVariables {
  id: string;
  classifiedAs?: string[];
}
