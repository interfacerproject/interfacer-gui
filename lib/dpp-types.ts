/**
 * TypeScript types matching the interfacer-dpp Go backend model.
 * These represent the API document shapes (not form input shapes).
 *
 * @see ~/dyne/interfacer-dpp/internal/model/model.go
 */

// --- Primitives ---

export type TransformedValue<T = any> = {
  type: string;
  value: T;
  units?: string;
};

export type Attachment = {
  id: string;
  fileName: string;
  contentType: string;
  url: string;
  size: number;
  checksum: string;
  uploadedAt: string;
};

// --- Forward-looking types (ie5.1) ---

export type BatchType = "batch" | "unit";
export type DppStatus = "active" | "draft" | "archived";

// --- DPP Sections ---

export type ProductOverview = {
  brandName?: TransformedValue<string>;
  productImage?: TransformedValue<string>;
  globalProductClassificationCode?: TransformedValue<string>;
  countryOfSale?: TransformedValue<string>;
  productDescription?: TransformedValue<string>;
  productName?: TransformedValue<string>;
  netWeight?: TransformedValue<number>;
  gtin?: TransformedValue<string>;
  color?: TransformedValue<string>;
  countryOfOrigin?: TransformedValue<string>;
  dimensions?: TransformedValue<string>;
  modelName?: TransformedValue<string>;
  taricCode?: TransformedValue<string>;
  conditionOfTheProduct?: TransformedValue<string>;
  netContent?: TransformedValue<number>;
  nominalMaximumRPM?: TransformedValue<number>;
  maximumDrillingDiameter?: TransformedValue<number>;
  numberOfGears?: TransformedValue<number>;
  torque?: TransformedValue<number>;
  warrantyDuration?: TransformedValue<number>;
  safetyInstructions?: TransformedValue<string>;
  consumerUnit?: TransformedValue<string>;
  netContentAndUnitOfMeasure?: TransformedValue<string>;
  yearOfSale?: TransformedValue<number>;
};

export type Reparability = {
  serviceAndRepairInstructions?: TransformedValue<string>;
  availabilityOfSpareParts?: TransformedValue<string>;
};

export type EnvironmentalImpact = {
  waterConsumptionPerUnit?: TransformedValue<number>;
  chemicalConsumptionPerUnit?: TransformedValue<number>;
  co2eEmissionsPerUnit?: TransformedValue<number>;
  energyConsumptionPerUnit?: TransformedValue<number>;
  cleaningPerformanceAtLowTemperature?: TransformedValue<number>;
  minimumContentOfMaterialWithSustainabilityCertification?: TransformedValue<number>;
};

export type ComplianceAndStandards = {
  ceMarking?: TransformedValue<string>;
  rohsCompliance?: TransformedValue<string>;
};

export type Certificates = {
  nameOfCertificate?: TransformedValue<string>;
};

export type Recyclability = {
  recyclingInstructions?: TransformedValue<string>;
  materialComposition?: TransformedValue<string>;
  substancesOfConcern?: TransformedValue<string>;
};

export type EnergyUseAndEfficiency = {
  batteryType?: TransformedValue<string>;
  batteryChargingTime?: TransformedValue<number>;
  batteryLife?: TransformedValue<number>;
  chargerType?: TransformedValue<string>;
  maximumElectricalPower?: TransformedValue<number>;
  maximumVoltage?: TransformedValue<number>;
  maximumCurrent?: TransformedValue<number>;
  powerRating?: TransformedValue<number>;
  dcVoltage?: TransformedValue<number>;
};

export type ComponentInformation = {
  componentDescription?: TransformedValue<string>;
  componentGTIN?: TransformedValue<string>;
  linkToDPP?: TransformedValue<string>;
};

export type EconomicOperator = {
  companyName?: TransformedValue<string>;
  gln?: TransformedValue<string>;
  eoriNumber?: TransformedValue<string>;
  addressLine1?: TransformedValue<string>;
  addressLine2?: TransformedValue<string>;
  contactInformation?: TransformedValue<string>;
};

export type RepairInformation = {
  reasonForRepair?: TransformedValue<string>;
  performedAction?: TransformedValue<string>;
  materialsUsed?: TransformedValue<string>;
  dateOfRepair?: TransformedValue<string>;
};

export type RefurbishmentInformation = {
  performedAction?: TransformedValue<string>;
  materialsUsed?: TransformedValue<string>;
  dateOfRefurbishment?: TransformedValue<string>;
};

export type RecyclingInformation = {
  performedAction?: TransformedValue<string>;
  dateOfRecycling?: TransformedValue<string>;
};

export type ConsumerInformation = {
  marketingClaim?: TransformedValue<string>;
};

export type DosageInstructions = {
  usageAndDisposalInfo?: TransformedValue<string>;
};

export type Ingredients = {
  ingredientList?: TransformedValue<string>;
  minimumContentOfBiodegradableSubstances?: TransformedValue<number>;
  presenceOfNonBiodegradableMicroplastics?: TransformedValue<string>;
};

export type ChemicalConsumption = {
  amount?: TransformedValue<number>;
  ingredient?: TransformedValue<string>;
};

export type Packaging = {
  chemicalConsumption?: ChemicalConsumption;
  disposalInstructions?: TransformedValue<string>;
  minimumRecycledContent?: TransformedValue<number>;
  recyclablePackaging?: TransformedValue<string>;
};

// --- Main Document ---

export type DppDocument = {
  id: string;
  // Forward-looking fields (ie5.1 — not yet in backend)
  productId?: string;
  batchType?: BatchType;
  batchId?: string;
  createdBy?: string;
  status?: DppStatus;
  createdAt?: string;
  updatedAt?: string;
  // Sections
  productOverview?: ProductOverview;
  reparability?: Reparability;
  environmentalImpact?: EnvironmentalImpact;
  complianceAndStandards?: ComplianceAndStandards;
  certificates?: Certificates;
  recyclability?: Recyclability;
  energyUseAndEfficiency?: EnergyUseAndEfficiency;
  components?: ComponentInformation[];
  economicOperator?: EconomicOperator;
  repairInformation?: RepairInformation;
  refurbishmentInformation?: RefurbishmentInformation;
  recyclingInformation?: RecyclingInformation;
  consumerInformation?: ConsumerInformation;
  dosageInstructions?: DosageInstructions;
  ingredients?: Ingredients;
  packaging?: Packaging;
};

// --- API Request/Response types ---

export type CreateDppResponse = {
  insertedID: string;
};

export type UpdateDppResponse = {
  matchedCount: number;
  modifiedCount: number;
};

export type DeleteDppResponse = {
  deletedCount: number;
};

export type ListDppsFilters = {
  productId?: string;
  createdBy?: string;
  status?: DppStatus;
  q?: string;
  sortBy?: "createdAt" | "name";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
};

export type StatusFacets = {
  active: number;
  draft: number;
  archived: number;
};

export type ListDppsResponse = {
  dpps: DppDocument[];
  total: number;
  facets?: StatusFacets;
};

export type DppApiError = {
  error: string;
  details?: string;
};
