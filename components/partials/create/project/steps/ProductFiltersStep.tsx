import { Select, Stack, TextField } from "@bbtgnn/polaris-interfacer";
import {
  CategoryGrid,
  CategoryOption,
  CheckOption,
  OptionGrid,
  OptionGroup,
  ToggleField,
} from "components/partials/create/FormControls";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { POWER_COMPATIBILITY_OPTIONS, PRODUCT_CATEGORY_OPTIONS, REPLICABILITY_OPTIONS } from "lib/tagging";
import { useTranslation } from "next-i18next";
import { useFormContext } from "react-hook-form";
import { CreateProjectValues } from "../CreateProjectForm";

import {
  type ProductFiltersStepValues,
  productFiltersStepDefaultValues,
  productFiltersStepSchema,
} from "./ProductFiltersStep.schema";
export { type ProductFiltersStepValues, productFiltersStepDefaultValues, productFiltersStepSchema };

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          type="text"
          label={t("Price")}
          placeholder={t("e.g. €1,200")}
          value={values.price || ""}
          onChange={value => setValue("productFilters.price", value, formSetValueOptions)}
          helpText={t("Indicative price shown on the product page.")}
          autoComplete="off"
        />
        <Select
          label={t("Availability")}
          options={[
            { label: t("Select availability…"), value: "" },
            { label: t("Available Now"), value: "Available Now" },
            { label: t("Made to Order"), value: "Made to Order" },
            { label: t("Limited Stock"), value: "Limited Stock" },
            { label: t("Out of Stock"), value: "Out of Stock" },
          ]}
          value={values.availability || ""}
          onChange={value => setValue("productFilters.availability", value, formSetValueOptions)}
          helpText={t("Current availability shown on the product page.")}
        />
      </div>

      <OptionGroup label={t("Categories")} helpText={t("Select one or more categories for your product")}>
        <CategoryGrid>
          {PRODUCT_CATEGORY_OPTIONS.map((option: string) => (
            <CategoryOption
              key={option}
              value={option}
              label={t(option)}
              selected={values.categories.includes(option)}
              onToggle={() =>
                setValue(
                  "productFilters.categories",
                  toggleValue(values.categories, option, !values.categories.includes(option)),
                  formSetValueOptions
                )
              }
            />
          ))}
        </CategoryGrid>
      </OptionGroup>

      <OptionGroup label={t("Power compatibility")} helpText={t("Select compatible power sources (if applicable)")}>
        <OptionGrid>
          {POWER_COMPATIBILITY_OPTIONS.map((option: string) => (
            <CheckOption
              key={option}
              label={option}
              checked={values.powerCompatibility.includes(option)}
              onChange={checked =>
                setValue(
                  "productFilters.powerCompatibility",
                  toggleValue(values.powerCompatibility, option, checked),
                  formSetValueOptions
                )
              }
            />
          ))}
        </OptionGrid>
      </OptionGroup>

      <TextField
        type="number"
        label={t("Power requirement (W)")}
        value={values.powerRequirementW}
        onChange={value => setValue("productFilters.powerRequirementW", value, formSetValueOptions)}
        helpText={t("Optional. Used for filtering by power requirement.")}
        autoComplete="off"
      />

      <OptionGroup label={t("Replicability")} helpText={t("Select replicability level(s)")}>
        <OptionGrid>
          {REPLICABILITY_OPTIONS.map((option: string) => (
            <CheckOption
              key={option}
              label={t(option)}
              checked={values.replicability.includes(option)}
              onChange={checked =>
                setValue(
                  "productFilters.replicability",
                  toggleValue(values.replicability, option, checked),
                  formSetValueOptions
                )
              }
            />
          ))}
        </OptionGrid>
      </OptionGroup>

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

      <ToggleField
        label={t("Repair Info Available")}
        description={t("Is this product available for repair?")}
        checked={values.repairability}
        onChange={checked => setValue("productFilters.repairability", checked, formSetValueOptions)}
      />

      <OptionGroup label={t("Environmental impact")} helpText={t("Optional.")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
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
      </OptionGroup>
    </Stack>
  );
}
