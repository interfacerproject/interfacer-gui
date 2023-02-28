import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import dayjs from "../lib/dayjs";

const ProjectTime = (props: { projectNode: EconomicResource }) => {
  const e = props.projectNode;
  const { t } = useTranslation("common");

  // @ts-ignore
  const hasTime = e.trace?.filter((t: any) => !!t.hasPointInTime)[0].hasPointInTime;
  const formatted = dayjs(hasTime).format("HH:mm DD/MM/YYYY");

  return (
    <div>
      <div className="font-sans">
        <span className="font-normal">{t("Last updated")}</span>{" "}
        <span className="font-medium">{dayjs(hasTime).fromNow()}</span>
      </div>
      <span className="text-xs">{formatted}</span>
    </div>
  );
};

export default ProjectTime;
