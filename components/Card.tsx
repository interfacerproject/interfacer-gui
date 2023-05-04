import { ChildrenProp } from "./brickroom/types";

export default function Card(props: ChildrenProp) {
  return <div className="bg-white rounded-md border-1 border-border-subdued">{props.children}</div>;
}
