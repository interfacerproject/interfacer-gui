import PLabel from "components/polaris/PLabel";
import { useTranslation } from "next-i18next";
import { Controller, useFormContext } from "react-hook-form";

interface FileUploadFieldProps {
  label: string;
  name: string;
  fileName: string;
}

export const FileUploadField = ({ label, name, fileName }: FileUploadFieldProps) => {
  const { control } = useFormContext();
  const { t } = useTranslation("createProjectProps");

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <div>
          <PLabel label={label} />
          <div className="mt-2 p-3 bg-gray-100 border border-gray-300 rounded flex items-center justify-between">
            <span className="text-sm">{fileName}</span>
            <div className="flex gap-2">
              <button type="button" className="px-3 py-1 bg-gray-200 border border-black rounded text-sm">
                {t("Edit")}
              </button>
              <button type="button" className="px-3 py-1 bg-gray-200 border border-black rounded text-sm">
                {t("Remove")}
              </button>
            </div>
          </div>
        </div>
      )}
    />
  );
};
