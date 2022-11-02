import { gql, useQuery } from "@apollo/client";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useEffect } from "react";
import BrDisplayUser from "../components/brickroom/BrDisplayUser";
import dayjs from "../lib/dayjs";
import useInBox from "../hooks/useInBox";

const Notification = () => {
  const { t } = useTranslation("notificationProps");
  const { startReading, messages, setReadedMessages } = useInBox();
  useEffect(() => {
    startReading();
    setInterval(() => {
      setReadedMessages(messages.map(m => m.id));
    }, 20000);
  }, [messages]);
  const ContributionRow = ({
    contribution,
  }: {
    contribution: {
      data: string;
      message: {
        user: { name: string; id: string };
        classifiedAs?: string;
        asset: {
          id: string;
          name: string;
        };
      };
    };
  }) => (
    <div className="pb-2 my-2 border-b-2">
      <p className="mr-1">{dayjs(contribution.data).fromNow()}</p>
      <p className="text-xs">{dayjs(contribution.data).format("HH:mm DD/MM/YYYY")}</p>
      <div className="flex flex-row my-2 center">
        <div className="mr-2">
          <BrDisplayUser id={contribution.message.user?.id} name={contribution.message.user?.name} />
        </div>
        <div className="pt-3">
          <span className="mr-1">{t("added")}</span>
          <Link href={`/asset/${contribution.message.asset.id}`}>
            <a className="text-primary hover:underline">{contribution.message.asset.name}</a>
          </Link>
        </div>
      </div>
    </div>
  );

  const RenderMessagePerSubject = (message: any) => {
    return <ContributionRow contribution={message.message} />;
  };

  return (
    <div className="grid grid-cols-1 p-12">
      {messages.map((m: any) => (
        <RenderMessagePerSubject key={m.id} message={m.content} />
      ))}
    </div>
  );
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["signInProps", "notificationProps", "SideBarProps"])),
    },
  };
}

export default Notification;
