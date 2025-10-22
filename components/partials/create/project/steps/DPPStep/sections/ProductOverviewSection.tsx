import { Stack } from "@bbtgnn/polaris-interfacer";
import PLabel from "components/polaris/PLabel";
import { useTranslation } from "next-i18next";
import { Controller, useFormContext } from "react-hook-form";
import { ControlledTextField } from "../components/ControlledTextField";
import { FieldWithUnit } from "../components/FieldWithUnit";
import { FileUploadField } from "../components/FileUploadField";

export const ProductOverviewSection = () => {
  const { t } = useTranslation("createProjectProps");
  const { control } = useFormContext();

  return (
    <Stack vertical spacing="loose">
      <div className="grid grid-cols-2 gap-4">
        <ControlledTextField
          name="dpp.productOverview.brandName"
          label={t("Brand Name")}
          placeholder="e.g., INMachines"
        />
        <ControlledTextField
          name="dpp.productOverview.productName"
          label={t("Product Name")}
          placeholder="e.g., OLSK Large 3D Printer"
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

      <ControlledTextField
        name="dpp.productOverview.gpc"
        label={t("Global Product Classification (GPC)")}
        placeholder="e.g., 10000050"
      />

      <ControlledTextField
        name="dpp.productOverview.countryOfSale"
        label={t("Country of Sale")}
        placeholder="e.g., Germany"
      />

      <ControlledTextField
        name="dpp.productOverview.productDescription"
        label={t("Product Description")}
        placeholder="e.g., GSB 451,18V"
      />

      <FieldWithUnit
        label={t("Net Weight")}
        valueName="dpp.productOverview.netWeight"
        unitName="dpp.productOverview.netWeightUnit"
        placeholder="e.g., 80,2"
        defaultUnit="kg"
      />

      <ControlledTextField name="dpp.productOverview.gtin" label={t("GTIN")} placeholder="e.g., 012345678905" />

      <ControlledTextField name="dpp.productOverview.color" label={t("Color")} placeholder="e.g., Black" />

      <ControlledTextField
        name="dpp.productOverview.countryOfOrigin"
        label={t("Country of Origin")}
        placeholder="e.g., Germany"
      />

      <ControlledTextField
        name="dpp.productOverview.dimensions"
        label={t("Dimensions")}
        placeholder="e.g., 1200 x 1800 x 2200 mm"
      />

      <ControlledTextField
        name="dpp.productOverview.modelName"
        label={t("Model Name")}
        placeholder="e.g., Version 1.0"
      />

      <ControlledTextField
        name="dpp.productOverview.taricCode"
        label={t("TARIC Code")}
        placeholder="e.g., 8517120010"
      />

      <ControlledTextField
        name="dpp.productOverview.condition"
        label={t("Condition of the Product")}
        placeholder="e.g., New"
      />

      <FieldWithUnit
        label={t("Net Content")}
        valueName="dpp.productOverview.netContent"
        unitName="dpp.productOverview.netContentUnit"
        placeholder="e.g., 1"
        defaultUnit="pieces"
      />

      <FieldWithUnit
        label={t("Warranty Duration")}
        valueName="dpp.productOverview.warrantyDuration"
        unitName="dpp.productOverview.warrantyDurationUnit"
        placeholder="e.g., 5"
        defaultUnit="years"
      />

      <FileUploadField
        label={t("Safety Instructions")}
        name="dpp.productOverview.safetyInstructions"
        fileName="Safety Instructions.PDF"
      />
    </Stack>
  );
};
