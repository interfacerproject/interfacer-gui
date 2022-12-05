import dayjs from "../lib/dayjs";
import BrDisplayUser from "./brickroom/BrDisplayUser";
import BrTable from "./brickroom/BrTable";
import { useTranslation } from "next-i18next";

const ContributorsTable = ({
  contributors,
  title,
}: {
  contributors?: { name: string; id: string }[];
  title?: string;
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
              <td></td>
            </tr>
          ))}
      </BrTable>
    </>
  );
};

export default ContributorsTable;
