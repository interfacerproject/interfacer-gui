import { Collapsible, Spinner, Text } from "@bbtgnn/polaris-interfacer";
import { ChevronDownMinor, ChevronUpMinor } from "@shopify/polaris-icons";
import { useTranslation } from "next-i18next";
import React, { useCallback, useEffect, useState } from "react";

interface DPPValue {
  type: string;
  value: any;
  units?: string;
}

interface ComponentInformation {
  componentDescription?: DPPValue;
  componentGTIN?: DPPValue;
  linkToDPP?: DPPValue;
}

interface DPPData {
  id: string;
  productOverview: Record<string, DPPValue>;
  reparability: Record<string, DPPValue>;
  environmentalImpact: Record<string, DPPValue>;
  complianceAndStandards: Record<string, DPPValue>;
  certificates: Record<string, DPPValue>;
  recyclability: Record<string, DPPValue>;
  energyUseAndEfficiency: Record<string, DPPValue>;
  components: ComponentInformation[];
  economicOperator: Record<string, DPPValue>;
  repairInformation: Record<string, DPPValue>;
  refurbishmentInformation: Record<string, DPPValue>;
  recyclingInformation: Record<string, DPPValue>;
  dosageInstruction: Record<string, DPPValue>;
  ingredients: Record<string, DPPValue>;
  packaging: Record<string, DPPValue>;
  consumerInformation: Record<string, DPPValue>;
}

interface CategoryConfig {
  key: keyof DPPData;
  title: string;
  subtitle: string;
}

interface GC1DPPProps {
  ulid: string;
}

const categoryConfigs: CategoryConfig[] = [
  {
    key: "productOverview",
    title: "DPP Overview",
    subtitle: "Basic product information and identification",
  },
  {
    key: "complianceAndStandards",
    title: "Compliance and Standards",
    subtitle: "Regulatory compliance information",
  },
  {
    key: "reparability",
    title: "Repairability",
    subtitle: "Information about product repair and spare parts",
  },
  {
    key: "environmentalImpact",
    title: "Environmental Impact",
    subtitle: "Resource consumption and emissions data",
  },
  {
    key: "certificates",
    title: "Certificates",
    subtitle: "Environmental and quality certifications",
  },
  {
    key: "recyclability",
    title: "Recyclability",
    subtitle: "Material composition and recycling information",
  },
  {
    key: "energyUseAndEfficiency",
    title: "Energy Use & Efficiency",
    subtitle: "Battery and power specifications",
  },
  {
    key: "components",
    title: "Component Information",
    subtitle: "Component-level compliance data",
  },
  {
    key: "economicOperator",
    title: "Economic Operator",
    subtitle: "Manufacturer and company information",
  },
  {
    key: "repairInformation",
    title: "Information about the Repair",
    subtitle: "Repair history and documentation",
  },
  {
    key: "refurbishmentInformation",
    title: "Information about the Refurbishment",
    subtitle: "Refurbishment history and processes",
  },
  {
    key: "recyclingInformation",
    title: "Information on the Recycling",
    subtitle: "End-of-life recycling data",
  },
];

