import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useEffect } from "react";
import BrDisplayUser from "../components/brickroom/BrDisplayUser";
import dayjs from "../lib/dayjs";
import useInBox, { Notification } from "../hooks/useInBox";
import devLog from "lib/devLog";
import ContributionMessage from "../components/ContributionMessage";

export enum ProposalType {
  HARDWARE_IMPROVEMENT = "Hardware Improvement",
  SOFTWARE_IMPROVEMENT = "Software Improvement",
  DOCUMENTATION_IMPROVEMENT = "Documentation Improvement",
  OTHER = "Other",
}

export enum MessageSubject {
  CONTRIBUTION_REQUEST = "contributionRequest",
  CONTRIBUTION_ACCEPTED = "contributionAccepted",
  CONTRIBUTION_REJECTED = "contributionRejected",
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
  type?: ProposalType;
  originalResourceName: string;
  originalResourceID: string;
  proposerName: string;
  ownerName: string;
}

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
    const _parsedMessage: ProposalNotification = props.message.message;

    switch (props.message.subject) {
      case MessageSubject.CONTRIBUTION_REQUEST:
      case MessageSubject.CONTRIBUTION_ACCEPTED:
      case MessageSubject.CONTRIBUTION_REJECTED:
        return (
          <ContributionMessage
            data={props.data}
            resourceName={_parsedMessage.originalResourceName}
            resourceId={_parsedMessage.originalResourceID}
            userName={_parsedMessage.proposerName}
            userId={props.sender}
            proposalId={_parsedMessage.proposalID}
            message={_parsedMessage.text}
            subject={props.message.subject}
          />
        );
      default:
        return <div />;
    }
  };

  return (
    <div className="mx-auto max-w-lg p-6">
      {messages.map((m: any) => (
        <>
          <RenderMessagePerSubject key={m.id} message={m.content} sender={m.sender} data={m.content.data} />
        </>
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
