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
  recyclabilityPct: string;
  repairability: boolean;
  energyKwh: string;
  co2Kg: string;
}

export const productFiltersStepDefaultValues: ProductFiltersStepValues = {
  categories: [],
  powerCompatibility: [],
  powerRequirementW: "",
  replicability: [],
  recyclabilityPct: "",
  repairability: false,
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
    recyclabilityPct: yup
      .string()
      .test("is-pct-or-empty", "Must be a number between 0 and 100", value => {
        if (!value) return true;
        const n = Number(value);
        return Number.isFinite(n) && n >= 0 && n <= 100;
      })
      .default(""),
    repairability: yup.boolean().default(false),
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

      <TextField
        type="number"
        label={t("Recyclability (%)")}
        value={values.recyclabilityPct}
        onChange={value => setValue("productFilters.recyclabilityPct", value, formSetValueOptions)}
        helpText={t("Percentage of product that can be recycled (0–100).")}
        autoComplete="off"
        min={0}
        max={100}
      />

      <Stack vertical spacing="tight">
        <PHelp helpText={t("Is this product available for repair?")} />
        <label className="flex items-center gap-3 text-sm cursor-pointer">
          <button
            type="button"
            role="switch"
            aria-checked={values.repairability}
            onClick={() => setValue("productFilters.repairability", !values.repairability, formSetValueOptions)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#036A53] focus:ring-offset-2 ${
              values.repairability ? "bg-[#036A53]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                values.repairability ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="font-medium">{t("Repair Info Available")}</span>
        </label>
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
