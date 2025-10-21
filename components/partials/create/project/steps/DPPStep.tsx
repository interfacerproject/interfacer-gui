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
    productImage?: string;
    gpc?: string;
    countryOfSale?: string;
    productDescription?: string;
    netWeight?: string;
    netWeightUnit?: string;
    gtin?: string;
    color?: string;
    countryOfOrigin?: string;
    dimensions?: string;
    modelName?: string;
    taricCode?: string;
    condition?: string;
    netContent?: string;
    netContentUnit?: string;
    warrantyDuration?: string;
    warrantyDurationUnit?: string;
    safetyInstructions?: string;
  };
  repairability?: {
    spareParts?: string;
    serviceAndRepairInstructions?: string;
  };
  environmental?: {
    waterConsumption?: string;
    waterConsumptionUnit?: string;
    chemicalConsumption?: string;
    chemicalConsumptionUnit?: string;
    co2Emissions?: string;
    co2EmissionsUnit?: string;
    energyConsumption?: string;
    energyConsumptionUnit?: string;
  };
  compliance?: {
    ceMarking?: string;
    rohsCompliance?: string;
  };
  certificates?: {
    certificateName?: string;
  };
  recyclability?: {
    recyclingInstructions?: string;
    materialComposition?: string;
    substancesOfConcern?: string;
  };
  energyUseEfficiency?: {
    batteryType?: string;
    batteryChargingTime?: string;
    batteryChargingTimeUnit?: string;
    batteryLife?: string;
    batteryLifeUnit?: string;
    chargerType?: string;
    maximumElectricalPower?: string;
    maximumElectricalPowerUnit?: string;
    maximumVoltage?: string;
    maximumVoltageUnit?: string;
    maximumCurrent?: string;
    maximumCurrentUnit?: string;
    powerRating?: string;
    powerRatingUnit?: string;
    dcVoltage?: string;
    dcVoltageUnit?: string;
  };
  componentInformation?: Array<{
    componentDescription?: string;
    componentGTIN?: string;
    linkToDPP?: string;
  }>;
  economicOperator?: {
    companyName?: string;
    gln?: string;
    eoriNumber?: string;
    addressLine1?: string;
    addressLine2?: string;
    contactInformation?: string;
  };
  repairInformation?: {
    reasonForRepair?: string;
    performedAction?: string;
    materialsUsed?: string;
    dateOfRepair?: string;
  };
  refurbishmentInformation?: {
    performedAction?: string;
    materialsUsed?: string;
    dateOfRefurbishment?: string;
  };
  recyclingInformation?: {
    performedAction?: string;
    dateOfRecycling?: string;
  };
} | null;

