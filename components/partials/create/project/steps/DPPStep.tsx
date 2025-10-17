import { Collapsible, Icon, Stack, TextField } from "@bbtgnn/polaris-interfacer";
import { ChevronDownMinor, ChevronUpMinor } from "@shopify/polaris-icons";
import PButtonRadio from "components/polaris/PButtonRadio";
import PHelp from "components/polaris/PHelp";
import PLabel from "components/polaris/PLabel";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import * as yup from "yup";
import { CreateProjectValues } from "../CreateProjectForm";

export type DPPStepValues = {
  productOverview?: {
    brandName?: string;
    productName?: string;
    gpc?: string;
    countryOfSale?: string;
    gtin?: string;
    color?: string;
  };
  repairability?: {
    spareParts?: string;
  };
  environmental?: {
    waterConsumption?: string;
    chemicalConsumption?: string;
    co2Emissions?: string;
    energyConsumption?: string;
  };
  compliance?: {
    ceMarking?: string;
    rohsCompliance?: string;
  };
} | null;

export const dppStepSchema = () =>
  yup
    .object()
    .nullable()
    .shape({
      overview: yup.object().shape({
        brandName: yup.string(),
        productName: yup.string(),
        gpc: yup.string(),
        countryOfSale: yup.string(),
        gtin: yup.string(),
        color: yup.string(),
      }).nullable(),
      repairability: yup.object().shape({
        spareParts: yup.string(),
      }).nullable(),
      environmental: yup.object().shape({
        waterConsumption: yup.string(),
        chemicalConsumption: yup.string(),
        co2Emissions: yup.string(),
        energyConsumption: yup.string(),
      }).nullable(),
      compliance: yup.object().shape({
        ceMarking: yup.string(),
        rohsCompliance: yup.string(),
      }).nullable(),
    });

export const dppStepDefaultValues: DPPStepValues | null = null;
//

