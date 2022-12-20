import { useTranslation } from "next-i18next";
import { useEffect, useRef } from "react";

const ControlWindow = ({ logs }: { logs: Array<string> }) => {
  const { t } = useTranslation("createProjectProps");
  const bottomRef = useRef<null | HTMLDivElement>(null);

  const colors = ["error", "success", "warning", "info"];
  const logsClass = (text: string) =>
    colors.includes(text.split(":")[0]) ? `text-${text.split(":")[0]} uppercase my-3` : "my-2";

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [logs]);

  return (
    <div data-test="controlWindow">
      <div className="text-error text-success text-warning text-info" />
      <div className="w-full px-2 pb-2 bg-white border-2 md:w-128 md:fixed">
        <h4 className="my-2 capitalize text-primary">{t("control window")}</h4>
        <div className="overflow-y-scroll font-mono border-2 max-h-80 bg-[#F7F7F7] p-2">
          {logs.map((l, index) => (
            <p key={index} className={logsClass(l)}>
              {l}
            </p>
          ))}
          <div ref={bottomRef} className="list-bottom"></div>
        </div>
      </div>
    </div>
  );
};

export default ControlWindow;
