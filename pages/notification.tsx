import { Button, Card, Text } from "@bbtgnn/polaris-interfacer";
import { BellIcon } from "@heroicons/react/outline";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import BrDisplayUser from "../components/brickroom/BrDisplayUser";
import ContributionMessage from "../components/ContributionMessage";
import useInBox, { Notification } from "../hooks/useInBox";
import dayjs from "../lib/dayjs";

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
  ADDED_AS_CONTRIBUTOR = "addedAsContributor",
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

export interface AddedAsContributorNotification {
  projectOwnerId: string;
  text: string;
  resourceName: string;
  resourceID: string;
  ownerName?: string;
  projectOwnerName?: string;
}

export enum MessageGroup {
  CONTRIBUTION_REQUESTS = "contributionRequests",
  CONTRIBUTION_RESPONSES = "contributionResponses",
  CITATIONS = "citations",
  ADDED_AS_CONTRIBUTOR = "addedAsContributor",
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

  //

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
      case MessageSubject.ADDED_AS_CONTRIBUTOR:
        const _parsedMessage2: AddedAsContributorNotification = props.message.message;
        return (
          <ContributionMessage
            data={props.data}
            resourceName={_parsedMessage2.resourceName}
            resourceId={_parsedMessage2.resourceID}
            userName={_parsedMessage2.projectOwnerName!}
            userId={props.sender}
            proposalId={_parsedMessage2.projectOwnerId}
            message={_parsedMessage2.text}
            subject={props.message.subject}
          />
        );
      case "Project cited":
        return (
          <div>
            <p className="mr-1">{dayjs(props.data).fromNow()}</p>
            <p className="text-xs">{dayjs(props.data).format("HH:mm DD/MM/YYYY")}</p>
            <div className="flex flex-row my-2 center">
              <div className="mr-2">
                <BrDisplayUser id={props.sender} name={_parsedMessage.proposerName} />
              </div>
              <div className="pt-3.5">
                <span className="mr-1">{t("just mentioned your")}</span>
                <Link href={`/project/${_parsedMessage.originalResourceID}`}>
                  <a className="text-primary hover:underline">{_parsedMessage.originalResourceName}</a>
                </Link>
              </div>
            </div>
            <p className="text-xs bg-[#E0E0E0] p-2 my-2">{_parsedMessage.text}</p>
            <Button
              fullWidth
              onClick={() => {
                router.push(`/project/${_parsedMessage.proposalID}`);
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

  /* Message grouping */

  type Message = typeof messages[number];

  const groupedMessages: Record<MessageGroup, Array<Message>> = {
    [MessageGroup.CONTRIBUTION_REQUESTS]: [],
    [MessageGroup.CONTRIBUTION_RESPONSES]: [],
    [MessageGroup.CITATIONS]: [],
    [MessageGroup.ADDED_AS_CONTRIBUTOR]: [],
  };

  function clearGroupedMessages() {
    groupedMessages.contributionRequests = [];
    groupedMessages.contributionResponses = [];
    groupedMessages.citations = [];
  }

  function groupMessagesBySubject(messages: Array<Message>): Record<MessageGroup, Array<Message>> {
    // Contribution requests
    for (let m of messages) {
      if (m.content.subject === MessageSubject.CONTRIBUTION_REQUEST) {
        groupedMessages.contributionRequests.push(m);
      } else if (
        m.content.subject === MessageSubject.CONTRIBUTION_ACCEPTED ||
        m.content.subject === MessageSubject.CONTRIBUTION_REJECTED
      ) {
        groupedMessages.contributionResponses.push(m);
      } else if (m.content.subject === "Project cited") {
        groupedMessages.citations.push(m);
      } else if (m.content.subject === MessageSubject.ADDED_AS_CONTRIBUTOR) {
        groupedMessages.addedAsContributor.push(m);
      }
    }
    //
    return groupedMessages;
  }

  groupMessagesBySubject(messages);

  useEffect(() => {
    clearGroupedMessages();
    groupMessagesBySubject(messages);
  }, [messages]);

  const groupsLabels: Record<MessageGroup, string> = {
    [MessageGroup.CONTRIBUTION_REQUESTS]: t("Contribution Requests"),
    [MessageGroup.CONTRIBUTION_RESPONSES]: t("Contribution Responses"),
    [MessageGroup.CITATIONS]: t("Citations"),
    [MessageGroup.ADDED_AS_CONTRIBUTOR]: t("Added as contributor"),
  };

  /* Empty state */

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[90vh] space-y-2 text-gray-500">
        <BellIcon className="w-5 h-5" />
        <Text as="p" variant="bodyLg">
          {t("No notifications at the moment :)")}
        </Text>
        <Link href="/">
          <Button plain>{t("Go to home page")}</Button>
        </Link>
      </div>
    );
  }

  /* Main render */

  return (
    <div className="flex flex-wrap mx-auto justify-center">
      <div className="flex flex-col p-6 space-y-1 sticky top-0 self-start z-50">
        {Object.entries(groupedMessages).map(([groupName, group]) => (
          <Button key={groupName} url={`#${groupName}`}>
            {/* @ts-ignore */}
            {groupsLabels[groupName]}
            {` (${group.length})`}
          </Button>
        ))}
      </div>

      <div className="max-w-lg p-6 space-y-8">
        {Object.entries(groupedMessages).map(([groupName, group]) => (
          <>
            {group.length > 0 && (
              <div key={groupName}>
                <Text id={groupName} as="h2" variant="headingMd">
                  {/* @ts-ignore */}
                  {groupsLabels[groupName]}
                  {` (${group.length})`}
                </Text>

                <div className="mt-4">
                  {group.map((m: any) => (
                    <Card key={m.id}>
                      <div className="p-4">
                        <RenderMessagePerSubject message={m.content} sender={m.sender} data={m.content.data} />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        ))}
      </div>
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
