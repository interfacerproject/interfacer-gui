import { ChildrenComponent as CC } from "components/brickroom/types";

export interface SeedBoxProps {}

export default function SeedBox(props: CC<SeedBoxProps>) {
  return (
    <span className="block p-4 mt-2 font-mono bg-white border rounded-md" data-test="passphrase">
      {props.children}
    </span>
  );
}
