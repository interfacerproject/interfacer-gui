import { Banner, Button, DropZone, Icon, List, Stack, Text, Thumbnail } from "@bbtgnn/polaris-interfacer";
import { CancelMinor } from "@shopify/polaris-icons";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useState } from "react";
import PHelp from "./PHelp";
import PLabel from "./PLabel";

//

export interface Props {
  files?: Array<File>;
  onUpdate?: (files: Array<File>) => void;

  maxFiles?: number;
  maxSize?: number;
  accept?: "image" | "file";
  allowDuplicates?: boolean;
  customValidators?: Array<FileValidator>;
  requiredIndicator?: boolean;
  label?: string;
  actionTitle?: string;
  helpText?: string;
}

type FileValidator = (file: File) => { valid: boolean; message: string };

//

export default function PFileUpload(props: Props) {
  const { t } = useTranslation("createProjectProps");
  const {
    files = [],
    onUpdate = () => {},

    maxFiles,
    maxSize,
    accept = "file",
    allowDuplicates = false,
    customValidators = [],
    requiredIndicator = false,
    actionTitle = t("Click here to upload or Drag and drop"),
    helpText = "",
  } = props;

  //

  const [rejectedFiles, setRejectedFiles] = useState<Array<File>>([]);

  const hasError = rejectedFiles.length > 0;
  const [showError, setShowError] = useState(false);

  const handleDrop = useCallback(
    (_droppedFiles: Array<File>, _acceptedFiles: Array<File>, _rejectedFiles: Array<File>) => {
      setShowError(true);
      onUpdate([...files, ..._acceptedFiles]);
      setRejectedFiles(_rejectedFiles);
    },
    [onUpdate, files]
  );

  function handleRemoveFile(file: File) {
    onUpdate(files.filter(f => f !== file));
  }

  useEffect(() => {
    if (maxFiles && files.length > maxFiles) {
      setRejectedFiles(r => [...r, ...files.slice(maxFiles, files.length)]);
      onUpdate(files.slice(0, maxFiles));
    }
  }, [files, maxFiles, onUpdate]);

  // Validators

  const validators: Array<FileValidator> = [
    file => {
      return {
        valid: allowDuplicates ? true : !files.some(f => f.name === file.name),
        message: t("File already existing"),
      };
    },
    file => {
      return {
        valid: maxSize ? file.size <= maxSize : true,
        message: t("File size over limit"),
      };
    },
    file => {
      return {
        valid: accept == "image" ? file.type.startsWith("image/") : true,
        message: t("File type invalid"),
      };
    },
    file => {
      return {
        valid: maxFiles ? files.length < maxFiles : true,
        message: t("File number over limit"),
      };
    },
    ...customValidators,
  ];

  function customValidator(file: unknown): boolean {
    if (!(file instanceof File)) return true; // Needed to skip dropzone hover event
    return validators.map(validator => validator(file)).every(result => result.valid);
  }

  function getFileErrors(file: File): Array<string> {
    return validators
      .map(validator => validator(file))
      .filter(result => !result.valid)
      .map(result => result.message);
  }

  /* Rendering */

  const fileDisplay = (file: File) => (
    <div className="flex flex-row justify-between" key={file.name}>
      <div className="flex flex-row items-center">
        <Thumbnail size="small" alt={file.name} source={window.URL.createObjectURL(file)} />

        <div className="ml-3">
          <Text variant="bodyMd" as="p">
            {file.name}
          </Text>
          <Text variant="bodySm" as="p">
            {file.size} {"bytes"}
          </Text>
        </div>
      </div>

      <div
        onClick={event => {
          event.stopPropagation();
          handleRemoveFile(file);
        }}
      >
        <Button icon={<Icon source={CancelMinor} />} />
      </div>
    </div>
  );

  const uploadedFiles = (
    <div className="p-4 flex flex-col space-y-4">
      {files.map((file: File) => (
        <div key={file.name}>{fileDisplay(file)}</div>
      ))}
    </div>
  );

  const fileError = (file: File) => (
    <Text as="p" variant="bodyMd">
      <span className="font-bold">{file.name}</span>
      {getFileErrors(file).map((error, index) => (
        <span key={index}>
          {" - "}
          {error}
        </span>
      ))}
    </Text>
  );

  const errorBanner = (
    <div className="pt-4">
      <Banner
        title={t("The following files couldn’t be uploaded:")}
        status="critical"
        onDismiss={() => {
          setShowError(false);
        }}
      >
        <div className="spacer h-2" />
        <List type="bullet">
          {rejectedFiles.map((file: File, index) => (
            <List.Item key={index}>{fileError(file)}</List.Item>
          ))}
        </List>
      </Banner>
    </div>
  );

  return (
    <Stack vertical spacing="tight">
      {props.label && <PLabel label={props.label} requiredIndicator={requiredIndicator} />}
      <DropZone onDrop={handleDrop} customValidator={customValidator} id="dropzone-images">
        {files.length > 0 && uploadedFiles}
        {!files.length && <DropZone.FileUpload actionTitle={actionTitle} />}
      </DropZone>
      {helpText && <PHelp helpText={helpText} />}

      {hasError && showError && errorBanner}
    </Stack>
  );
}
