import { Banner, DropZone, List } from "@bbtgnn/polaris-interfacer";
import PFieldInfo from "components/polaris/PFieldInfo";
import { useCallback, useState } from "react";

interface Props {
  initialImage?: string;
  label?: string;
  helpText?: string;
  image?: File | null;
  onChange?: (file: File) => void;
}

export default function ProfileImageEditor(props: Props) {
  const { initialImage, label, helpText, onChange = () => {}, image = null } = props;
  const [error, setError] = useState<string>("");
  const [rejectedFiles, setRejectedFiles] = useState<File[]>([]);
  const hasError = rejectedFiles.length > 0;

  const handleDrop = useCallback((_droppedFiles: File[], acceptedFiles: File[], rejectedFiles: File[]) => {
    onChange(acceptedFiles[0]);
    setRejectedFiles(rejectedFiles);
  }, []);

  const validImageTypes = ["image/gif", "image/jpeg", "image/png"];

  const fileUpload = <DropZone.FileUpload />;

  const errorMessage = hasError && (
    <Banner title="The following images couldn’t be uploaded:" status="critical">
      <List type="bullet">
        {rejectedFiles.map((file, index) => (
          <List.Item key={index}>
            {`"${file.name}" is not supported. File type must be .gif, .jpg, .png or .svg.`}
          </List.Item>
        ))}
      </List>
    </Banner>
  );

  return (
    <PFieldInfo helpText={helpText} label={label} error={error}>
      <div className="w-40 h-40 rounded-full overflow-hidden ring-1 ring-border hover:ring-4 hover:ring-primary hover:cursor-pointer">
        <DropZone
          outline={false}
          overlay={false}
          accept="image/*"
          type="image"
          onDrop={handleDrop}
          allowMultiple={false}
        >
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white bg-gray-100">
            {initialImage && !image && <img src={initialImage} className="w-full h-full object-cover" />}
            {image && <img src={window.URL.createObjectURL(image)} className="w-full h-full object-cover" />}
          </div>
        </DropZone>
      </div>
    </PFieldInfo>
  );
}
