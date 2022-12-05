import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Button } from "@bbtgnn/polaris-interfacer";
import Link from "next/link";
import { useEffect } from "react";
import BrDisplayUser from "../components/brickroom/BrDisplayUser";
import dayjs from "../lib/dayjs";
import useInBox, { Notification } from "../hooks/useInBox";
import { useRouter } from "next/router";

export enum ProposalType {
  HARDWARE_IMPROVEMENT = "Hardware Improvement",
  SOFTWARE_IMPROVEMENT = "Software Improvement",
  DOCUMENTATION_IMPROVEMENT = "Documentation Improvement",
  OTHER = "Other",
}

export interface Proposal {
  ID: string;
  senderID: string;
  receiverID: string;
  parentRepositoryID: string;
  repoURL: string;
  type: ProposalType;
  description: string;
  workHours: number;
  strengthPoints: number;
  status: string;
}

export interface ProposalNotification {
  proposalID: string;
  text: string;
  type: ProposalType;
  originalResourceName: string;
  originalResourceID: string;
  proposerName: string;
}

const FakeProposal: Proposal = {
  ID: "123",
  senderID: "123",
  receiverID: "123",
  parentRepositoryID: "123",
  repoURL: "123",
  type: ProposalType.HARDWARE_IMPROVEMENT,
  description: "123",
  workHours: 123,
  strengthPoints: 123,
  status: "123",
};

const FakeMessage: ProposalNotification = {
  proposalID: "123",
  text: "test",
  type: ProposalType.HARDWARE_IMPROVEMENT,
  originalResourceName: "ZACplus",
  originalResourceID: "062AN5TMJM0FA92DT85QCQ6H2G",
  proposerName: "Nenno",
};

const Notification = () => {
  const { t } = useTranslation("notificationProps");
  const { startReading, messages, setReadedMessages, countUnread } = useInBox();
  useEffect(() => {
    startReading();
    countUnread > 0 &&
      setInterval(() => {
        setReadedMessages(messages.map(m => m.id));
      }, 20000);
  }, [messages]);
  const ContributionRow = ({ contribution }: any) => (
    <div className="pb-2 my-2 border-b-2">
      <p className="mr-1">{dayjs(contribution.data).fromNow()}</p>
      <p className="text-xs">{dayjs(contribution.data).format("HH:mm DD/MM/YYYY")}</p>
      <div className="flex flex-row my-2 center">
        <div className="mr-2">
          <BrDisplayUser id={contribution.message.user?.id} name={contribution.message.user?.name} />
        </div>
        <div className="pt-3">
          <span className="mr-1">{t("added you as contributor to")}</span>
          <Link href={`/asset/${contribution.message.asset.id}`}>
            <a className="text-primary hover:underline">{contribution.message.asset.name}</a>
          </Link>
        </div>
      </div>
    </div>
  );

  const RenderMessagePerSubject = (props: { message: Notification.Content; sender: string; data: Date }) => {
    switch (props.message.subject) {
      case "contribution":
        return <ContributionRow contribution={props.message} />;
      case "contributionRequest":
        return <RenderContributionRequest {...props} />;
      default:
        return <div />;
    }
  };

  return (
    <div className="grid grid-cols-1 p-12">
      {/*<Button*/}
      {/*  primary*/}
      {/*  onClick={() => sendMessage(JSON.stringify(FakeMessage), ["0628KS3FG5FT2QD1CHRJBBFD88"], "contributionRequest")}*/}
      {/*>*/}
      {/*  {t("sendFakeMessage")}*/}
      {/*</Button>*/}
      {messages.map((m: any) => (
        <>
          <RenderMessagePerSubject key={m.id} message={m.content} sender={m.sender} data={m.date} />
        </>
      ))}
    </div>
  );
};

const RenderContributionRequest = ({
  message,
  sender,
  data,
}: {
  message: Notification.Content;
  sender: string;
  data: Date;
}) => {
  const _parsedMessage: ProposalNotification = JSON.parse(message.message);
  const router = useRouter();

  return (
    <div className="pb-2 my-2 border-b-2">
      <p className="mr-1">{dayjs(data).fromNow()}</p>
      <p className="text-xs">{dayjs(data).format("HH:mm DD/MM/YYYY")}</p>
      <div className="flex flex-row my-2 center">
        <div className="mr-2">
          <BrDisplayUser id={sender} name={_parsedMessage.proposerName} />
        </div>
        <div className="pt-3">
          <span className="mr-1">{"want to contribute to your"}</span>
          <Link href={`/asset/${_parsedMessage.originalResourceID}`}>
            <a className="text-primary hover:underline">{_parsedMessage.originalResourceName}</a>
          </Link>
        </div>
      </div>
      <p>{_parsedMessage.text}</p>
      <p>
        {"this is a "}
        {_parsedMessage.type}
      </p>
      <p>{`let ${_parsedMessage.proposalID} knows about your decision`}</p>
      <Button
        primary
        onClick={() => {
          router.push("/");
        }}
      >
        {"review"}
      </Button>
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
