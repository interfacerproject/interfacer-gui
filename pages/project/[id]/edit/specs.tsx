import { gql, useMutation } from "@apollo/client";
import { yupResolver } from "@hookform/resolvers/yup";
import EditProjectLayout from "components/layout/EditProjectLayout";
import FetchProjectLayout, { useProject } from "components/layout/FetchProjectLayout";
import Layout from "components/layout/Layout";
import ProductFiltersStep, {
  productFiltersStepDefaultValues,
  productFiltersStepSchema,
  ProductFiltersStepValues,
} from "components/partials/create/project/steps/ProductFiltersStep";
import EditFormLayout from "components/partials/project/edit/EditFormLayout";
import { useProjectCRUD } from "hooks/useProjectCRUD";
import useYupLocaleObject from "hooks/useYupLocaleObject";
import {
  derivedProductFilterTags,
  mergeTags,
  POWER_COMPATIBILITY_OPTIONS,
  prefixedTag,
  PRODUCT_CATEGORY_OPTIONS,
  REPAIRABILITY_AVAILABLE_TAG,
  removeTagsWithPrefixes,
  REPLICABILITY_OPTIONS,
  TAG_PREFIX,
} from "lib/tagging";
import { GetStaticPaths } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextPageWithLayout } from "pages/_app";
import { useForm } from "react-hook-form";
import * as yup from "yup";

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

export interface EditSpecsValues {
  productFilters: ProductFiltersStepValues;
}

const EditSpecs: NextPageWithLayout = () => {
  const { project } = useProject();
  const { updateMetadata } = useProjectCRUD();

  const inferFromTags = (prefix: string, options: readonly string[]) => {
    const tags = project.classifiedAs || [];
    return options.filter(option => {
      const tag = prefixedTag(prefix, option);
      return Boolean(tag && tags.includes(tag));
    });
  };

  const existing = project.metadata?.productFilters || {};

  const defaultValues: EditSpecsValues = {
    productFilters: {
      categories:
        (existing.categories as string[] | undefined) || inferFromTags(TAG_PREFIX.CATEGORY, PRODUCT_CATEGORY_OPTIONS),
      powerCompatibility:
        (existing.powerCompatibility as string[] | undefined) ||
        inferFromTags(TAG_PREFIX.POWER_COMPAT, POWER_COMPATIBILITY_OPTIONS),
      powerRequirementW:
        typeof existing.powerRequirementW === "number"
          ? String(existing.powerRequirementW)
          : productFiltersStepDefaultValues.powerRequirementW,
      replicability:
        (existing.replicability as string[] | undefined) ||
        inferFromTags(TAG_PREFIX.REPLICABILITY, REPLICABILITY_OPTIONS),
      recyclabilityPct:
        typeof existing.recyclabilityPct === "number"
          ? String(existing.recyclabilityPct)
          : productFiltersStepDefaultValues.recyclabilityPct,
      repairability:
        typeof existing.repairability === "boolean"
          ? existing.repairability
          : (project.classifiedAs || []).includes(REPAIRABILITY_AVAILABLE_TAG),
      energyKwh:
        typeof existing.energyKwh === "number" ? String(existing.energyKwh) : productFiltersStepDefaultValues.energyKwh,
      co2Kg: typeof existing.co2Kg === "number" ? String(existing.co2Kg) : productFiltersStepDefaultValues.co2Kg,
    },
  };

  const yupLocaleObject = useYupLocaleObject();
  yup.setLocale(yupLocaleObject);

  const schema = yup.object({
    productFilters: productFiltersStepSchema(),
  });

  const formMethods = useForm<EditSpecsValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const [editClassifiedAs] = useMutation<EditSpecsMutation, EditSpecsMutationVariables>(EDIT_SPECS);

  const normalize = (values: ProductFiltersStepValues) => {
    const powerRequirementW = values.powerRequirementW ? Number(values.powerRequirementW) : undefined;
    const energyKwh = values.energyKwh ? Number(values.energyKwh) : undefined;
    const co2Kg = values.co2Kg ? Number(values.co2Kg) : undefined;
    const recyclabilityPct = values.recyclabilityPct ? Number(values.recyclabilityPct) : undefined;

    return {
      categories: values.categories || [],
      powerCompatibility: values.powerCompatibility || [],
      replicability: values.replicability || [],
      recyclabilityPct: Number.isFinite(recyclabilityPct as number) ? (recyclabilityPct as number) : undefined,
      repairability: Boolean(values.repairability),
      powerRequirementW: Number.isFinite(powerRequirementW as number) ? (powerRequirementW as number) : undefined,
      energyKwh: Number.isFinite(energyKwh as number) ? (energyKwh as number) : undefined,
      co2Kg: Number.isFinite(co2Kg as number) ? (co2Kg as number) : undefined,
    };
  };

  async function onSubmit(values: EditSpecsValues) {
    const normalized = normalize(values.productFilters);

    const derivedTags = derivedProductFilterTags(normalized);

    const baseTags = removeTagsWithPrefixes(project.classifiedAs || [], [
      TAG_PREFIX.CATEGORY,
      TAG_PREFIX.POWER_COMPAT,
      TAG_PREFIX.POWER_REQ,
      TAG_PREFIX.REPLICABILITY,
      TAG_PREFIX.RECYCLABILITY,
      TAG_PREFIX.REPAIRABILITY,
      TAG_PREFIX.ENV_ENERGY,
      TAG_PREFIX.ENV_CO2,
    ]);

    const classifiedAs = mergeTags(baseTags, derivedTags);

    await editClassifiedAs({
      variables: {
        id: project.id!,
        classifiedAs: classifiedAs.length ? classifiedAs : undefined,
      },
    });

    await updateMetadata(project, { productFilters: normalized });
  }

  return (
    <EditFormLayout formMethods={formMethods} onSubmit={onSubmit}>
      <ProductFiltersStep />
    </EditFormLayout>
  );
};

EditSpecs.getLayout = page => (
  <Layout bottomPadding="none">
    <FetchProjectLayout>
      <EditProjectLayout>{page}</EditProjectLayout>
    </FetchProjectLayout>
  </Layout>
);

export default EditSpecs;

export const EDIT_SPECS = gql`
  mutation EditSpecs($id: ID!, $classifiedAs: [URI!]) {
    updateEconomicResource(resource: { id: $id, classifiedAs: $classifiedAs }) {
      economicResource {
        id
      }
    }
  }
`;

//

export interface EditSpecsMutation {
  updateEconomicResource: { economicResource: { id: string } };
}

export interface EditSpecsMutationVariables {
  id: string;
  classifiedAs?: string[];
}