export default function DPPStep() {
  const { t } = useTranslation("createProjectProps");
  const form = useFormContext<CreateProjectValues>();

  const DPP_FORM_KEY = "dpp";

  const { formState, control, watch, setValue } = form;
  const dpp = watch(DPP_FORM_KEY);
  const { errors } = formState;

  // State for toggle and accordion sections
  const [dppEnabled, setDppEnabled] = useState(Boolean(dpp));
  const [overviewOpen, setOverviewOpen] = useState(true);
  const [repairabilityOpen, setRepairabilityOpen] = useState(false);
  const [environmentalOpen, setEnvironmentalOpen] = useState(false);
  const [complianceOpen, setComplianceOpen] = useState(false);

  // Handle DPP toggle
  const handleDppToggle = () => {
    const newState = !dppEnabled;
    setDppEnabled(newState);
    if (!newState) {
      setValue(DPP_FORM_KEY, null as any);
    } else {
      setValue(DPP_FORM_KEY, {} as DPPStepValues);
    }
  };

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle
        title={t("Digital Product Passport (DPP)")}
        subtitle={t(
          "Add comprehensive product lifecycle information. The DPP is a digital record that contains information about a product's lifecycle, including its origin, materials, manufacturing processes, and end-of-life options."
        )}
      />

      {/* DPP Toggle */}
      <div className="flex items-center justify-between py-4">
        <Stack vertical spacing="extraTight">
          <PLabel label={t("Add DPP to this product")} />
          <PHelp helpText={t("Include detailed sustainability and product information")} />
        </Stack>
        <button
          type="button"
          onClick={handleDppToggle}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            dppEnabled ? "bg-green-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              dppEnabled ? "translate-x-5" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {dppEnabled && (
        <Stack vertical spacing="loose">
          <div className="h-px bg-gray-300" />

          {/* DPP Overview Section */}
          <div>
            <button
              type="button"
              onClick={() => setOverviewOpen(!overviewOpen)}
              className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 rounded transition-colors"
            >
              <span className="font-medium text-sm">{t("DPP Overview")}</span>
              <Icon source={overviewOpen ? ChevronUpMinor : ChevronDownMinor} />
            </button>

            <Collapsible open={overviewOpen} id="dpp-product-overview">
              <div className="pt-4 pb-2">
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    control={control}
                    name="dpp.productOverview.brandName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Brand Name")}
                        placeholder="e.g., INMachines"
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="dpp.productOverview.productName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Product Name")}
                        placeholder="e.g., OLSK Large 3D Printer"
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="dpp.productOverview.gpc"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Global Product Classification (GPC)")}
                        placeholder="e.g., 10000050"
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="dpp.productOverview.countryOfSale"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Country of Sale")}
                        placeholder="e.g., Germany"
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="dpp.productOverview.gtin"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("GTIN")}
                        placeholder="e.g., 012345678905"
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="dpp.productOverview.color"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Color")}
                        placeholder="e.g., Black"
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />
                </div>
              </div>
            </Collapsible>
          </div>

          <div className="h-px bg-gray-300" />

          {/* Repairability Section */}
          <div>
            <button
              type="button"
              onClick={() => setRepairabilityOpen(!repairabilityOpen)}
              className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 rounded transition-colors"
            >
              <span className="font-medium text-sm">{t("Repairability")}</span>
              <Icon source={repairabilityOpen ? ChevronUpMinor : ChevronDownMinor} />
            </button>

            <Collapsible open={repairabilityOpen} id="dpp-repairability">
              <div className="pt-4 pb-2">
                <Stack vertical spacing="tight">
                  <PLabel label={t("Availability of Spare Parts")} />
                  <Controller
                    control={control}
                    name="dpp.repairability.spareParts"
                    render={({ field: { onChange, value } }) => (
                      <PButtonRadio
                        id="spareParts"
                        selected={value}
                        onChange={onChange}
                        options={[
                          { value: "yes", label: t("Yes") },
                          { value: "no", label: t("No") },
                        ]}
                      />
                    )}
                  />
                </Stack>
              </div>
            </Collapsible>
          </div>

          <div className="h-px bg-gray-300" />

          {/* Environmental Impact Section */}
          <div>
            <button
              type="button"
              onClick={() => setEnvironmentalOpen(!environmentalOpen)}
              className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 rounded transition-colors"
            >
              <span className="font-medium text-sm">{t("Environmental Impact")}</span>
              <Icon source={environmentalOpen ? ChevronUpMinor : ChevronDownMinor} />
            </button>

            <Collapsible open={environmentalOpen} id="dpp-environmental">
              <div className="pt-4 pb-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Controller
                        control={control}
                        name="dpp.environmental.waterConsumption"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextField
                            type="text"
                            label={t("Water Consumption per Unit")}
                            placeholder="e.g., 1"
                            autoComplete="off"
                            value={value || ""}
                            onChange={onChange}
                            onBlur={onBlur}
                          />
                        )}
                      />
                    </div>
                    <div className="w-20">
                      <TextField type="text" label=" " value="L" disabled autoComplete="off" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Controller
                        control={control}
                        name="dpp.environmental.chemicalConsumption"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextField
                            type="text"
                            label={t("Chemical Consumption per Unit")}
                            placeholder="e.g., 1"
                            autoComplete="off"
                            value={value || ""}
                            onChange={onChange}
                            onBlur={onBlur}
                          />
                        )}
                      />
                    </div>
                    <div className="w-20">
                      <TextField type="text" label=" " value="kg" disabled autoComplete="off" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Controller
                        control={control}
                        name="dpp.environmental.co2Emissions"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextField
                            type="text"
                            label={t("CO₂e Emissions per Unit")}
                            placeholder="e.g., 1"
                            autoComplete="off"
                            value={value || ""}
                            onChange={onChange}
                            onBlur={onBlur}
                          />
                        )}
                      />
                    </div>
                    <div className="w-20">
                      <TextField type="text" label=" " value="kg" disabled autoComplete="off" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Controller
                        control={control}
                        name="dpp.environmental.energyConsumption"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextField
                            type="text"
                            label={t("Energy Consumption per Unit")}
                            placeholder="e.g., 1"
                            autoComplete="off"
                            value={value || ""}
                            onChange={onChange}
                            onBlur={onBlur}
                          />
                        )}
                      />
                    </div>
                    <div className="w-20">
                      <TextField type="text" label=" " value="kWh" disabled autoComplete="off" />
                    </div>
                  </div>
                </div>
              </div>
            </Collapsible>
          </div>

          <div className="h-px bg-gray-300" />

          {/* Compliance and Standards Section */}
          <div>
            <button
              type="button"
              onClick={() => setComplianceOpen(!complianceOpen)}
              className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 rounded transition-colors"
            >
              <span className="font-medium text-sm">{t("Compliance and Standards")}</span>
              <Icon source={complianceOpen ? ChevronUpMinor : ChevronDownMinor} />
            </button>

            <Collapsible open={complianceOpen} id="dpp-compliance">
              <div className="pt-4 pb-2">
                <Stack vertical spacing="loose">
                  <Stack vertical spacing="tight">
                    <PLabel label={t("CE Marking")} />
                    <Controller
                      control={control}
                      name="dpp.compliance.ceMarking"
                      render={({ field: { onChange, value } }) => (
                        <PButtonRadio
                          id="ceMarking"
                          selected={value}
                          onChange={onChange}
                          options={[
                            { value: "yes", label: t("Yes") },
                            { value: "no", label: t("No") },
                          ]}
                        />
                      )}
                    />
                  </Stack>
                  <Stack vertical spacing="tight">
                    <PLabel label={t("RoHS Compliance")} />
                    <Controller
                      control={control}
                      name="dpp.compliance.rohsCompliance"
                      render={({ field: { onChange, value } }) => (
                        <PButtonRadio
                          id="rohsCompliance"
                          selected={value}
                          onChange={onChange}
                          options={[
                            { value: "yes", label: t("Yes") },
                            { value: "no", label: t("No") },
                          ]}
                        />
                      )}
                    />
                  </Stack>
                </Stack>
              </div>
            </Collapsible>
          </div>

          {/* Advanced: JSON Input (Optional) */}
          <div className="pt-4">
            <Controller
              control={control}
              name="dpp"
              render={({ field: { onChange, onBlur, name, value } }) => (
                console.log("Rendering DPP JSON input", value),
                <>
                <TextField
                  type="text"
                  id={name}
                  multiline={5}
                  name={name}
                  value={value ? JSON.stringify(value, null, 2) : ""}
                  autoComplete="off"
                  onChange={newValue => {
                    try {
                      const parsed = JSON.parse(newValue);
                      onChange(parsed);
                    } catch (e) {
                      // If invalid JSON, just update with the string for now
                      // The validation schema will catch this
                    }
                  }}
                  onBlur={onBlur}
                  label={t("Advanced: DPP JSON Data")}
                  helpText={t("For advanced users: Insert or review the complete DPP as JSON")}
                  error={errors.dpp?.message}
                />
                </>
              )}
            />
          </div>
        </Stack>
      )}
    </Stack>
  );
}
