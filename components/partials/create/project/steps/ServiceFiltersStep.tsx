import { Stack } from "@bbtgnn/polaris-interfacer";
import { CheckOption, OptionGrid, OptionGroup } from "components/partials/create/FormControls";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { AVAILABILITY_OPTIONS, SERVICE_TYPE_OPTIONS } from "lib/tagging";
import { useTranslation } from "next-i18next";
import { useFormContext } from "react-hook-form";
import { CreateProjectValues } from "../CreateProjectForm";

import {
  type ServiceFiltersStepValues,
  serviceFiltersStepDefaultValues,
  serviceFiltersStepSchema,
} from "./ServiceFiltersStep.schema";
export { type ServiceFiltersStepValues, serviceFiltersStepDefaultValues, serviceFiltersStepSchema };

function toggleValue(list: string[], value: string, checked: boolean): string[] {
  if (checked) return list.includes(value) ? list : [...list, value];
  return list.filter(v => v !== value);
}

export default function ServiceFiltersStep() {
  const { t } = useTranslation("createProjectProps");
  const form = useFormContext<CreateProjectValues>();
  const { watch, setValue } = form;

  const values = watch("serviceFilters") || serviceFiltersStepDefaultValues;

  return (
    <Stack vertical spacing="loose">
      <PTitleSubtitle
        title={t("Service details")}
        subtitle={t("These fields help users filter and find your service.")}
      />

      <OptionGroup label={t("Service type")} helpText={t("Select the type(s) of service you offer")}>
        <OptionGrid>
          {SERVICE_TYPE_OPTIONS.map((option: string) => (
            <CheckOption
              key={option}
              label={t(option)}
              checked={values.serviceType.includes(option)}
              onChange={checked =>
                setValue(
                  "serviceFilters.serviceType",
                  toggleValue(values.serviceType, option, checked),
                  formSetValueOptions
                )
              }
            />
          ))}
        </OptionGrid>
      </OptionGroup>

      <OptionGroup label={t("Availability")} helpText={t("Select your availability options")}>
        <OptionGrid>
          {AVAILABILITY_OPTIONS.map((option: string) => (
            <CheckOption
              key={option}
              label={t(option)}
              checked={values.availability.includes(option)}
              onChange={checked =>
                setValue(
                  "serviceFilters.availability",
                  toggleValue(values.availability, option, checked),
                  formSetValueOptions
                )
              }
            />
          ))}
        </OptionGrid>
      </OptionGroup>
    </Stack>
  );
}
