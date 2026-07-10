import { Stack, TextField } from "@bbtgnn/polaris-interfacer";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { useTranslation } from "next-i18next";
import { useFormContext } from "react-hook-form";
import * as yup from "yup";
import { CreateProjectValues } from "../CreateProjectForm";

export type ModelFilesStepValues = Array<{ url: string }>;

export const modelFilesStepSchema = () =>
  yup
    .array()
    .of(
      yup.object({
        url: yup.string().url().required(),
      })
    )
    .default([]);

export const modelFilesStepDefaultValues: ModelFilesStepValues = [];

const allowedExtensions = new Set(["step", "stp", "stl"]);

function getExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split(".").pop()?.toLowerCase() || "";
  } catch {
    return "";
  }
}

function isValidCadUrl(url: string): boolean {
  if (!url) return false;
  try {
    new URL(url);
    const ext = getExtension(url);
    return allowedExtensions.has(ext);
  } catch {
    return false;
  }
}

export default function ModelFilesStep() {
  const { t } = useTranslation("createProjectProps");
  const { setValue, watch, formState } = useFormContext<CreateProjectValues>();
  const { errors } = formState;

  const modelFiles = watch("modelFiles") || [];

  function handleUrlChange(index: number, url: string) {
    const updated = [...modelFiles];
    updated[index] = { url };
    setValue("modelFiles", updated, { shouldValidate: true, shouldDirty: true });
  }

  function handleAddUrl() {
    setValue("modelFiles", [...modelFiles, { url: "" }], { shouldValidate: false, shouldDirty: true });
  }

  function handleRemoveUrl(index: number) {
    const updated = modelFiles.filter((_: unknown, i: number) => i !== index);
    setValue("modelFiles", updated, { shouldValidate: true, shouldDirty: true });
  }

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle
        title={t("Add CAD files")}
        subtitle={t(
          "Provide links to STEP, STP or STL files for your design. These will be viewable directly in your browser from the design detail page — no upload needed."
        )}
      />

      {/* Existing URL fields */}
      {modelFiles.map((entry: { url: string }, index: number) => (
        <div key={index} className="flex items-start gap-2">
          <div className="flex-1">
            <TextField
              type="url"
              id={`modelFiles.${index}.url`}
              name={`modelFiles.${index}.url`}
              value={entry.url}
              autoComplete="off"
              onChange={(value: string) => handleUrlChange(index, value)}
              label={index === 0 ? t("CAD file URL") : t("Additional CAD file URL")}
              placeholder="https://example.com/model.step"
              helpText={
                !entry.url
                  ? t("Paste a direct link to a STEP, STP or STL file")
                  : !isValidCadUrl(entry.url)
                  ? t("URL must point to a STEP (.step, .stp) or STL (.stl) file")
                  : getExtension(entry.url).toUpperCase() + t(" file detected")
              }
              error={
                !entry.url
                  ? undefined
                  : !isValidCadUrl(entry.url)
                  ? t("Invalid CAD file URL — must be a STEP or STL file")
                  : undefined
              }
              requiredIndicator={index === 0}
            />
          </div>
          <button
            type="button"
            onClick={() => handleRemoveUrl(index)}
            className="mt-7 inline-flex items-center justify-center w-9 h-9 rounded-full border border-ifr bg-transparent cursor-pointer transition-colors hover:bg-red-50 hover:border-red-300"
            aria-label={t("Remove URL")}
            style={{ color: "var(--ifr-text-secondary)" }}
          >
            {"\u00d7"}
          </button>
        </div>
      ))}

      {/* Add another URL button */}
      <button
        type="button"
        onClick={handleAddUrl}
        className="inline-flex items-center gap-1.5 px-4 py-2 border border-ifr rounded-ifr-sm bg-transparent cursor-pointer transition-colors hover:bg-ifr-hover"
        style={{
          fontFamily: "var(--ifr-font-body)",
          fontSize: "var(--ifr-fs-base)",
          color: "var(--ifr-text-secondary)",
        }}
      >
        <span className="text-lg leading-none">+</span>
        {t("Add another CAD file")}
      </button>
    </Stack>
  );
}