// Field name mapping for better display
const fieldNameMap: Record<string, string> = {
  brandName: "Brand Name",
  productImage: "Product Image",
  globalProductClassificationCode: "Global Product Classification Code (GPC)",
  countryOfSale: "Country of Sale",
  productDescription: "Product Description",
  productName: "Product Name",
  netWeight: "Net Weight",
  netContentAndUnitOfMeasure: "Net Content and Unit of Measure",
  gtin: "GTIN",
  yearOfSale: "Year of Sale",
  dimensions: "Dimensions",
  consumerUnit: "Consumer Unit",
  countryOfOrigin: "Country of Origin",
  companyName: "Company name",
  gln: "GLN",
  eoriNumber: "EORI number",
  addressLine1: "Address line 1 (street & house number)",
  addressLine2: "Address line 2 (postal code & city)",
  contactInformation: "Contact Information",
  performedAction: "Performed Action",
  dateOfRefurbishment: "Date of Refurbishment",
  dateOfRecycling: "Date of Recycle",
  ceMarking: "CE Marking",
  rohsCompliance: "ROHS Compliance",
  recyclingInstructions: "Recycling Instructions",
  materialComposition: "Material Composition",
  substancesOfConcern: "Substances of Concern",
  chemicalConsumptionInPackaging: "Chemical Consumption in Packaging",
  disposalInstructions: "Disposal Instructions",
  recyclablePackaging: "Recyclable Packaging",
  minimumRecycledContentInPackaging: "Minimum Recycled Content in Packaging",
  waterConsumptionPerUnit: "Water Consumption per Unit",
  chemicalConsumptionPerUnit: "Chemical Consumption per Unit",
  co2eEmissionsPerUnit: "CO₂e Emissions per Unit",
  energyConsumptionPerUnit: "Energy Consumption per Unit",
  cleaningPerformanceAtLowTemperature: "Cleaning Performance at Low Temperature",
  minimumContentOfMaterialWithSustainabilityCertification:
    "Minimum Content of Material with Sustainability Certification",
  ingredientList: "Ingredient List",
  minimumContentOfBiodegradableSubstances: "Minimum Content of Biodegradable Substances",
  presenceOfNonBiodegradableMicroplastics: "Presence of non-biodegradable microplastics",
  informationOnHowToCorrectlyUseAndDispose: "Information on How to Correctly Use and Dispose",
  marketingClaim: "Marketing Claim",
  batteryType: "Battery Type",
  batteryChargingTime: "Battery Charging Time",
  batteryLife: "Battery Life",
  chargerType: "Charger Type",
  maximumElectricalPower: "Maximum Electrical Power",
  maximumVoltage: "Maximum Voltage",
  maximumCurrent: "Maximum Current",
  powerRating: "Power Rating",
  dcVoltage: "DC Voltage",
  componentDescription: "Component Description",
  componentGTIN: "Component GTIN",
  linkToDPP: "Link to DPP",
  serviceAndRepairInstructions: "Service and Repair Instructions",
  availabilityOfSpareParts: "Availability of Spare Parts",
  nameOfCertificate: "Name of Certificate",
  reasonForRepair: "Reason for Repair",
  materialsUsed: "Materials Used",
  dateOfRepair: "Date of Repair",
};

