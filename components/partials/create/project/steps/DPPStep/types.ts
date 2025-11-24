export type TransformedValue = {
  type: string;
  value: any;
  units?: string;
};

export type DPPStepValues = {
  productOverview?: {
    brandName?: TransformedValue;
    productImage?: File;
    globalProductClassificationCode?: TransformedValue;
    countryOfSale?: TransformedValue;
    productDescription?: TransformedValue;
    productName?: TransformedValue;
    netWeight?: TransformedValue;
    gtin?: TransformedValue;
    color?: TransformedValue;
    countryOfOrigin?: TransformedValue;
    dimensions?: TransformedValue;
    modelName?: TransformedValue;
    taricCode?: TransformedValue;
    conditionOfTheProduct?: TransformedValue;
    netContent?: TransformedValue;
    nominalMaximumRPM?: TransformedValue;
    maximumDrillingDiameter?: TransformedValue;
    numberOfGears?: TransformedValue;
    torque?: TransformedValue;
    warrantyDuration?: TransformedValue;
    safetyInstructions?: File;
    consumerUnit?: TransformedValue;
    netContentAndUnitOfMeasure?: TransformedValue;
    yearOfSale?: TransformedValue;
  };
  reparability?: {
    serviceAndRepairInstructions?: File;
    availabilityOfSpareParts?: TransformedValue;
  };
  environmentalImpact?: {
    waterConsumptionPerUnit?: TransformedValue;
    chemicalConsumptionPerUnit?: TransformedValue;
    co2eEmissionsPerUnit?: TransformedValue;
    energyConsumptionPerUnit?: TransformedValue;
    cleaningPerformanceAtLowTemperature?: TransformedValue;
    minimumContentOfMaterialWithSustainabilityCertification?: TransformedValue;
  };
  complianceAndStandards?: {
    ceMarking?: TransformedValue;
    rohsCompliance?: TransformedValue;
  };
  certificates?: {
    nameOfCertificate?: TransformedValue;
  };
  recyclability?: {
    recyclingInstructions?: TransformedValue;
    materialComposition?: TransformedValue;
    substancesOfConcern?: TransformedValue;
  };
  energyUseAndEfficiency?: {
    batteryType?: TransformedValue;
    batteryChargingTime?: TransformedValue;
    batteryLife?: TransformedValue;
    chargerType?: TransformedValue;
    maximumElectricalPower?: TransformedValue;
    maximumVoltage?: TransformedValue;
    maximumCurrent?: TransformedValue;
    powerRating?: TransformedValue;
    dcVoltage?: TransformedValue;
  };
  components?: Array<{
    componentDescription?: TransformedValue;
    componentGTIN?: TransformedValue;
    linkToDPP?: TransformedValue;
  }>;
  economicOperator?: {
    companyName?: TransformedValue;
    gln?: TransformedValue;
    eoriNumber?: TransformedValue;
    addressLine1?: TransformedValue;
    addressLine2?: TransformedValue;
    contactInformation?: TransformedValue;
  };
  repairInformation?: {
    reasonForRepair?: TransformedValue;
    performedAction?: TransformedValue;
    materialsUsed?: TransformedValue;
    dateOfRepair?: TransformedValue;
  };
  refurbishmentInformation?: {
    performedAction?: TransformedValue;
    materialsUsed?: TransformedValue;
    dateOfRefurbishment?: TransformedValue;
  };
  recyclingInformation?: {
    performedAction?: TransformedValue;
    dateOfRecycling?: TransformedValue;
  };
  consumerInformation?: {
    marketingClaim?: TransformedValue;
  };
  dosageInstructions?: {
    usageAndDisposalInfo?: TransformedValue;
  };
  ingredients?: {
    ingredientList?: TransformedValue;
    minimumContentOfBiodegradableSubstances?: TransformedValue;
    presenceOfNonBiodegradableMicroplastics?: TransformedValue;
  };
  packaging?: {
    chemicalConsumption?: {
      amount?: TransformedValue;
      ingredient?: TransformedValue;
    };
    disposalInstructions?: TransformedValue;
    minimumRecycledContent?: TransformedValue;
    recyclablePackaging?: TransformedValue;
  };
} | null;
