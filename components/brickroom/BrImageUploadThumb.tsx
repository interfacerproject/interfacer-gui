export interface Props {
  name: string;
  preview: string;
}

export default function BrImageUploadThumb(props: Props) {
  const { name, preview } = props;

  return (
    <div className="inline-flex rounded-sm w-24 h-24 p-2" key={name}>
      <div className="flex overflow-hidden min-w-0">
        <img
          src={preview}
          className="block w-auto h-full"
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
