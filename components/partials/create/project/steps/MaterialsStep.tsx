import { Stack, Tag } from "@bbtgnn/polaris-interfacer";
import PHelp from "components/polaris/PHelp";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import SearchMaterials from "components/SearchMaterials";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import * as yup from "yup";
import { CreateProjectValues } from "../CreateProjectForm";

export interface MaterialsStepValues {
  materials: string[]; // Array of material resource IDs
  materialDetails: Array<{ id: string; name: string }>; // Used for save-time material-* tags
}

export const materialsStepDefaultValues: MaterialsStepValues = {
  materials: [],
  materialDetails: [],
};

export const materialsStepSchema = () =>
  yup.object().shape({
    materials: yup.array().of(yup.string().required()).default([]),
    materialDetails: yup
      .array()
      .of(
        yup
          .object({
            id: yup.string().required(),
            name: yup.string().required(),
          })
          .required()
      )
      .default([]),
  });

export default function MaterialsStep() {
  const { t } = useTranslation("createProjectProps");
  const form = useFormContext<CreateProjectValues>();

  const MATERIALS_FORM_KEY = "materials";
  const { watch, setValue } = form;
  const materialsData = watch(MATERIALS_FORM_KEY);
  const selectedMaterials = materialsData?.materialDetails || [];

  const [materialsEnabled, setMaterialsEnabled] = useState(
    Boolean(materialsData && (materialsData.materials?.length || 0) > 0)
  );

  const handleMaterialsToggle = () => {
    const newState = !materialsEnabled;
    setMaterialsEnabled(newState);
    if (!newState) {
      setValue(MATERIALS_FORM_KEY, { materials: [], materialDetails: [] });
    } else {
      setValue(MATERIALS_FORM_KEY, { materials: [], materialDetails: [] });
    }
  };

  const handleMaterialSelect = (material: { id: string; name: string }) => {
    const current = materialsData?.materials || [];
    if (!current.includes(material.id)) {
      setValue(MATERIALS_FORM_KEY, {
        materials: [...current, material.id],
        materialDetails: [...selectedMaterials, { id: material.id, name: material.name }],
      });
    }
  };

  const handleMaterialRemove = (materialId: string) => {
    const current = materialsData?.materials || [];
    setValue(MATERIALS_FORM_KEY, {
      materials: current.filter((id: string) => id !== materialId),
      materialDetails: selectedMaterials.filter(m => m.id !== materialId),
    });
  };

  return (
    <Stack vertical spacing="loose">
      <PTitleSubtitle title={t("Materials Used")} />
      <PHelp helpText={t("Select the materials that will be consumed to create this product")} />

      <button
        type="button"
        onClick={handleMaterialsToggle}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          materialsEnabled ? "bg-green-600" : "bg-gray-300"
        }`}
      >
        <span className="sr-only">{t("Enable materials")}</span>
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            materialsEnabled ? "translate-x-4" : "translate-x-1"
          }`}
        />
      </button>

      {materialsEnabled && (
        <Stack vertical spacing="tight">
          <SearchMaterials
            onSelect={handleMaterialSelect}
            excludeIDs={materialsData?.materials || []}
            label={t("Add materials")}
            placeholder={t("Search for materials")}
          />

          {selectedMaterials.length > 0 && (
            <div className="mt-2">
              <p className="mb-2 text-sm font-medium">{t("Selected materials")}:</p>
              <Stack spacing="tight" wrap>
                {selectedMaterials.map(material => (
                  <Tag key={material.id} onRemove={() => handleMaterialRemove(material.id)}>
                    {material.name}
                  </Tag>
                ))}
              </Stack>
            </div>
          )}
        </Stack>
      )}
    </Stack>
  );
}
