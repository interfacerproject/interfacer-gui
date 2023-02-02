import { Banner, DropZone, List, Stack, Text, Thumbnail } from "@bbtgnn/polaris-interfacer";
import { useCallback, useState } from "react";

export default function ImagesStep() {
  const [files, setFiles] = useState<Array<File>>([]);
  const [rejectedFiles, setRejectedFiles] = useState<Array<File>>([]);
  const hasError = rejectedFiles.length > 0;

  const handleDrop = useCallback(
    (_droppedFiles: Array<File>, acceptedFiles: Array<File>, rejectedFiles: Array<File>) => {
      setFiles(files => [...files, ...acceptedFiles]);
      setRejectedFiles(rejectedFiles);
    },
    []
  );

  const fileUpload = !files.length && <DropZone.FileUpload />;
  const uploadedFiles = files.length > 0 && (
    <Stack vertical>
      {files.map((file: File, index) => (
        <Stack alignment="center" key={index}>
          <Thumbnail size="small" alt={file.name} source={window.URL.createObjectURL(file)} />
          <div>
            {file.name}{" "}
            <Text variant="bodySm" as="p">
              {file.size} {"bytes"}
            </Text>
          </div>
        </Stack>
      ))}
    </Stack>
  );

  const errorMessage = hasError && (
    <Banner title="The following images couldn’t be uploaded:" status="critical">
      <List type="bullet">
        {rejectedFiles.map((file: File, index) => (
          <List.Item key={index}>
            {`"${file.name}" is not supported. File type must be .gif, .jpg, .png or .svg.`}
          </List.Item>
        ))}
      </List>
    </Banner>
  );

  return (
    <Stack vertical>
      {errorMessage}
      <DropZone accept="image/*" type="image" onDrop={handleDrop}>
        {uploadedFiles}
        {fileUpload}
      </DropZone>
    </Stack>
  );
}
