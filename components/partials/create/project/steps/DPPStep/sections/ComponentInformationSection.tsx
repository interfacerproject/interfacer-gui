import { Icon, Stack } from "@bbtgnn/polaris-interfacer";
import { ChevronDownMinor, ChevronUpMinor } from "@shopify/polaris-icons";
import { useTranslation } from "next-i18next";
import { ControlledTextField } from "../components/ControlledTextField";

export const ComponentInformationSection = () => {
  const { t } = useTranslation("createProjectProps");

  return (
    <Stack vertical spacing="loose">
      <div className="p-4 bg-gray-50 border border-gray-300 rounded">
        <Stack vertical spacing="loose">
          <div className="flex items-center justify-between">
            <span className="font-medium text-base">{t("Add component")}</span>
            <Icon source={ChevronUpMinor} />
          </div>

          <ControlledTextField name="dpp.components.0.componentDescription.value" label={t("Component Description")} />

          <ControlledTextField name="dpp.components.0.componentGTIN.value" label={t("Component GTIN")} />

          <ControlledTextField
            name="dpp.components.0.linkToDPP.value"
            label={t("Link to DPP of Component")}
            placeholder="ex. mylink.com"
            helpText={t("Lorem ipsum dolor sit amet.")}
          />
        </Stack>
      </div>

      <button
        type="button"
        className="w-full p-4 bg-gray-50 border border-gray-300 rounded flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <span className="font-medium text-base">{t("Add component")}</span>
        <Icon source={ChevronDownMinor} />
      </button>
    </Stack>
  );
};
