import BrFieldError from "./BrFieldError";
import { ChildrenComponent, TestProp } from "./types";

export interface BrFieldInfoProps extends TestProp {
  for?: string;
  label?: string;
  hint?: string;
  error?: string | any;
  help?: string;
}

export default function BrFieldInfo(props: ChildrenComponent<BrFieldInfoProps>) {
  const { hint, help, error, testID = "info" } = props;

  // Building test-ids
  const labelID = testID + "-label";
  const errorID = testID + "-error";
  const hintID = testID + "-hint";
  const helpID = testID + "-help";

  return (
    <div className="flex flex-col items-stretch justify-start space-y-2">
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

          {/* Error */}
          {error && <BrFieldError testID={errorID} message={error} />}
        </label>
      )}
    </div>
  );
}
