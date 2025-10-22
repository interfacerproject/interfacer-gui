import { Checkbox, Stack } from "@bbtgnn/polaris-interfacer";
import PHelp from "components/polaris/PHelp";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { CreateProjectValues } from "../CreateProjectForm";
import { CollapsibleSection } from "./DPPStep/components";
import {
  CertificatesSection,
  ComplianceSection,
  ComponentInformationSection,
  EconomicOperatorSection,
  EnergyUseEfficiencySection,
  EnvironmentalSection,
  ProductOverviewSection,
  RecyclabilitySection,
  RecyclingInformationSection,
  RefurbishmentInformationSection,
  RepairabilitySection,
  RepairInformationSection,
} from "./DPPStep/sections";

// Re-export types and schema for backward compatibility
export { dppStepDefaultValues, dppStepSchema } from "./DPPStep/schema";
export type { DPPStepValues } from "./DPPStep/types";

// Import the type for internal use
import type { DPPStepValues } from "./DPPStep/types";
import PLabel from "components/polaris/PLabel";

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
    <Stack vertical spacing="loose">
      {/* Header with title and help text */}
      <PTitleSubtitle title={t("Digital Product Passport (DPP)")} />
      <PHelp helpText={t("Add detailed product information for the Digital Product Passport")} />

      {/* Toggle to enable/disable DPP */}
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

      {/* DPP Form Sections - only show when enabled */}
      {dppEnabled && (
        <Stack vertical spacing="none">
          {/* Product Overview Section */}
          <CollapsibleSection
            title={t("Product Overview")}
            isOpen={overviewOpen}
            onToggle={() => setOverviewOpen(!overviewOpen)}
            id="product-overview"
          >
            <ProductOverviewSection />
          </CollapsibleSection>

          {/* Repairability Section */}
          <CollapsibleSection
            title={t("Repairability")}
            isOpen={repairabilityOpen}
            onToggle={() => setRepairabilityOpen(!repairabilityOpen)}
            id="repairability"
          >
            <RepairabilitySection />
          </CollapsibleSection>

          {/* Environmental Section */}
          <CollapsibleSection
            title={t("Environmental")}
            isOpen={environmentalOpen}
            onToggle={() => setEnvironmentalOpen(!environmentalOpen)}
            id="environmental"
          >
            <EnvironmentalSection />
          </CollapsibleSection>

          {/* Compliance Section */}
          <CollapsibleSection
            title={t("Compliance")}
            isOpen={complianceOpen}
            onToggle={() => setComplianceOpen(!complianceOpen)}
            id="compliance"
          >
            <ComplianceSection />
          </CollapsibleSection>

          {/* Certificates Section */}
          <CollapsibleSection
            title={t("Certificates")}
            isOpen={certificatesOpen}
            onToggle={() => setCertificatesOpen(!certificatesOpen)}
            id="certificates"
          >
            <CertificatesSection />
          </CollapsibleSection>

          {/* Recyclability Section */}
          <CollapsibleSection
            title={t("Recyclability")}
            isOpen={recyclabilityOpen}
            onToggle={() => setRecyclabilityOpen(!recyclabilityOpen)}
            id="recyclability"
          >
            <RecyclabilitySection />
          </CollapsibleSection>

          {/* Energy Use & Efficiency Section */}
          <CollapsibleSection
            title={t("Energy Use & Efficiency")}
            isOpen={energyOpen}
            onToggle={() => setEnergyOpen(!energyOpen)}
            id="energy"
          >
            <EnergyUseEfficiencySection />
          </CollapsibleSection>

          {/* Component Information Section */}
          <CollapsibleSection
            title={t("Component Information")}
            isOpen={componentOpen}
            onToggle={() => setComponentOpen(!componentOpen)}
            id="component"
          >
            <ComponentInformationSection />
          </CollapsibleSection>

          {/* Economic Operator Section */}
          <CollapsibleSection
            title={t("Economic Operator")}
            isOpen={economicOperatorOpen}
            onToggle={() => setEconomicOperatorOpen(!economicOperatorOpen)}
            id="economic-operator"
          >
            <EconomicOperatorSection />
          </CollapsibleSection>

          {/* Repair Information Section */}
          <CollapsibleSection
            title={t("Repair Information")}
            isOpen={repairInfoOpen}
            onToggle={() => setRepairInfoOpen(!repairInfoOpen)}
            id="repair-info"
          >
            <RepairInformationSection />
          </CollapsibleSection>

          {/* Refurbishment Information Section */}
          <CollapsibleSection
            title={t("Refurbishment Information")}
            isOpen={refurbishmentInfoOpen}
            onToggle={() => setRefurbishmentInfoOpen(!refurbishmentInfoOpen)}
            id="refurbishment-info"
          >
            <RefurbishmentInformationSection />
          </CollapsibleSection>

          {/* Recycling Information Section */}
          <CollapsibleSection
            title={t("Recycling Information")}
            isOpen={recyclingInfoOpen}
            onToggle={() => setRecyclingInfoOpen(!recyclingInfoOpen)}
            id="recycling-info"
          >
            <RecyclingInformationSection />
          </CollapsibleSection>
        </Stack>
      )}
    </Stack>
  );
}
