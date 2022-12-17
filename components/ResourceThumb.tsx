import { Icon } from "@bbtgnn/polaris-interfacer";
import { DynamicSourceMinor } from "@shopify/polaris-icons";

export interface Props {
  image: string;
  alt?: string;
}

export default function ResourceCardThumb(props: Props) {
  const { image, alt = "" } = props;

  return (
    <div className="w-20 h-20 rounded-md bg-gray-200 overflow-hidden flex items-center justify-center">
      {image && <img src={image} alt={alt} className="w-full h-full object-cover" />}
      {!image && <Icon color="subdued" source={DynamicSourceMinor} />}
    </div>
  );
}
