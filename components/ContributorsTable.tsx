import dayjs from "../lib/dayjs";
import BrDisplayUser from "./brickroom/BrDisplayUser";
import BrTable from "./brickroom/BrTable";
import { useTranslation } from "next-i18next";

const ContributorsTable = ({
  contributors,
  title,
  data,
}: {
  contributors?: { name: string; id: string }[];
  title?: string;
  data: any;
}) => {
  const { t } = useTranslation("common");
  return (
    <>
      {title && <h3 className="my-2 my-6">{title}</h3>}
      <BrTable headArray={[t("Username"), t("Date")]}>
        {contributors &&
          contributors.map(contributor => (
            <tr key={contributor.id}>
              <td>
                <BrDisplayUser id={contributor.id} name={contributor.name} />
              </td>
              <td>
                <p className="mr-1">{dayjs(data).fromNow()}</p>
                <p className="text-xs">{dayjs(data).format("HH:mm")}</p>
                <p className="text-xs">{dayjs(data).format("DD/MM/YYYY")}</p>
              </td>
            </tr>
          ))}
      </BrTable>
    </>
  );
};

export default ContributorsTable;
