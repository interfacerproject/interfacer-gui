export interface Props {
  name: string;
  preview: string;
}

export default function BrImageUploadThumb(props: Props) {
  const { name, preview } = props;

  return (
    <div className="inline-flex rounded-sm w-24 h-24 p-2">
      <div className="flex overflow-hidden min-w-0">
        <img
          src={preview}
          className="block w-auto h-full border-[1px] border-gray-300"
          alt={name}
          // Revoke data uri after image is loaded
          onLoad={() => {
            URL.revokeObjectURL(preview);
          }}
        />
      </div>
    </div>
  );
}
