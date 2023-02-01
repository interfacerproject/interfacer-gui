import { Icon } from "@bbtgnn/polaris-interfacer";
import { DynamicSourceMinor } from "@shopify/polaris-icons";

export type Size = "xs" | "sm" | "md" | "lg";

export interface Props {
  image: string;
  alt?: string;
  size?: Size;
}

export default function Thumbnail(props: Props) {
  const { image, alt = "", size = "md" } = props;

  const style: Record<Size, string> = {
    xs: "w-6 h-6 rounded-sm",
    sm: "w-12 h-12 rounded-md",
    md: "w-20 h-20 rounded-md",
    lg: "w-32 h-32 rounded-md",
  };

  return (
    <div className={`${style[size]} bg-gray-200 overflow-hidden flex items-center justify-center`}>
      {image && <img src={image} alt={alt} className="w-full h-full object-cover" />}
      {!image && <Icon color="subdued" source={DynamicSourceMinor} />}
    </div>
  );
}
