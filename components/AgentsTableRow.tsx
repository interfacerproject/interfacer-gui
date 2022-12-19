import React from "react";
import Link from "next/link";
import Avatar from "boring-avatars";
import { useTranslation } from "next-i18next";

const AgentsTableRow = (props: any) => {
  const e = props.agent.node;
  const { t } = useTranslation("common");
  return (
    <>
      {e && (
        <tr>
          <td>
            <div className="w-9 hover:w-14">
              <Avatar
                size={"full"}
                name={e.name}
                variant="beam"
                colors={["#F1BD4D", "#D8A946", "#02604B", "#F3F3F3", "#014837"]}
              />
            </div>
          </td>
          <td className="">
            <Link href={e.id}>
              <a>{e.name}</a>
            </Link>
          </td>
          <td className="max-w-[12rem]">{e.id}</td>
          <td>{e.primaryLocation?.name || t("no location provide")}</td>
        </tr>
      )}
    </>
  );
};

export default AgentsTableRow;
