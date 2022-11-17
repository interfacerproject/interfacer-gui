import PError, { PErrorProps } from "./PError";
import PHelp, { PHelpProps } from "./PHelp";
import PLabel, { PLabelProps } from "./PLabel";
import { ChildrenProp as CP } from "./types";

export interface PFieldInfoProps extends PLabelProps, PErrorProps, PHelpProps, CP {}

export default function PFieldInfo(props: PFieldInfoProps) {
  return (
    <div>
      {props.label && <PLabel {...props} />}
      {props.children}
      {props.error && <PError {...props} />}
      {props.helpText && <PHelp {...props} />}
    </div>
  );
}
