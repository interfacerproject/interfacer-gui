import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Button } from "@bbtgnn/polaris-interfacer";
import Link from "next/link";
import { useEffect } from "react";
import BrDisplayUser from "../components/brickroom/BrDisplayUser";
import dayjs from "../lib/dayjs";
import useInBox, { Notification } from "../hooks/useInBox";
import ContributionMessage from "../components/ContributionMessage";
import { useRouter } from "next/router";
import devLog from "lib/devLog";

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

export interface ProposalNotification {
  proposalID: string;
  text: string;
  type?: ProposalType;
  originalResourceName: string;
  originalResourceID: string;
  proposerName: string;
  ownerName?: string;
}

const Notification = () => {
  const { t } = useTranslation("notificationProps");
  const { startReading, messages, setReadedMessages, countUnread, sendMessage } = useInBox();
  useEffect(() => {
    startReading();
    countUnread > 0 &&
      setInterval(() => {
        setReadedMessages(messages.map(m => m.id));
      }, 20000);
  }, [messages]);

  const RenderMessagePerSubject = (props: { message: Notification.Content; sender: string; data: Date }) => {
    const _parsedMessage: ProposalNotification = props.message.message;
    const router = useRouter();

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
      case "Asset cited":
        return (
          <div className="my-2">
            <p className="mr-1">{dayjs(props.data).fromNow()}</p>
            <p className="text-xs">{dayjs(props.data).format("HH:mm DD/MM/YYYY")}</p>
            <div className="flex flex-row my-2 center">
              <div className="mr-2">
                <BrDisplayUser id={props.sender} name={_parsedMessage.proposerName} />
              </div>
              <div className="pt-3.5">
                <span className="mr-1">{"just cited your"}</span>
                <Link href={`/asset/${_parsedMessage.originalResourceID}`}>
                  <a className="text-primary hover:underline">{_parsedMessage.originalResourceName}</a>
                </Link>
              </div>
            </div>
            <p className="text-xs bg-[#E0E0E0] p-2 my-2">{_parsedMessage.text}</p>
            <Button
              primary
              fullWidth
              onClick={() => {
                router.push(`/asset/${_parsedMessage.proposalID}`);
              }}
            >
              {t("take me there")}
            </Button>
          </div>
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
