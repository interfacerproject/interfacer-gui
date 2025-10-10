import { Button, Card, Collapsible, Spinner, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { ChevronDownMinor, ChevronUpMinor } from "@shopify/polaris-icons";
import React, { useCallback, useEffect, useState } from "react";

interface DPPValue {
  type: string;
  value: any;
  units?: string;
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
  components: any;
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
  icon: string;
  color: string;
}

interface GC1DPPProps {
  ulid: string;
}

const categoryConfigs: CategoryConfig[] = [
  {
    key: "productOverview",
    title: "Product Overview",
    icon: "https://simbaimagestorage.blob.core.windows.net/dpp/Product%20Overview.svg",
    color: "rgb(0, 44, 108)",
  },
  {
    key: "energyUseAndEfficiency",
    title: "Lifetime",
    icon: "https://simbaimagestorage.blob.core.windows.net/dpp/Life%20Time.svg",
    color: "rgb(0, 44, 108)",
  },
  {
    key: "reparability",
    title: "Power Capability",
    icon: "https://simbaimagestorage.blob.core.windows.net/dpp/Power%20Capability.svg",
    color: "rgb(0, 44, 108)",
  },
  {
    key: "complianceAndStandards",
    title: "Compliance and Standards",
    icon: "https://simbaimagestorage.blob.core.windows.net/dpp/Compliance%20%26%20%20Standards.svg",
    color: "rgb(0, 44, 108)",
  },
  {
    key: "recyclability",
    title: "Recyclability",
    icon: "https://simbaimagestorage.blob.core.windows.net/dpp/Recyclability.svg",
    color: "rgb(0, 44, 108)",
  },
  {
    key: "economicOperator",
    title: "Economic Operator",
    icon: "https://dpp.eecc.de/api/management/files/attribute_group_economic_operator",
    color: "rgb(0, 44, 108)",
  },
  {
    key: "packaging",
    title: "Packaging",
    icon: "https://simbaimagestorage.blob.core.windows.net/dpp/Packaging.svg",
    color: "rgb(0, 44, 108)",
  },
  {
    key: "environmentalImpact",
    title: "Environmental Impact",
    icon: "https://simbaimagestorage.blob.core.windows.net/dpp/Environmental%20Impact.svg",
    color: "rgb(0, 44, 108)",
  },
  {
    key: "ingredients",
    title: "Ingredients",
    icon: "https://simbaimagestorage.blob.core.windows.net/dpp/Ingredients.svg",
    color: "rgb(0, 44, 108)",
  },
  {
    key: "dosageInstruction",
    title: "Dosage Instructions",
    icon: "https://simbaimagestorage.blob.core.windows.net/dpp/Dosage%20Instructions.svg",
    color: "rgb(0, 44, 108)",
  },
  {
    key: "refurbishmentInformation",
    title: "Information about the Refurbishment",
    icon: "",
    color: "rgb(0, 44, 108)",
  },
  {
    key: "recyclingInformation",
    title: "Information on the Recycling",
    icon: "",
    color: "rgb(0, 44, 108)",
  },
  {
    key: "consumerInformation",
    title: "Consumer Information",
    icon: "https://simbaimagestorage.blob.core.windows.net/dpp/Consumer%20%20Information.svg",
    color: "rgb(0, 44, 108)",
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
  dimensions: "Dimensons",
  consumerUnit: "Consumer Unit",
  countryOfOrigin: "Country of Origin",
  companyName: "Company name",
  gln: "GLN",
  eoriNumber: "EORI number",
  addressLine1: "Address line 1 (street & house number)",
  addressLine2: "Address line 2 (postal code & city)",
  contactInformation: "contact information (email)",
  performedAction: "Performed Action",
  dateOfRefurbishment: "Date of Refurbishment",
  dateOfRecycling: "Date of Recycle",
  ceMarking: "Conformity Assessment (CE)",
  rohsCompliance: "EU Declaration of Conformity ID",
  recyclingInstructions: "Separate Collection",
  materialComposition: "End of Life Information",
  chemicalConsumptionInPackaging:
    "Chemical Consumption in Packaging, Unit [ppb] or [mg/kg] /// Ingredient List [Lead, Cadmium, Mercury and Hexavalent Chromium]",
  disposalInstructions: "Disposal Instructions",
  recyclablePackaging: "Recyclable Packaging",
  minimumRecycledContentInPackaging: "Minimum Recycled Content in Packaging",
  waterConsumptionPerUnit: "Water Consumption per Unit",
  chemicalConsumptionPerUnit: "Chemical Consumption per Unit",
  co2eEmissionsPerUnit: "CO₂e Emissions per Unit",
  energyConsumptionPerUnit: "Energy Consumption per Unit",
  cleaningPerformanceAtLowTemperature: "Cleaning Performance of the Product at Low Temperature",
  minimumContentOfMaterialWithSustainabilityCertification:
    "Minimum Content of Material with Sustainability Certification per kg or Unit of Product (or Component)",
  ingredientList: "Ingredient List",
  minimumContentOfBiodegradableSubstances: "Minimum Content of Biodegradable Substances/Materials",
  presenceOfNonBiodegradableMicroplastics: "Presence of non-biodegradable microplastics and/or microbeads",
  informationOnHowToCorrectlyUseAndDispose:
    "Information on How to Correctly Use (Focus on Dosing) and Dispose the Product",
  marketingClaim: "Marketing Claim",
};

const GC1DPP: React.FC<GC1DPPProps> = ({ ulid }) => {
  const [data, setData] = useState<DPPData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  console.log(data);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/dpp/${ulid}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();
        console.log(responseData);
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
    if (!field.value && field.value !== 0) return "";

    if (field.type === "quantity" && field.units) {
      return `${field.value} ${field.units}`;
    }

    if (field.type === "text" && field.value && field.value.includes("http")) {
      return field.value;
    }

    return String(field.value);
  };

  const hasValidData = (field: DPPValue): boolean => {
    return field.value !== null && field.value !== undefined && field.value !== "" && field.type !== "";
  };

  const HexagonIcon: React.FC<{ icon: string; color: string }> = ({ icon, color }) => {
    if (!icon) {
      return (
        <div
          className="relative w-12 h-14 cursor-pointer"
          style={{
            backgroundColor: color,
            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
        />
      );
    }

    return (
      <div
        className="relative w-12 h-14 cursor-pointer flex items-center justify-center"
        style={{
          backgroundColor: color,
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }}
      >
        <img src={icon} alt="Category icon" className="w-7 h-7 object-contain" />
      </div>
    );
  };

  const DataTable: React.FC<{ data: Record<string, DPPValue> }> = ({ data }) => {
    const validEntries = Object.entries(data).filter(([, field]) => hasValidData(field));

    if (validEntries.length === 0) return null;

    return (
      <div className="mt-3">
        <div className="overflow-hidden rounded border border-gray-200">
          <table className="min-w-full">
            <tbody className="bg-white divide-y divide-gray-200">
              {validEntries.map(([key, field]) => {
                const displayName =
                  fieldNameMap[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
                const value = formatValue(field);

                return (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 w-1/2">{displayName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {field.value && field.value.includes && field.value.includes("http") ? (
                        <a
                          href={value}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {value}
                        </a>
                      ) : (
                        <span>{value}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const CategorySection: React.FC<{ config: CategoryConfig; data: Record<string, DPPValue> }> = ({ config, data }) => {
    const isOpen = openSections[config.key];
    const hasData = data && Object.values(data).some(field => hasValidData(field));

    if (!hasData) return null;

    return (
      <div className="mt-8">
        <div className="flex items-start">
          <div className="mt-1 mr-4">
            <Button
              plain
              onClick={() => handleToggle(config.key)}
              ariaExpanded={isOpen}
              ariaControls={`section-${config.key}`}
              icon={isOpen ? ChevronUpMinor : ChevronDownMinor}
              accessibilityLabel={`Toggle ${config.title} section`}
            />
          </div>
          <div className="mr-4 -mt-2">
            <HexagonIcon icon={config.icon} color={config.color} />
          </div>
          <div className="flex-1">
            <Text variant="headingMd" as="h3" color="subdued">
              {config.title}
            </Text>
          </div>
        </div>

        <Collapsible
          open={isOpen}
          id={`section-${config.key}`}
          transition={{ duration: "300ms", timingFunction: "ease-in-out" }}
        >
          <DataTable data={data} />
        </Collapsible>

        <div className="mt-6 border-b border-gray-200" />
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
          {"No data available"}
        </Text>
      </div>
    );
  }

  return (
    <div className="min-h-64 bg-white">
      <Card sectioned>
        <div className="flex flex-col gap-2">
          {categoryConfigs.map(config => (
            <CategorySection key={config.key} config={config} data={data[config.key] as Record<string, DPPValue>} />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default GC1DPP;
