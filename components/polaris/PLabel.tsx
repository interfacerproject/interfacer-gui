import { HtmlForProp as HP } from "./types";

export interface PLabelProps extends HP {
  label?: string;
  requiredIndicator?: boolean;
}

export default function PLabel({ htmlFor, label, requiredIndicator = false }: PLabelProps) {
  return (
    <div className="Polaris-Labelled__LabelWrapper">
      <div className="Polaris-Label">
        <label
          id={`${htmlFor}Label`}
          htmlFor={htmlFor}
          className={`Polaris-Label__Text ${requiredIndicator ? "Polaris-Label__RequiredIndicator" : ""}`}
        >
          <span className="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular">{label}</span>
        </label>
      </div>
    </div>
  );
}
