import PLabel from "components/polaris/PLabel";
import { useTranslation } from "next-i18next";
import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

interface FileUploadFieldProps {
  label: string;
  name: string;
  fileName?: string;
  maxFiles?: number;
  maxSize?: number;
  accept?: "image" | "file";
  allowDuplicates?: boolean;
  customValidators?: Array<FileValidator>;
  error?: string;
}

type FileValidator = (file: File) => { valid: boolean; message: string };

export const FileUploadField = ({
  label,
  name,
  fileName,
  maxFiles = 1,
  maxSize,
  accept = "file",
  allowDuplicates = false,
  customValidators = [],
  error,
}: FileUploadFieldProps) => {
  const { control, watch, setValue } = useFormContext();
  const { t } = useTranslation("createProjectProps");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rejectedFiles, setRejectedFiles] = useState<Array<File>>([]);
  const [showError, setShowError] = useState(false);

  const hasError = rejectedFiles.length > 0;

  // Watch the field value to enforce maxFiles
  const fieldValue = watch(name);

  useEffect(() => {
    const files = Array.isArray(fieldValue) ? fieldValue : [];
    if (maxFiles && files.length > maxFiles) {
      const excess = files.slice(maxFiles);
      setRejectedFiles(r => [...r, ...excess]);
      setValue(name, files.slice(0, maxFiles));
    }
  }, [fieldValue, maxFiles, name, setValue]);

  const validators = (files: Array<File>): Array<FileValidator> => [
    file => ({
      valid: allowDuplicates ? true : !files.some(f => f.name === file.name),
      message: t("File already existing"),
    }),
    file => ({
      valid: maxSize ? file.size <= maxSize : true,
      message: t("File size over limit"),
    }),
    file => ({
      valid: accept == "image" ? file.type.startsWith("image/") : true,
      message: t("File type invalid"),
    }),
    file => ({
      valid: maxFiles ? files.length < maxFiles : true,
      message: t("File number over limit"),
    }),
    ...customValidators,
  ];

  const validateFile = (file: File, currentFiles: Array<File>): boolean => {
    return validators(currentFiles)
      .map(validator => validator(file))
      .every(result => result.valid);
  };

  const getFileErrors = (file: File, currentFiles: Array<File>): Array<string> => {
    return validators(currentFiles)
      .map(validator => validator(file))
      .filter(result => !result.valid)
      .map(result => result.message);
  };

  const handleFileSelect = (onChange: (files: Array<File>) => void, currentFiles: Array<File>) => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    onChange: (files: Array<File>) => void,
    currentFiles: Array<File>
  ) => {
    const selectedFiles = Array.from(event.target.files || []);
    const acceptedFiles: Array<File> = [];
    const rejected: Array<File> = [];

    selectedFiles.forEach(file => {
      if (validateFile(file, [...currentFiles, ...acceptedFiles])) {
        acceptedFiles.push(file);
      } else {
        rejected.push(file);
      }
    });

    setShowError(true);
    setRejectedFiles(rejected);

    if (acceptedFiles.length > 0) {
      onChange([...currentFiles, ...acceptedFiles]);
    }

    // Reset input value to allow selecting the same file again
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleRemoveFile = (fileToRemove: File, onChange: (files: Array<File>) => void, currentFiles: Array<File>) => {
    onChange(currentFiles.filter(f => f !== fileToRemove));
  };

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={[]}
      render={({ field: { onChange, value = [] } }) => {
        const files = Array.isArray(value) ? value : [];

        return (
          <div>
            <PLabel label={label} />

            {/* File Input (Hidden) */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={accept === "image" ? "image/*" : undefined}
              multiple={maxFiles !== 1}
              onChange={e => handleFileChange(e, onChange, files)}
            />

            {/* Display uploaded files */}
            {files.length > 0 ? (
              <div className="mt-2 space-y-2">
                {files.map((file: File, index: number) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="p-3 bg-gray-100 border border-gray-300 rounded flex items-center justify-between"
                  >
                    <span className="text-sm truncate">{file.name}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="px-3 py-1 bg-gray-200 border border-black rounded text-sm hover:bg-gray-300"
                        onClick={() => handleFileSelect(onChange, files)}
                      >
                        {t("Edit")}
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 bg-gray-200 border border-black rounded text-sm hover:bg-gray-300"
                        onClick={() => handleRemoveFile(file, onChange, files)}
                      >
                        {t("Remove")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Show upload prompt when no files
              <div className="mt-2 p-3 bg-gray-100 border border-gray-300 rounded flex items-center justify-between">
                <span className="text-sm text-gray-500">{fileName || t("No file selected")}</span>
                <button
                  type="button"
                  className="px-3 py-1 bg-gray-200 border border-black rounded text-sm hover:bg-gray-300"
                  onClick={() => handleFileSelect(onChange, files)}
                >
                  {t("Upload")}
                </button>
              </div>
            )}

            {/* Error Messages */}
            {error && showError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-300 rounded">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-red-600">{error}</p>
                  <button type="button" className="text-red-600 hover:text-red-800" onClick={() => setShowError(false)}>
                    {t("Close")}
                  </button>
                </div>
              </div>
            )}

            {/* Rejected Files Errors */}
            {hasError && showError && rejectedFiles.length > 0 && (
              <div className="mt-2 p-3 bg-red-50 border border-red-300 rounded">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-semibold text-red-600">{t("The following files couldn't be uploaded:")}</p>
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-800"
                    onClick={() => {
                      setShowError(false);
                      setRejectedFiles([]);
                    }}
                  >
                    {t("Close")}
                  </button>
                </div>
                <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                  {rejectedFiles.map((file: File, index) => (
                    <li key={index}>
                      <span className="font-bold">{file.name}</span>
                      {getFileErrors(file, files).map((err, errIndex) => (
                        <span key={errIndex}>{` - ${err}`}</span>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      }}
    />
  );
};
