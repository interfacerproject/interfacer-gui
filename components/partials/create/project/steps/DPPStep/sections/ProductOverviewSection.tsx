import { Stack } from "@bbtgnn/polaris-interfacer";
import PFileUpload from "components/polaris/PFileUpload";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { useTranslation } from "next-i18next";
import { useFormContext } from "react-hook-form";
import { ControlledTextField } from "../components/ControlledTextField";
import { FieldWithUnit } from "../components/FieldWithUnit";
import { FileUploadField } from "../components/FileUploadField";

export const ProductOverviewSection = () => {
  const { t } = useTranslation("createProjectProps");
  const { control, setValue, watch } = useFormContext();

  return (
    <Stack vertical spacing="loose">
      <div className="grid grid-cols-2 gap-4">
        <ControlledTextField
          name="dpp.productOverview.brandName.value"
          label={t("Brand Name")}
          placeholder="e.g., INMachines"
        />
        <ControlledTextField
          name="dpp.productOverview.productName.value"
          label={t("Product Name")}
          placeholder="e.g., OLSK Large 3D Printer"
        />
      </div>

      <PFileUpload
        maxFiles={1}
        files={watch("dpp.productOverview.productImage.value") || []}
        onUpdate={(files: File[]) => setValue("dpp.productOverview.productImage.value", files, formSetValueOptions)}
        accept="image"
        maxSize={10000000}
        label={t("Product Image")}
        helpText={t("PNG, JPG, GIF up to 10MB")}
      />

      <ControlledTextField
        name="dpp.productOverview.globalProductClassificationCode.value"
        label={t("Global Product Classification (GPC)")}
        placeholder="e.g., 10000050"
      />

      <ControlledTextField
        name="dpp.productOverview.countryOfSale.value"
        label={t("Country of Sale")}
        placeholder="e.g., Germany"
      />

      <ControlledTextField
        name="dpp.productOverview.productDescription.value"
        label={t("Product Description")}
        placeholder="e.g., GSB 451,18V"
      />

      <FieldWithUnit
        label={t("Net Weight")}
        valueName="dpp.productOverview.netWeight.value"
        unitName="dpp.productOverview.netWeight.units"
        placeholder="e.g., 80,2"
        defaultUnit="kg"
      />

      <ControlledTextField name="dpp.productOverview.gtin.value" label={t("GTIN")} placeholder="e.g., 012345678905" />

      <ControlledTextField name="dpp.productOverview.color.value" label={t("Color")} placeholder="e.g., Black" />

      <ControlledTextField
        name="dpp.productOverview.countryOfOrigin.value"
        label={t("Country of Origin")}
        placeholder="e.g., Germany"
      />

      <ControlledTextField
        name="dpp.productOverview.dimensions.value"
        label={t("Dimensions")}
        placeholder="e.g., 1200 x 1800 x 2200 mm"
      />

      <ControlledTextField
        name="dpp.productOverview.modelName.value"
        label={t("Model Name")}
        placeholder="e.g., Version 1.0"
      />

      <ControlledTextField
        name="dpp.productOverview.taricCode.value"
        label={t("TARIC Code")}
        placeholder="e.g., 8517120010"
      />

      <ControlledTextField
        name="dpp.productOverview.conditionOfTheProduct.value"
        label={t("Condition of the Product")}
        placeholder="e.g., New"
      />

      <FieldWithUnit
        label={t("Net Content")}
        valueName="dpp.productOverview.netContent.value"
        unitName="dpp.productOverview.netContent.units"
        placeholder="e.g., 1"
        defaultUnit="pieces"
      />

      <FieldWithUnit
        label={t("Warranty Duration")}
        valueName="dpp.productOverview.warrantyDuration.value"
        unitName="dpp.productOverview.warrantyDuration.units"
        placeholder="e.g., 5"
        defaultUnit="years"
      />

      <FileUploadField
        label={t("Safety Instructions")}
        name="dpp.productOverview.safetyInstructions.value"
        fileName="Safety Instructions.PDF"
      />

      <ControlledTextField
        name="dpp.productOverview.nominalMaximumRPM.value"
        label={t("Nominal Maximum RPM")}
        placeholder="e.g., 1500"
      />

      <ControlledTextField
        name="dpp.productOverview.maximumDrillingDiameter.value"
        label={t("Maximum Drilling Diameter")}
        placeholder="e.g., 13mm"
      />

      <ControlledTextField
        name="dpp.productOverview.numberOfGears.value"
        label={t("Number of Gears")}
        placeholder="e.g., 2"
      />

      <ControlledTextField name="dpp.productOverview.torque.value" label={t("Torque")} placeholder="e.g., 50Nm" />

      <ControlledTextField
        name="dpp.productOverview.consumerUnit.value"
        label={t("Consumer Unit")}
        placeholder="e.g., Yes"
      />

      <ControlledTextField
        name="dpp.productOverview.netContentAndUnitOfMeasure.value"
        label={t("Net Content and Unit of Measure")}
        placeholder="e.g., 1 piece"
      />

      <ControlledTextField
        name="dpp.productOverview.yearOfSale.value"
        label={t("Year of Sale")}
        placeholder="e.g., 2023"
      />
    </Stack>
  );
};
