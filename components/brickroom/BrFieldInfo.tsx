import { ExclamationIcon } from "@heroicons/react/solid";
import { ChildrenComponent } from "./utils";

export interface BrFieldInfoProps {
  for?: string;
  label?: string;
  hint?: string;
  error?: string | any;
  help?: string;
}

export default function BrFieldInfo(props: ChildrenComponent<BrFieldInfoProps>) {
  return (
    <div className="flex flex-col items-start justify-start space-y-2">
      {/* Label */}
      <label className="" htmlFor={props.for}>
        <h4 className="label-text">{props.label}</h4>
      </label>

      {/* Slot for content */}
      {props.children}

      {/* Info under field */}
      <label htmlFor={props.for} className="space-y-2">
        {/* Error */}
        {props.error && (
          <span className="flex flex-row text-warning pt-1">
            <ExclamationIcon className="w-5 h-5" />
            <p className="ml-2 label-text-alt text-warning">{props.error}</p>
          </span>
        )}

        {/* Hints */}
        {props.hint && <span className="label-text-alt">{props.hint}</span>}

        {/* Help */}
        {props.help && <p className="text-[#8A8E96]">{props.help}</p>}
      </label>
    </div>
  );
}
