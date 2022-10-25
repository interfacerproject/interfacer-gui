import { useTranslation } from "next-i18next";
import React, { ReactEventHandler } from "react";

type PopupPops = {
  name: string;
  action1: string;
  action2?: ReactEventHandler;
  buttons?: any;
  children?: any;
  svg?: React.ReactNode;
  disabled?: boolean;
  outlined?: boolean;
  XL?: boolean;
};

function Popup({ name, action1, action2, buttons, children, svg, disabled, outlined, XL }: PopupPops) {
  const { t } = useTranslation("common");
  const larger = XL ? "w-156 max-w-5xl" : "";
  const disabledClass = disabled ? "btn-disabled" : "";
  const outlinedClass = outlined ? "btn-outline" : "";
  const x = "x";
  return (
    <>
      <label
        htmlFor={name}
        className={`btn modal-button text-normal font-medium normal-case ${disabledClass} ${outlinedClass}`}
        onClick={action2}
      >
        {action1}
        {svg}
      </label>
      <input type="checkbox" id={name} className="modal-toggle" />
      <div className="modal">
        <div className={`pt-10 modal-box ${larger}`}>
          <label htmlFor={name} className="absolute btn btn-sm btn-outline btn-square right-2 top-2">
            {x}
          </label>
          {children}
          <div className="modal-action">{buttons}</div>
        </div>
      </div>
    </>
  );
}

export default Popup;