const GC1DPP: React.FC<GC1DPPProps> = ({ ulid }) => {
  const { t } = useTranslation("common");
  const [data, setData] = useState<DPPData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_DPP_URL}/dpp/${ulid}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();
        setData(responseData);

        const initialOpenState: Record<string, boolean> = {};
        categoryConfigs.forEach(config => {
          initialOpenState[config.key] = true;
        });
        setOpenSections(initialOpenState);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ulid]);

  const handleToggle = useCallback((sectionKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  }, []);

  const formatValue = (field: DPPValue): string => {
    if (!field?.value && field?.value !== 0) return "";

    if (field.type === "quantity" && field.units) {
      return `${field.value} ${field.units}`;
    }

    if (field.type === "text" && typeof field.value === "string" && field.value.includes("http")) {
      return field.value;
    }

    return String(field.value);
  };

  const hasValidData = (field: DPPValue): boolean => {
    return field?.value !== null && field?.value !== undefined && field?.value !== "" && field?.type !== "";
  };

  const FieldDisplay: React.FC<{ label: string; value: string; isLink?: boolean }> = ({ label, value, isLink }) => (
    <div className="flex flex-col gap-2 w-full">
      <div className="text-[#0b1324] text-sm font-medium font-sans leading-[14px]">{t(label)}</div>
      <div className="bg-[#C8D4E5]/15 border border-white rounded-[4px] h-[36px] px-3 py-1 flex items-center w-full overflow-hidden">
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer noopener"
            className="text-blue-600 hover:text-blue-800 underline truncate text-sm font-sans"
          >
            {value}
          </a>
        ) : (
          <span className="text-[#0b1324] text-sm font-normal font-sans truncate">{value}</span>
        )}
      </div>
    </div>
  );

  const DataGrid: React.FC<{ data: Record<string, DPPValue> }> = ({ data }) => {
    const validEntries = Object.entries(data).filter(([, field]) => hasValidData(field));

    if (validEntries.length === 0) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 pt-0">
        {validEntries.map(([key, field]) => {
          const displayName =
            fieldNameMap[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
          const value = formatValue(field);
          const isLink = field.value && typeof field.value === "string" && field.value.includes("http");

          return <FieldDisplay key={key} label={displayName} value={value} isLink={isLink} />;
        })}
      </div>
    );
  };

  const ComponentsSection: React.FC<{ components: ComponentInformation[] }> = ({ components }) => {
    if (!components || components.length === 0) return null;

    return (
      <div className="flex flex-col gap-6 p-6 pt-0">
        {components.map((component, index) => (
          <div key={index} className="border border-gray-200 rounded p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(component).map(([key, field]) => {
                if (!hasValidData(field)) return null;
                const displayName = fieldNameMap[key] || key;
                const value = formatValue(field);
                const isLink = field.value && typeof field.value === "string" && field.value.includes("http");
                return <FieldDisplay key={key} label={displayName} value={value} isLink={isLink} />;
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const CategorySection: React.FC<{ config: CategoryConfig; data: any }> = ({ config, data }) => {
    const isOpen = openSections[config.key];

    let hasData = false;
    if (config.key === "components") {
      hasData = data && Array.isArray(data) && data.length > 0;
    } else {
      hasData = data && Object.values(data).some((field: any) => hasValidData(field));
    }

    if (!hasData) return null;

    return (
      <div className="bg-white border border-[#c9cccf] rounded-[8px] w-full overflow-hidden">
        <div
          className="flex items-center justify-between px-6 py-5 cursor-pointer"
          onClick={() => handleToggle(config.key)}
        >
          <div className="flex flex-col gap-0">
            <h3 className="text-[#0b1324] text-xl font-bold font-display leading-[30px]">{t(config.title)}</h3>
            <p className="text-[#6c707c] text-sm font-normal font-sans leading-[21px]">{t(config.subtitle)}</p>
          </div>
          <div className="w-6 h-6 flex items-center justify-center text-gray-500">
            {isOpen ? <ChevronUpMinor className="w-6 h-6" /> : <ChevronDownMinor className="w-6 h-6" />}
          </div>
        </div>

        <Collapsible
          open={isOpen}
          id={`section-${config.key}`}
          transition={{ duration: "300ms", timingFunction: "ease-in-out" }}
        >
          {config.key === "components" ? <ComponentsSection components={data} /> : <DataGrid data={data} />}
        </Collapsible>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <Text variant="bodyMd" as="p" color="critical">{`Error: ${error}`}</Text>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
        <Text variant="bodyMd" as="p" color="subdued">
          {t("No data available")}
        </Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Main Header */}
      <div className="bg-white border border-[#c9cccf] rounded-[8px] w-full p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#036A53]/10 rounded-[6px] flex items-center justify-center p-2">
            {/* Placeholder for the Passport Icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="#036A53"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="#036A53"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="#036A53"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <h2 className="text-[#0b1324] text-2xl font-bold font-display leading-[36px]">{t("Product Passport")}</h2>
            <p className="text-[#6c707c] text-sm font-normal font-sans leading-[21px]">
              {t(
                "Detailed specifications about materials, manufacturing, and lifecycle data to support transparency, repair, and recycling."
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-6">
          {categoryConfigs.map(config => (
            <CategorySection key={config.key} config={config} data={data[config.key]} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GC1DPP;
