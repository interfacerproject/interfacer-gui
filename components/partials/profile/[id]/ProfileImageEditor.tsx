import { DropZone } from "@bbtgnn/polaris-interfacer";
import { Upload } from "@carbon/icons-react";
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

  return (
    <PFieldInfo helpText={helpText} label={label} error={error}>
      <div className="w-40 h-40 rounded-full overflow-hidden ring-1 ring-border hover:ring-4 hover:ring-primary hover:cursor-pointer">
        <DropZone
          outline={false}
          overlay={false}
          accept={validImageTypes.join(", ")}
          type="image"
          onDrop={handleDrop}
          allowMultiple={false}
        >
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white bg-gray-100 group">
            {initialImage && !image && <img src={initialImage} className="w-full h-full object-cover" />}
            {image && <img src={window.URL.createObjectURL(image)} className="w-full h-full object-cover" />}
            <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white flex flex-col items-center justify-center shadow-md group-hover:bg-yellow-200">
                <Upload size={32} />
              </div>
            </div>
          </div>
        </DropZone>
      </div>
    </PFieldInfo>
  );
}
