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
