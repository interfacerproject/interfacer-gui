import { HtmlForProp as HP } from "./types";

export interface PHelpProps extends HP {
  helpText?: string;
}

export default function PHelp({ helpText, htmlFor }: PHelpProps) {
  return (
    <div className="Polaris-Labelled__HelpText" id={`${htmlFor}HelpText`}>
      <span className="Polaris-Text--root Polaris-Text--bodyMd Polaris-Text--regular Polaris-Text--break Polaris-Text--subdued">
        {helpText}
      </span>
    </div>
  );
}