export const dppStepSchema = () =>
  yup.object().nullable().shape({
    productOverview: yup.object().nullable(),
    repairability: yup.object().nullable(),
    environmental: yup.object().nullable(),
    compliance: yup.object().nullable(),
    certificates: yup.object().nullable(),
    recyclability: yup.object().nullable(),
    energyUseEfficiency: yup.object().nullable(),
    componentInformation: yup.array().nullable(),
    economicOperator: yup.object().nullable(),
    repairInformation: yup.object().nullable(),
    refurbishmentInformation: yup.object().nullable(),
    recyclingInformation: yup.object().nullable(),
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
  const [certificatesOpen, setCertificatesOpen] = useState(false);
  const [recyclabilityOpen, setRecyclabilityOpen] = useState(false);
  const [energyOpen, setEnergyOpen] = useState(false);
  const [componentOpen, setComponentOpen] = useState(false);
  const [economicOperatorOpen, setEconomicOperatorOpen] = useState(false);
  const [repairInfoOpen, setRepairInfoOpen] = useState(false);
  const [refurbishmentInfoOpen, setRefurbishmentInfoOpen] = useState(false);
  const [recyclingInfoOpen, setRecyclingInfoOpen] = useState(false);

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
                <Stack vertical spacing="loose">
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
                  </div>

                  <Controller
                    control={control}
                    name="dpp.productOverview.productImage"
                    render={({ field: { onChange, value } }) => (
                      <div>
                        <PLabel label={t("Product Image")} />
                        <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <p className="text-sm text-gray-600">{t("Upload a file or drag and drop")}</p>
                          <p className="text-xs text-gray-500 mt-1">{t("PNG, JPG, GIF up to 10MB")}</p>
                        </div>
                      </div>
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
                    name="dpp.productOverview.productDescription"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Product Description")}
                        placeholder="e.g., GSB 451,18V"
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />

                  <div>
                    <PLabel label={t("Net Weight")} />
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1">
                        <Controller
                          control={control}
                          name="dpp.productOverview.netWeight"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              placeholder="e.g., 80,2"
                              autoComplete="off"
                              value={value || ""}
                              onChange={onChange}
                              onBlur={onBlur}
                            />
                          )}
                        />
                      </div>
                      <div className="w-24">
                        <Controller
                          control={control}
                          name="dpp.productOverview.netWeightUnit"
                          render={({ field: { onChange, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              value={value || "kg"}
                              onChange={onChange}
                              autoComplete="off"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

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

                  <Controller
                    control={control}
                    name="dpp.productOverview.countryOfOrigin"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Country of Origin")}
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
                    name="dpp.productOverview.dimensions"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Dimensions")}
                        placeholder="e.g., 1200 x 1800 x 2200 mm"
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="dpp.productOverview.modelName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Model Name")}
                        placeholder="e.g., Version 1.0"
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="dpp.productOverview.taricCode"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("TARIC Code")}
                        placeholder="e.g., 8517120010"
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="dpp.productOverview.condition"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Condition of the Product")}
                        placeholder="e.g., New"
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />

                  <div>
                    <PLabel label={t("Net Content")} />
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1">
                        <Controller
                          control={control}
                          name="dpp.productOverview.netContent"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              placeholder="e.g., 1 piece"
                              autoComplete="off"
                              value={value || ""}
                              onChange={onChange}
                              onBlur={onBlur}
                            />
                          )}
                        />
                      </div>
                      <div className="w-24">
                        <Controller
                          control={control}
                          name="dpp.productOverview.netContentUnit"
                          render={({ field: { onChange, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              value={value || "pieces"}
                              onChange={onChange}
                              autoComplete="off"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <PLabel label={t("Warranty Duration")} />
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1">
                        <Controller
                          control={control}
                          name="dpp.productOverview.warrantyDuration"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              placeholder="e.g., 5"
                              autoComplete="off"
                              value={value || ""}
                              onChange={onChange}
                              onBlur={onBlur}
                            />
                          )}
                        />
                      </div>
                      <div className="w-24">
                        <Controller
                          control={control}
                          name="dpp.productOverview.warrantyDurationUnit"
                          render={({ field: { onChange, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              value={value || "years"}
                              onChange={onChange}
                              autoComplete="off"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <Controller
                    control={control}
                    name="dpp.productOverview.safetyInstructions"
                    render={({ field: { onChange, value } }) => (
                      <div>
                        <PLabel label={t("Safety Instructions")} />
                        <div className="mt-2 p-3 bg-gray-100 border border-gray-300 rounded flex items-center justify-between">
                          <span className="text-sm">Safety Instructions.PDF</span>
                          <div className="flex gap-2">
                            <button type="button" className="px-3 py-1 bg-gray-200 border border-black rounded text-sm">
                              {t("Edit")}
                            </button>
                            <button type="button" className="px-3 py-1 bg-gray-200 border border-black rounded text-sm">
                              {t("Remove")}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  />
                </Stack>
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
                <Stack vertical spacing="loose">
                  <Controller
                    control={control}
                    name="dpp.repairability.serviceAndRepairInstructions"
                    render={({ field: { onChange, value } }) => (
                      <div>
                        <PLabel label={t("Service and Repair Instructions")} />
                        <div className="mt-2 p-3 bg-gray-100 border border-gray-300 rounded flex items-center justify-between">
                          <span className="text-sm">Service Instructions.PDF</span>
                          <div className="flex gap-2">
                            <button type="button" className="px-3 py-1 bg-gray-200 border border-black rounded text-sm">
                              {t("Edit")}
                            </button>
                            <button type="button" className="px-3 py-1 bg-gray-200 border border-black rounded text-sm">
                              {t("Remove")}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  />

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
                <Stack vertical spacing="loose">
                  <div>
                    <PLabel label={t("Water Consumption per Unit")} />
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1">
                        <Controller
                          control={control}
                          name="dpp.environmental.waterConsumption"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              placeholder="e.g., 1 L"
                              autoComplete="off"
                              value={value || ""}
                              onChange={onChange}
                              onBlur={onBlur}
                            />
                          )}
                        />
                      </div>
                      <div className="w-24">
                        <Controller
                          control={control}
                          name="dpp.environmental.waterConsumptionUnit"
                          render={({ field: { onChange, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              value={value || "L"}
                              onChange={onChange}
                              autoComplete="off"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <PLabel label={t("Chemical Consumption per Unit")} />
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1">
                        <Controller
                          control={control}
                          name="dpp.environmental.chemicalConsumption"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              placeholder="e.g., 1 kg"
                              autoComplete="off"
                              value={value || ""}
                              onChange={onChange}
                              onBlur={onBlur}
                            />
                          )}
                        />
                      </div>
                      <div className="w-24">
                        <Controller
                          control={control}
                          name="dpp.environmental.chemicalConsumptionUnit"
                          render={({ field: { onChange, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              value={value || "kg"}
                              onChange={onChange}
                              autoComplete="off"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <PLabel label={t("CO₂e Emissions per Unit")} />
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1">
                        <Controller
                          control={control}
                          name="dpp.environmental.co2Emissions"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              placeholder="e.g., 1 kg"
                              autoComplete="off"
                              value={value || ""}
                              onChange={onChange}
                              onBlur={onBlur}
                            />
                          )}
                        />
                      </div>
                      <div className="w-24">
                        <Controller
                          control={control}
                          name="dpp.environmental.co2EmissionsUnit"
                          render={({ field: { onChange, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              value={value || "kg"}
                              onChange={onChange}
                              autoComplete="off"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <PLabel label={t("Energy Consumption per Unit")} />
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1">
                        <Controller
                          control={control}
                          name="dpp.environmental.energyConsumption"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              placeholder="e.g., 1 kWh"
                              autoComplete="off"
                              value={value || ""}
                              onChange={onChange}
                              onBlur={onBlur}
                            />
                          )}
                        />
                      </div>
                      <div className="w-24">
                        <Controller
                          control={control}
                          name="dpp.environmental.energyConsumptionUnit"
                          render={({ field: { onChange, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              value={value || "kWh"}
                              onChange={onChange}
                              autoComplete="off"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </Stack>
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

          <div className="h-px bg-gray-300" />

          {/* Certificates Section */}
          <div>
            <button
              type="button"
              onClick={() => setCertificatesOpen(!certificatesOpen)}
              className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 rounded transition-colors"
            >
              <span className="font-medium text-sm">{t("Certificates")}</span>
              <Icon source={certificatesOpen ? ChevronUpMinor : ChevronDownMinor} />
            </button>

            <Collapsible open={certificatesOpen} id="dpp-certificates">
              <div className="pt-4 pb-2">
                <Controller
                  control={control}
                  name="dpp.certificates.certificateName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextField
                      type="text"
                      label={t("Name of Certificate")}
                      placeholder=""
                      autoComplete="off"
                      value={value || ""}
                      onChange={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
              </div>
            </Collapsible>
          </div>

          <div className="h-px bg-gray-300" />

          {/* Recyclability Section */}
          <div>
            <button
              type="button"
              onClick={() => setRecyclabilityOpen(!recyclabilityOpen)}
              className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 rounded transition-colors"
            >
              <span className="font-medium text-sm">{t("Recyclability")}</span>
              <Icon source={recyclabilityOpen ? ChevronUpMinor : ChevronDownMinor} />
            </button>

            <Collapsible open={recyclabilityOpen} id="dpp-recyclability">
              <div className="pt-4 pb-2">
                <Stack vertical spacing="loose">
                  <Controller
                    control={control}
                    name="dpp.recyclability.recyclingInstructions"
                    render={({ field: { onChange, value } }) => (
                      <div>
                        <PLabel label={t("Recycling Instructions")} />
                        <div className="mt-2 p-3 bg-gray-100 border border-gray-300 rounded flex items-center justify-between">
                          <span className="text-sm">Recycling Instructions.PDF</span>
                          <div className="flex gap-2">
                            <button type="button" className="px-3 py-1 bg-gray-200 border border-black rounded text-sm">
                              {t("Edit")}
                            </button>
                            <button type="button" className="px-3 py-1 bg-gray-200 border border-black rounded text-sm">
                              {t("Remove")}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  />

                  <Controller
                    control={control}
                    name="dpp.recyclability.materialComposition"
                    render={({ field: { onChange, value } }) => (
                      <div>
                        <PLabel label={t("Material Composition")} />
                        <div className="mt-2 p-3 bg-gray-100 border border-gray-300 rounded flex items-center justify-between">
                          <span className="text-sm">Material Composition.PDF</span>
                          <div className="flex gap-2">
                            <button type="button" className="px-3 py-1 bg-gray-200 border border-black rounded text-sm">
                              {t("Edit")}
                            </button>
                            <button type="button" className="px-3 py-1 bg-gray-200 border border-black rounded text-sm">
                              {t("Remove")}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  />

                  <Controller
                    control={control}
                    name="dpp.recyclability.substancesOfConcern"
                    render={({ field: { onChange, value } }) => (
                      <div>
                        <PLabel label={t("Substances of Concern and their Concentration and Location")} />
                        <div className="mt-2 p-3 bg-gray-100 border border-gray-300 rounded flex items-center justify-between">
                          <span className="text-sm">Substances of Concern.PDF</span>
                          <div className="flex gap-2">
                            <button type="button" className="px-3 py-1 bg-gray-200 border border-black rounded text-sm">
                              {t("Edit")}
                            </button>
                            <button type="button" className="px-3 py-1 bg-gray-200 border border-black rounded text-sm">
                              {t("Remove")}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  />
                </Stack>
              </div>
            </Collapsible>
          </div>

          <div className="h-px bg-gray-300" />

          {/* Energy Use & Efficiency Section */}
          <div>
            <button
              type="button"
              onClick={() => setEnergyOpen(!energyOpen)}
              className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 rounded transition-colors"
            >
              <span className="font-medium text-sm">{t("Energy Use & Efficiency")}</span>
              <Icon source={energyOpen ? ChevronUpMinor : ChevronDownMinor} />
            </button>

            <Collapsible open={energyOpen} id="dpp-energy">
              <div className="pt-4 pb-2">
                <Stack vertical spacing="loose">
                  <Controller
                    control={control}
                    name="dpp.energyUseEfficiency.batteryType"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Battery Type")}
                        placeholder=""
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />

                  <div>
                    <PLabel label={t("Battery Charging Time")} />
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1">
                        <Controller
                          control={control}
                          name="dpp.energyUseEfficiency.batteryChargingTime"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              placeholder="e.g., 10000 min"
                              autoComplete="off"
                              value={value || ""}
                              onChange={onChange}
                              onBlur={onBlur}
                            />
                          )}
                        />
                      </div>
                      <div className="w-24">
                        <Controller
                          control={control}
                          name="dpp.energyUseEfficiency.batteryChargingTimeUnit"
                          render={({ field: { onChange, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              value={value || "min"}
                              onChange={onChange}
                              autoComplete="off"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <PLabel label={t("Battery Life")} />
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1">
                        <Controller
                          control={control}
                          name="dpp.energyUseEfficiency.batteryLife"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              placeholder="e.g., 10000 min"
                              autoComplete="off"
                              value={value || ""}
                              onChange={onChange}
                              onBlur={onBlur}
                            />
                          )}
                        />
                      </div>
                      <div className="w-24">
                        <Controller
                          control={control}
                          name="dpp.energyUseEfficiency.batteryLifeUnit"
                          render={({ field: { onChange, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              value={value || "min"}
                              onChange={onChange}
                              autoComplete="off"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <Controller
                    control={control}
                    name="dpp.energyUseEfficiency.chargerType"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Charger Type")}
                        placeholder=""
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />

                  <div>
                    <PLabel label={t("Maximum Electrical Power")} />
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1">
                        <Controller
                          control={control}
                          name="dpp.energyUseEfficiency.maximumElectricalPower"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              placeholder="e.g., 100 W"
                              autoComplete="off"
                              value={value || ""}
                              onChange={onChange}
                              onBlur={onBlur}
                            />
                          )}
                        />
                      </div>
                      <div className="w-24">
                        <Controller
                          control={control}
                          name="dpp.energyUseEfficiency.maximumElectricalPowerUnit"
                          render={({ field: { onChange, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              value={value || "W"}
                              onChange={onChange}
                              autoComplete="off"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <PLabel label={t("Maximum Voltage")} />
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1">
                        <Controller
                          control={control}
                          name="dpp.energyUseEfficiency.maximumVoltage"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              placeholder="e.g., 100 V"
                              autoComplete="off"
                              value={value || ""}
                              onChange={onChange}
                              onBlur={onBlur}
                            />
                          )}
                        />
                      </div>
                      <div className="w-24">
                        <Controller
                          control={control}
                          name="dpp.energyUseEfficiency.maximumVoltageUnit"
                          render={({ field: { onChange, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              value={value || "V"}
                              onChange={onChange}
                              autoComplete="off"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <PLabel label={t("Maximum Current")} />
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1">
                        <Controller
                          control={control}
                          name="dpp.energyUseEfficiency.maximumCurrent"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              placeholder="e.g., 100 A"
                              autoComplete="off"
                              value={value || ""}
                              onChange={onChange}
                              onBlur={onBlur}
                            />
                          )}
                        />
                      </div>
                      <div className="w-24">
                        <Controller
                          control={control}
                          name="dpp.energyUseEfficiency.maximumCurrentUnit"
                          render={({ field: { onChange, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              value={value || "A"}
                              onChange={onChange}
                              autoComplete="off"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <PLabel label={t("Power Rating")} />
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1">
                        <Controller
                          control={control}
                          name="dpp.energyUseEfficiency.powerRating"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              placeholder="e.g., 100 W"
                              autoComplete="off"
                              value={value || ""}
                              onChange={onChange}
                              onBlur={onBlur}
                            />
                          )}
                        />
                      </div>
                      <div className="w-24">
                        <Controller
                          control={control}
                          name="dpp.energyUseEfficiency.powerRatingUnit"
                          render={({ field: { onChange, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              value={value || "W"}
                              onChange={onChange}
                              autoComplete="off"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <PLabel label={t("DC Voltage")} />
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1">
                        <Controller
                          control={control}
                          name="dpp.energyUseEfficiency.dcVoltage"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              placeholder="e.g., 100 V"
                              autoComplete="off"
                              value={value || ""}
                              onChange={onChange}
                              onBlur={onBlur}
                            />
                          )}
                        />
                      </div>
                      <div className="w-24">
                        <Controller
                          control={control}
                          name="dpp.energyUseEfficiency.dcVoltageUnit"
                          render={({ field: { onChange, value } }) => (
                            <TextField
                              type="text"
                              label=""
                              value={value || "V"}
                              onChange={onChange}
                              autoComplete="off"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </Stack>
              </div>
            </Collapsible>
          </div>

          <div className="h-px bg-gray-300" />

          {/* Component Information Section */}
          <div>
            <button
              type="button"
              onClick={() => setComponentOpen(!componentOpen)}
              className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 rounded transition-colors"
            >
              <span className="font-medium text-sm">{t("Component Information")}</span>
              <Icon source={componentOpen ? ChevronUpMinor : ChevronDownMinor} />
            </button>

            <Collapsible open={componentOpen} id="dpp-component">
              <div className="pt-4 pb-2">
                <Stack vertical spacing="loose">
                  <div className="p-4 bg-gray-50 border border-gray-300 rounded">
                    <Stack vertical spacing="loose">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-base">{t("Add component")}</span>
                        <Icon source={ChevronUpMinor} />
                      </div>

                      <Controller
                        control={control}
                        name="dpp.componentInformation.0.componentDescription"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextField
                            type="text"
                            label={t("Component Description")}
                            placeholder=""
                            autoComplete="off"
                            value={value || ""}
                            onChange={onChange}
                            onBlur={onBlur}
                          />
                        )}
                      />

                      <Controller
                        control={control}
                        name="dpp.componentInformation.0.componentGTIN"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextField
                            type="text"
                            label={t("Component GTIN")}
                            placeholder=""
                            autoComplete="off"
                            value={value || ""}
                            onChange={onChange}
                            onBlur={onBlur}
                          />
                        )}
                      />

                      <Controller
                        control={control}
                        name="dpp.componentInformation.0.linkToDPP"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextField
                            type="text"
                            label={t("Link to DPP of Component")}
                            placeholder="ex. mylink.com"
                            autoComplete="off"
                            value={value || ""}
                            onChange={onChange}
                            onBlur={onBlur}
                            helpText={t("Lorem ipsum dolor sit amet.")}
                          />
                        )}
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
              </div>
            </Collapsible>
          </div>

          <div className="h-px bg-gray-300" />

          {/* Economic Operator Section */}
          <div>
            <button
              type="button"
              onClick={() => setEconomicOperatorOpen(!economicOperatorOpen)}
              className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 rounded transition-colors"
            >
              <span className="font-medium text-sm">{t("Economic Operator")}</span>
              <Icon source={economicOperatorOpen ? ChevronUpMinor : ChevronDownMinor} />
            </button>

            <Collapsible open={economicOperatorOpen} id="dpp-economic-operator">
              <div className="pt-4 pb-2">
                <Stack vertical spacing="loose">
                  <Controller
                    control={control}
                    name="dpp.economicOperator.companyName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Company name")}
                        placeholder=""
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="dpp.economicOperator.gln"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("GLN")}
                        placeholder=""
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="dpp.economicOperator.eoriNumber"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("EORI number")}
                        placeholder=""
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="dpp.economicOperator.addressLine1"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Address line 1 (street & house number)")}
                        placeholder=""
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="dpp.economicOperator.addressLine2"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Address line 2 (postal code & city)")}
                        placeholder=""
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="dpp.economicOperator.contactInformation"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Contact information (email)")}
                        placeholder="ex. mylink.com"
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                        helpText={t("Lorem ipsum dolor sit amet.")}
                      />
                    )}
                  />
                </Stack>
              </div>
            </Collapsible>
          </div>

          <div className="h-px bg-gray-300" />

          {/* Information about the Repair Section */}
          <div>
            <button
              type="button"
              onClick={() => setRepairInfoOpen(!repairInfoOpen)}
              className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 rounded transition-colors"
            >
              <span className="font-medium text-sm">{t("Information about the Repair")}</span>
              <Icon source={repairInfoOpen ? ChevronUpMinor : ChevronDownMinor} />
            </button>

            <Collapsible open={repairInfoOpen} id="dpp-repair-info">
              <div className="pt-4 pb-2">
                <Stack vertical spacing="loose">
                  <Controller
                    control={control}
                    name="dpp.repairInformation.reasonForRepair"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Reason for Repair")}
                        placeholder="Write your description here"
                        multiline={4}
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                        helpText={t("Lorem ipsum dolor sit amet.")}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="dpp.repairInformation.performedAction"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Performed Action")}
                        placeholder="Write your description here"
                        multiline={4}
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                        helpText={t("Lorem ipsum dolor sit amet.")}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="dpp.repairInformation.materialsUsed"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Materials Used")}
                        placeholder="Write your description here"
                        multiline={4}
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                        helpText={t("Lorem ipsum dolor sit amet.")}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="dpp.repairInformation.dateOfRepair"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Date of Repair")}
                        placeholder=""
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />
                </Stack>
              </div>
            </Collapsible>
          </div>

          <div className="h-px bg-gray-300" />

          {/* Information about the Refurbishment Section */}
          <div>
            <button
              type="button"
              onClick={() => setRefurbishmentInfoOpen(!refurbishmentInfoOpen)}
              className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 rounded transition-colors"
            >
              <span className="font-medium text-sm">{t("Information about the Refurbishment")}</span>
              <Icon source={refurbishmentInfoOpen ? ChevronUpMinor : ChevronDownMinor} />
            </button>

            <Collapsible open={refurbishmentInfoOpen} id="dpp-refurbishment-info">
              <div className="pt-4 pb-2">
                <Stack vertical spacing="loose">
                  <Controller
                    control={control}
                    name="dpp.refurbishmentInformation.performedAction"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Performed Action")}
                        placeholder="Write your description here"
                        multiline={4}
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                        helpText={t("Lorem ipsum dolor sit amet.")}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="dpp.refurbishmentInformation.materialsUsed"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Materials Used")}
                        placeholder="Write your description here"
                        multiline={4}
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                        helpText={t("Lorem ipsum dolor sit amet.")}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="dpp.refurbishmentInformation.dateOfRefurbishment"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Date and Time of Refurbishment")}
                        placeholder=""
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />
                </Stack>
              </div>
            </Collapsible>
          </div>

          <div className="h-px bg-gray-300" />

          {/* Information on the Recycling Section */}
          <div>
            <button
              type="button"
              onClick={() => setRecyclingInfoOpen(!recyclingInfoOpen)}
              className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 rounded transition-colors"
            >
              <span className="font-medium text-sm">{t("Information on the Recycling")}</span>
              <Icon source={recyclingInfoOpen ? ChevronUpMinor : ChevronDownMinor} />
            </button>

            <Collapsible open={recyclingInfoOpen} id="dpp-recycling-info">
              <div className="pt-4 pb-2">
                <Stack vertical spacing="loose">
                  <Controller
                    control={control}
                    name="dpp.recyclingInformation.performedAction"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Performed Action")}
                        placeholder="Write your description here"
                        multiline={4}
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                        helpText={t("Lorem ipsum dolor sit amet.")}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="dpp.recyclingInformation.dateOfRecycling"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextField
                        type="text"
                        label={t("Date and Time of Recycling")}
                        placeholder=""
                        autoComplete="off"
                        value={value || ""}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />
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
                (
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
                )
              )}
            />
          </div>
        </Stack>
      )}
    </Stack>
  );
}
