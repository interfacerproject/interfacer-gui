import * as yup from "yup";
import { DPPStepValues } from "./types";

const transformedValueSchema = yup.object().shape({
  type: yup.string().default("Text"),
  value: yup.mixed().nullable(),
  units: yup.string().nullable(),
});

export const dppStepSchema = () =>
  yup
    .object()
    .nullable()
    .shape({
      productOverview: yup.object().nullable().shape({
        brandName: transformedValueSchema,
        productImage: transformedValueSchema,
        globalProductClassificationCode: transformedValueSchema,
        countryOfSale: transformedValueSchema,
        productDescription: transformedValueSchema,
        productName: transformedValueSchema,
        netWeight: transformedValueSchema,
        gtin: transformedValueSchema,
        color: transformedValueSchema,
        countryOfOrigin: transformedValueSchema,
        dimensions: transformedValueSchema,
        modelName: transformedValueSchema,
        taricCode: transformedValueSchema,
        conditionOfTheProduct: transformedValueSchema,
        netContent: transformedValueSchema,
        nominalMaximumRPM: transformedValueSchema,
        maximumDrillingDiameter: transformedValueSchema,
        numberOfGears: transformedValueSchema,
        torque: transformedValueSchema,
        warrantyDuration: transformedValueSchema,
        safetyInstructions: transformedValueSchema,
        consumerUnit: transformedValueSchema,
        netContentAndUnitOfMeasure: transformedValueSchema,
        yearOfSale: transformedValueSchema,
      }),
      reparability: yup.object().nullable().shape({
        serviceAndRepairInstructions: transformedValueSchema,
        availabilityOfSpareParts: transformedValueSchema,
      }),
      environmentalImpact: yup.object().nullable().shape({
        waterConsumptionPerUnit: transformedValueSchema,
        chemicalConsumptionPerUnit: transformedValueSchema,
        co2eEmissionsPerUnit: transformedValueSchema,
        energyConsumptionPerUnit: transformedValueSchema,
        cleaningPerformanceAtLowTemperature: transformedValueSchema,
        minimumContentOfMaterialWithSustainabilityCertification: transformedValueSchema,
      }),
      complianceAndStandards: yup.object().nullable().shape({
        ceMarking: transformedValueSchema,
        rohsCompliance: transformedValueSchema,
      }),
      certificates: yup.object().nullable().shape({
        nameOfCertificate: transformedValueSchema,
      }),
      recyclability: yup.object().nullable().shape({
        recyclingInstructions: transformedValueSchema,
        materialComposition: transformedValueSchema,
        substancesOfConcern: transformedValueSchema,
      }),
      energyUseAndEfficiency: yup.object().nullable().shape({
        batteryType: transformedValueSchema,
        batteryChargingTime: transformedValueSchema,
        batteryLife: transformedValueSchema,
        chargerType: transformedValueSchema,
        maximumElectricalPower: transformedValueSchema,
        maximumVoltage: transformedValueSchema,
        maximumCurrent: transformedValueSchema,
        powerRating: transformedValueSchema,
        dcVoltage: transformedValueSchema,
      }),
      components: yup
        .array()
        .of(
          yup.object().shape({
            componentDescription: transformedValueSchema,
            componentGTIN: transformedValueSchema,
            linkToDPP: transformedValueSchema,
          })
        )
        .nullable(),
      economicOperator: yup.object().nullable().shape({
        companyName: transformedValueSchema,
        gln: transformedValueSchema,
        eoriNumber: transformedValueSchema,
        addressLine1: transformedValueSchema,
        addressLine2: transformedValueSchema,
        contactInformation: transformedValueSchema,
      }),
      repairInformation: yup.object().nullable().shape({
        reasonForRepair: transformedValueSchema,
        performedAction: transformedValueSchema,
        materialsUsed: transformedValueSchema,
        dateOfRepair: transformedValueSchema,
      }),
      refurbishmentInformation: yup.object().nullable().shape({
        performedAction: transformedValueSchema,
        materialsUsed: transformedValueSchema,
        dateOfRefurbishment: transformedValueSchema,
      }),
      recyclingInformation: yup.object().nullable().shape({
        performedAction: transformedValueSchema,
        dateOfRecycling: transformedValueSchema,
      }),
      consumerInformation: yup.object().nullable().shape({
        marketingClaim: transformedValueSchema,
      }),
      dosageInstructions: yup.object().nullable().shape({
        usageAndDisposalInfo: transformedValueSchema,
      }),
      ingredients: yup.object().nullable().shape({
        ingredientList: transformedValueSchema,
        minimumContentOfBiodegradableSubstances: transformedValueSchema,
        presenceOfNonBiodegradableMicroplastics: transformedValueSchema,
      }),
      packaging: yup
        .object()
        .nullable()
        .shape({
          chemicalConsumption: yup.object().nullable().shape({
            amount: transformedValueSchema,
            ingredient: transformedValueSchema,
          }),
          disposalInstructions: transformedValueSchema,
          minimumRecycledContent: transformedValueSchema,
          recyclablePackaging: transformedValueSchema,
        }),
    });

export const dppStepDefaultValues: DPPStepValues | null = null;
