// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { Button, Card, Text } from "@bbtgnn/polaris-interfacer";
import { BellIcon } from "@heroicons/react/outline";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useEffect } from "react";
import ContributionMessage from "../components/ContributionMessage";
import useInBox from "../hooks/useInBox";

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
  PROJECT_CITED = "Project cited",
}

export interface ProposalNotification {
  proposalID: string;
  text?: string;
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
                        <ContributionMessage message={m.content} sender={m.sender} data={m.content.data} />
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
