import { HtmlForProp as HP } from "./types";

export interface PErrorProps extends HP {
  error?: string;
}

export default function PError({ error, htmlFor }: PErrorProps) {
  return (
    <div className="Polaris-Labelled__Error">
      <div id={`${htmlFor}Error`} className="Polaris-InlineError">
        <div className="Polaris-InlineError__Icon">
          <span className="Polaris-Icon">
            <span className="Polaris-Text--root Polaris-Text--bodySm Polaris-Text--regular Polaris-Text--visuallyHidden"></span>
            <svg viewBox="0 0 20 20" className="Polaris-Icon__Svg" focusable="false" aria-hidden="true">
              <path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-9a1 1 0 0 0 2 0v-2a1 1 0 1 0-2 0v2zm0 4a1 1 0 1 0 2 0 1 1 0 0 0-2 0z"></path>
            </svg>
          </span>
        </div>
        {error}
      </div>
    </div>
  );
}
