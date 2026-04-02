import { Stack } from "@bbtgnn/polaris-interfacer";
import PHelp from "components/polaris/PHelp";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { AVAILABILITY_OPTIONS, SERVICE_TYPE_OPTIONS } from "lib/tagging";
import { useTranslation } from "next-i18next";
import { useFormContext } from "react-hook-form";
import * as yup from "yup";
import { CreateProjectValues } from "../CreateProjectForm";

export interface ServiceFiltersStepValues {
  serviceType: string[];
  availability: string[];
}

export const serviceFiltersStepDefaultValues: ServiceFiltersStepValues = {
  serviceType: [],
  availability: [],
};

export const serviceFiltersStepSchema = () =>
  yup.object().shape({
    serviceType: yup.array().of(yup.string().required()).default([]),
    availability: yup.array().of(yup.string().required()).default([]),
  });

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

      <Stack vertical spacing="tight">
        <PHelp helpText={t("Select the type(s) of service you offer")} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SERVICE_TYPE_OPTIONS.map(option => (
            <label key={option} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.serviceType.includes(option)}
                onChange={e =>
                  setValue(
                    "serviceFilters.serviceType",
                    toggleValue(values.serviceType, option, e.target.checked),
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
        <PHelp helpText={t("Select your availability options")} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {AVAILABILITY_OPTIONS.map(option => (
            <label key={option} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.availability.includes(option)}
                onChange={e =>
                  setValue(
                    "serviceFilters.availability",
                    toggleValue(values.availability, option, e.target.checked),
                    formSetValueOptions
                  )
                }
              />
              <span>{t(option)}</span>
            </label>
          ))}
        </div>
      </Stack>
    </Stack>
  );
}
