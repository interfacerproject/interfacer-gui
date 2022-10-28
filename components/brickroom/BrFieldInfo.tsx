import { ExclamationIcon } from "@heroicons/react/solid";
import { ChildrenComponent } from "./types";

export interface BrFieldInfoProps {
  for?: string;
  label?: string;
  hint?: string;
  error?: string | any;
  help?: string;
  testID?: string;
}

export default function BrFieldInfo(props: ChildrenComponent<BrFieldInfoProps>) {
  const { hint, help, error, testID = "info" } = props;

  // Building test-ids
  const labelID = testID + "-label";
  const errorID = testID + "-error";
  const hintID = testID + "-hint";
  const helpID = testID + "-help";

  return (
    <div className="flex flex-col items-start justify-start space-y-2">
      {/* Label */}
      {props.label && (
        <label className="" htmlFor={props.for} data-test={labelID}>
          <h4 className="label-text">{props.label}</h4>
        </label>
      )}

      {/* Slot for content */}
      {props.children}

      {/* Info under field */}
      {(error || hint || help) && (
        <label htmlFor={props.for} className="space-y-2">
          {/* Error */}
          {error && (
            <span className="flex flex-row text-warning pt-1" data-test={errorID}>
              <ExclamationIcon className="w-5 h-5" />
              <p className="ml-2 label-text-alt text-warning">{error}</p>
            </span>
          )}

          {/* Hints */}
          {hint && (
            <span className="label-text-alt" data-test={hintID}>
              {hint}
            </span>
          )}

          {/* Help */}
          {help && (
            <p className="text-[#8A8E96]" data-test={helpID}>
              {help}
            </p>
          )}
        </label>
      )}
    </div>
  );
}
