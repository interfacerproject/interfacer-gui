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

import { Button } from "@bbtgnn/polaris-interfacer";
import cn from "classnames";
import { Notification } from "hooks/useInBox";
import MdParser from "lib/MdParser";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import dayjs from "../lib/dayjs";
import { AddedAsContributorNotification, MessageSubject } from "../pages/notification";
import BrDisplayUser from "./brickroom/BrDisplayUser";

type ContributionMessageProps = {
  data: Date;
  userName: string;
  userId: string;
  resourceId: string;
  resourceName: string;
  proposalId: string;
  message: string;
  subject: MessageSubject;
};
const ContributionMessage = ({
  message,
  sender,
  data,
}: {
  message: Notification.Content;
  sender: string;
  data: Date;
}) => {
  const router = useRouter();
  const { t } = useTranslation("notificationProps");
  const { message: parsedMessage } = message;
  const commonProps = {
    data,
    userId: sender,
    message: parsedMessage.text,
    resourceName: parsedMessage.originalResourceName,
    resourceId: parsedMessage.originalResourceID,
    userName: parsedMessage.proposerName,
    proposalId: parsedMessage.proposalID,
    subject: message.subject,
  };

  const makeMessageProps = () => {
    switch (message.subject) {
      case MessageSubject.ADDED_AS_CONTRIBUTOR:
        const { message: addedAsContributorMessage } = message;
        return {
          ...commonProps,
          resourceName: addedAsContributorMessage.resourceName,
          resourceId: addedAsContributorMessage.resourceID,
          userName: addedAsContributorMessage.projectOwnerName!,
          proposalId: addedAsContributorMessage.projectOwnerId,
        };
      case MessageSubject.PROJECT_CITED:
        return commonProps;
      case MessageSubject.CONTRIBUTION_REQUEST:
      case MessageSubject.CONTRIBUTION_ACCEPTED:
      case MessageSubject.CONTRIBUTION_REJECTED:
        return commonProps;
    }
  };

  const m = makeMessageProps()!;

  const headlinesDict = {
    [MessageSubject.CONTRIBUTION_REQUEST]: t("wants to contribute to your"),
    [MessageSubject.CONTRIBUTION_ACCEPTED]: "✅" + t("accepted your contribution to"),
    [MessageSubject.CONTRIBUTION_REJECTED]: "❌" + t("rejected your contribution to"),
    [MessageSubject.ADDED_AS_CONTRIBUTOR]: t("added you as a contributor to"),
    [MessageSubject.PROJECT_CITED]: t("just mentioned your"),
  };
  const className = cn({
    "": m.subject === MessageSubject.CONTRIBUTION_REQUEST,
    "bg-success": m.subject === MessageSubject.CONTRIBUTION_ACCEPTED,
    "bg-error": m.subject === MessageSubject.CONTRIBUTION_REJECTED,
  });

  const hasMessage = m.subject === MessageSubject.CONTRIBUTION_REQUEST || m.subject === MessageSubject.PROJECT_CITED;
  const request = MessageSubject.CONTRIBUTION_REQUEST === m.subject;

  return (
    <div className="space-y-3">
      <div>
        <p className="mr-1">{dayjs(m.data).fromNow()}</p>
        <p className="text-xs">{dayjs(m.data).format("HH:mm DD/MM/YYYY")}</p>
      </div>
      <div className="flex flex-row my-2 center">
        <div className="mr-2">
          <BrDisplayUser id={m.userId} name={m.userName} />
        </div>
        <div className="pt-3.5">
          <span className="mr-1">{headlinesDict[m.subject as MessageSubject]}</span>
          <Link href={`/project/${m.resourceId}`}>
            <a className="text-primary hover:underline break-all">{m.resourceName}</a>
          </Link>
        </div>
      </div>
      {hasMessage && (
        <p className="text-xs bg-[#E0E0E0] p-2 my-2 overflow-x-scroll">
          <div dangerouslySetInnerHTML={{ __html: MdParser.render(m.message) }} />
        </p>
      )}
      {request && <p>{t("Make your call")}</p>}
      {request && (
        <Button
          fullWidth
          onClick={() => {
            router.replace(`/proposal/${m.proposalId}`);
          }}
        >
          {t("Review")}
        </Button>
      )}{" "}
      {!request && (
        <Button
          fullWidth
          onClick={() => {
            router.replace(`/project/${m.resourceId}`);
          }}
        >
          {t("take me there")}
        </Button>
      )}
    </div>
  );
};

export default ContributionMessage;
