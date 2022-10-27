import { ChildrenComponent as CC, TestProp as TP } from "./utils";

export interface BrErrorProps extends TP {}

export default function BrError(props: CC<BrErrorProps>) {
  return (
    <div className="block bg-red-200 border-[1px] border-red-600 rounded-md p-4" data-test={props.testID}>
      <p className="text-red-600">{props.children}</p>
    </div>
  );
}
