import { Text } from "@bbtgnn/polaris-interfacer";
import { LocationsMinor } from "@shopify/polaris-icons";
import classNames from "classnames";

interface Props {
  name: string;
  color?: "subdued" | "primary";
}

export default function LocationText(props: Props) {
  const classes = classNames({
    "flex items-center space-x-0.5": true,
    "text-subdued fill-subdued": props.color === "subdued",
    "text-primary fill-primary": props.color === "primary",
  });

  return (
    <div className={classes}>
      <div className="w-5 h-5 shrink-0">
        <LocationsMinor />
      </div>
      <Text as="p" variant="bodyMd">
        {props.name}
      </Text>
    </div>
  );
}
