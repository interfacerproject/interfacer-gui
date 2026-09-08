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
import { useInBoxContext, Notification } from "hooks/useInBox";
import MdParser from "lib/MdParser";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import dayjs from "../lib/dayjs";
import { MessageSubject } from "../pages/notification";
import BrUserDisplay from "./brickroom/BrUserDisplay";

const ContributionMessage = ({
  message,
  sender,
  data,
  id,
}: {
  message: Notification.Content;
  sender: string;
  data: Date;
  id: number;
}) => {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { message: parsedMessage } = message;

  // All display data is included in the notification payload at send time.
  // No GraphQL query needed — avoids N+1 per notification card.
  const commonProps = {
    data,
    userId: sender,
    message: parsedMessage.text,
    resourceName: parsedMessage.originalResourceName || "",
    resourceId: parsedMessage.originalResourceID,
    userName: (parsedMessage as any).proposerName || "",
    proposalId: parsedMessage.proposalID,
    subject: message.subject,
    id: id,
  };

  const makeMessageProps = () => {
    switch (message.subject) {
      case MessageSubject.ADDED_AS_CONTRIBUTOR: {
        const am = message.message as any;
        return {
          ...commonProps,
          resourceName: am.resourceName || commonProps.resourceName,
          resourceId: am.resourceID,
          userName: am.projectOwnerName || commonProps.userName,
          proposalId: undefined,
        };
      }
      case MessageSubject.PROJECT_CITED:
      case MessageSubject.CONTRIBUTION_REQUEST:
      case MessageSubject.CONTRIBUTION_ACCEPTED:
      case MessageSubject.CONTRIBUTION_REJECTED:
        return commonProps;
    }
  };

  const m = makeMessageProps()!;

  const headlinesDict = {
    [MessageSubject.CONTRIBUTION_REQUEST]: t("wants to contribute to your"),
    [MessageSubject.CONTRIBUTION_ACCEPTED]: "✅ " + t("accepted your contribution to"),
    [MessageSubject.CONTRIBUTION_REJECTED]: "❌ " + t("rejected your contribution to"),
    [MessageSubject.ADDED_AS_CONTRIBUTOR]: t("added you as a contributor to"),
    [MessageSubject.PROJECT_CITED]: t("just included your"),
  };

  const hasMessage = Boolean(m.message);
  const request = MessageSubject.CONTRIBUTION_REQUEST === m.subject;
  const { setReadedMessage } = useInBoxContext();

  return (
    <div className="space-y-3">
      <div>
        <p className="mr-1">{dayjs(m.data).fromNow()}</p>
        <div className="flex flex-row items-center space-x-2">
          {m.userId && <BrUserDisplay userId={m.userId} />}
          <p>
            <span className="font-semibold">{m.userName || m.userId} </span>
            {headlinesDict[m.subject as keyof typeof headlinesDict]}
            <Link href={`/project/${m.resourceId}`}>
              <span className="font-semibold cursor-pointer hover:underline">{m.resourceName || m.resourceId}</span>
            </Link>
          </p>
        </div>
      </div>

      {hasMessage && (
        <div className="pl-2 border-l-2 border-gray-200">
          {request ? (
            <div dangerouslySetInnerHTML={{ __html: MdParser.render(m.message || "") }} />
          ) : (
            <p>{m.message}</p>
          )}
        </div>
      )}

      <div className="flex space-x-2">
        {m.proposalId && (
          <Button
            onClick={async () => {
              await setReadedMessage(m.id);
              router.push(`/proposal/${m.proposalId}`);
            }}
          >
            {t("take me there")}
          </Button>
        )}
        {request && (
          <Link href={`/proposal/${m.proposalId}`}>
            <Button primary>{t("Make your call")}</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ContributionMessage;
