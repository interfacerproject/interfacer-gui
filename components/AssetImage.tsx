interface Image {
  hash: string;
  mimeType: string;
  bin: string;
}

const AssetImage = ({ image, className }: { image: Image | string; className?: string }) => {
  const src = typeof image === "string" ? image : `data:${image.mimeType};base64,${image.bin}`;
  return (
    <>
      <img src={src} className={className} />
    </>
  );
};

export default AssetImage;
