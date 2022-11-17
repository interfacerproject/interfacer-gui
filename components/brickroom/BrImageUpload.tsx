import { useTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";
import { ErrorCode, FileError, FileRejection, useDropzone } from "react-dropzone";

// Components
import PError from "components/polaris/PError";
import PFieldInfo, { PFieldInfoProps } from "components/polaris/PFieldInfo";
import BrImageUploadEmptyState from "./BrImageUploadEmptyState";
import BrImageUploadThumb from "./BrImageUploadThumb";
import { TestProp as TP } from "./types";

//

interface ImgFile extends File {
  preview: string;
}

interface BrImageUploadProps extends PFieldInfoProps, TP {
  onDrop?: (acceptedFiles: Array<File>, fileRejections?: FileRejection) => void;
  id?: string;
}

//

const BrImageUpload = React.forwardRef<HTMLInputElement, BrImageUploadProps>((props, ref) => {
  const { t } = useTranslation("BrImageUploadProps");

  const { onDrop = () => {} } = props;
  const [files, setFiles] = useState<Array<ImgFile>>([]);

  // Dropzone setup
  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".svg", ".gif"],
    },
    maxFiles: 10,
    maxSize: 2 * 1024 * 1024 + 10,
    onDrop: (acceptedFiles, fileRejections) => {
      // Running onDrop function
      // @ts-ignore
      onDrop(acceptedFiles, fileRejections);
      // Adding "preview" field to files, needed for thumbnails
      const newFiles = acceptedFiles.map(file =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      // Setting files
      // @ts-ignore
      setFiles(newFiles);
    },
  });

  // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
  useEffect(() => {
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, []);

  /* Error translation management */

  function errorTranslator(e: FileError): string {
    // Listing errors and translations
    const errors: Record<ErrorCode | string, string> = {
      "file-invalid-type": t("Invalid file type"),
      "file-too-large": t("File too large"),
      "file-too-small": t("File too small"),
      "too-many-files": t("Too many files"),
    };

    if (errors[e.code]) return errors[e.code];
    else return e.message;
  }

  function rejectionFormatter(r: FileRejection): Array<string> {
    return r.errors.map(e => {
      return `${r.file.name} (${r.file.size}) – ${errorTranslator(e)}`;
    });
  }

  //

  return (
    <PFieldInfo {...props}>
      {/* Dropdown zone */}
      <section className="p-2 border-[1px] border-gray-300 rounded-md hover:bg-gray-200 hover:cursor-pointer">
        {/* Dropdown area */}
        <div {...getRootProps({ className: "dropzone" })} data-test={props.testID}>
          <input {...getInputProps()} ref={ref} id={props.id} />

          {/* If there are no files, show empty state */}
          {files.length == 0 && <BrImageUploadEmptyState />}

          {/* If there are files, show thumbnails */}
          {files.length > 0 && (
            <div>
              {files.map(file => (
                <BrImageUploadThumb {...file} key={file.name} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Errors */}
      {fileRejections.length > 0 && (
        <div>
          {fileRejections.map(r => (
            <React.Fragment key={r.file.name}>
              {rejectionFormatter(r).map(s => (
                <PError error={s} key={s} />
              ))}
            </React.Fragment>
          ))}
        </div>
      )}
    </PFieldInfo>
  );
});

//

BrImageUpload.displayName = "BrImageUpload";
export default BrImageUpload;
