import { Stack, TextField } from "@bbtgnn/polaris-interfacer";
import PHelp from "components/polaris/PHelp";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { POWER_COMPATIBILITY_OPTIONS, PRODUCT_CATEGORY_OPTIONS, REPLICABILITY_OPTIONS } from "lib/tagging";
import { useTranslation } from "next-i18next";
import { useFormContext } from "react-hook-form";
import * as yup from "yup";
import { CreateProjectValues } from "../CreateProjectForm";

export interface ProductFiltersStepValues {
  categories: string[];
  powerCompatibility: string[];
  powerRequirementW: string;
  replicability: string[];
  energyKwh: string;
  co2Kg: string;
}

export const productFiltersStepDefaultValues: ProductFiltersStepValues = {
  categories: [],
  powerCompatibility: [],
  powerRequirementW: "",
  replicability: [],
  energyKwh: "",
  co2Kg: "",
};

export const productFiltersStepSchema = () =>
  yup.object().shape({
    categories: yup.array().of(yup.string().required()).default([]),
    powerCompatibility: yup.array().of(yup.string().required()).default([]),
    powerRequirementW: yup
      .string()
      .test("is-number-or-empty", "Must be a number", value => {
        if (!value) return true;
        return Number.isFinite(Number(value));
      })
      .default(""),
    replicability: yup.array().of(yup.string().required()).default([]),
    energyKwh: yup
      .string()
      .test("is-number-or-empty", "Must be a number", value => {
        if (!value) return true;
        return Number.isFinite(Number(value));
      })
      .default(""),
    co2Kg: yup
      .string()
      .test("is-number-or-empty", "Must be a number", value => {
        if (!value) return true;
        return Number.isFinite(Number(value));
      })
      .default(""),
  });

function toggleValue(list: string[], value: string, checked: boolean): string[] {
  if (checked) return list.includes(value) ? list : [...list, value];
  return list.filter(v => v !== value);
}

export default function ProductFiltersStep() {
  const { t } = useTranslation("createProjectProps");
  const form = useFormContext<CreateProjectValues>();
  const { watch, setValue } = form;

  const values = watch("productFilters") || productFiltersStepDefaultValues;

  return (
    <Stack vertical spacing="loose">
      <PTitleSubtitle title={t("Product specifications")} subtitle={t("These fields help users filter products.")} />

      <Stack vertical spacing="tight">
        <PHelp helpText={t("Select one or more categories for your product")} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRODUCT_CATEGORY_OPTIONS.map(option => (
            <label key={option} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.categories.includes(option)}
                onChange={e =>
                  setValue(
                    "productFilters.categories",
                    toggleValue(values.categories, option, e.target.checked),
                    formSetValueOptions
                  )
                }
              />
              <span>{t(option)}</span>
            </label>
          ))}
        </div>
      </Stack>

      <Stack vertical spacing="tight">
        <PHelp helpText={t("Select compatible power sources (if applicable)")} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {POWER_COMPATIBILITY_OPTIONS.map(option => (
            <label key={option} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.powerCompatibility.includes(option)}
                onChange={e =>
                  setValue(
                    "productFilters.powerCompatibility",
                    toggleValue(values.powerCompatibility, option, e.target.checked),
                    formSetValueOptions
                  )
                }
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </Stack>

      <TextField
        type="number"
        label={t("Power requirement (W)")}
        value={values.powerRequirementW}
        onChange={value => setValue("productFilters.powerRequirementW", value, formSetValueOptions)}
        helpText={t("Optional. Used for filtering by power requirement.")}
        autoComplete="off"
      />

      <Stack vertical spacing="tight">
        <PHelp helpText={t("Select replicability level(s)")} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {REPLICABILITY_OPTIONS.map(option => (
            <label key={option} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.replicability.includes(option)}
                onChange={e =>
                  setValue(
                    "productFilters.replicability",
                    toggleValue(values.replicability, option, e.target.checked),
                    formSetValueOptions
                  )
                }
              />
              <span>{t(option)}</span>
            </label>
          ))}
        </div>
      </Stack>

      <Stack vertical spacing="tight">
        <PHelp helpText={t("Environmental impact (optional)")} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            type="number"
            label={t("Energy consumption (kWh)")}
            value={values.energyKwh}
            onChange={value => setValue("productFilters.energyKwh", value, formSetValueOptions)}
            autoComplete="off"
          />
          <TextField
            type="number"
            label={t("CO2 emissions (kg)")}
            value={values.co2Kg}
            onChange={value => setValue("productFilters.co2Kg", value, formSetValueOptions)}
            autoComplete="off"
          />
        </div>
      </Stack>
    </Stack>
  );
}
