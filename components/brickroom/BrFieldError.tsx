import { ExclamationIcon } from "@heroicons/react/solid";

export interface BrFieldErrorProps {
  testID?: string;
  message: string;
}

export default function BrFieldError(props: BrFieldErrorProps) {
  const { testID = "fieldError", message } = props;

  return (
    <div className="flex flex-row text-warning pt-1" data-test={testID}>
      <ExclamationIcon className="w-5 h-5" />
      <p className="ml-2 label-text-alt text-warning">{message}</p>
    </div>
  );
}
